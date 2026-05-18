package presendguard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import presendguard.domain.Prompt;
import presendguard.dto.DashboardResponseDto;
import presendguard.dto.PromptResponseDto;
import presendguard.repository.PromptRepository;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PromptService {

    private final PromptRepository promptRepository;

    private static final Pattern REASON_PATTERN = Pattern.compile("(\\w+)\\s*:\\s*(\\d+)");

    /** 카테고리 키 → 한글 이름 매핑 */
    private static final Map<String, String> CATEGORY_NAMES = Map.ofEntries(
            Map.entry("phone", "전화번호"),
            Map.entry("email", "이메일"),
            Map.entry("rrn", "주민등록번호"),
            Map.entry("card", "카드번호"),
            Map.entry("account", "계좌번호"),
            Map.entry("passport", "여권번호"),
            Map.entry("business", "사업자번호"),
            Map.entry("ip", "IP주소"),
            Map.entry("name", "이름"),
            Map.entry("person", "이름"),
            Map.entry("org", "기관/회사"),
            Map.entry("organization", "기관/회사"),
            Map.entry("location", "지역명"),
            Map.entry("loc", "지역명")
    );

    // ============================================
    // 🌐 페이징 목록 (전체 vs 사용자별)
    // ============================================

    /** 페이징 목록 - 전체 */
    @Transactional(readOnly = true)
    public Page<PromptResponseDto> getPrompts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return promptRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PromptResponseDto::new);
    }

    /** ⭐ 페이징 목록 - 사용자별 */
    @Transactional(readOnly = true)
    public Page<PromptResponseDto> getPromptsByUser(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return promptRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(PromptResponseDto::new);
    }

    // ============================================
    // 📄 단건 조회 (전체 vs 사용자별)
    // ============================================

    /** 단건 조회 - 관리자용 */
    @Transactional(readOnly = true)
    public PromptResponseDto getPrompt(Long id) {
        Prompt p = promptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 프롬프트를 찾을 수 없습니다. id=" + id));
        return new PromptResponseDto(p);
    }

    /** ⭐ 단건 조회 - 본인 거만 (보안) */
    @Transactional(readOnly = true)
    public PromptResponseDto getPromptByUser(String userId, Long id) {
        Prompt p = promptRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 프롬프트를 찾을 수 없거나 접근 권한이 없습니다. id=" + id));
        return new PromptResponseDto(p);
    }

    // ============================================
    // 📊 대시보드 (전체 vs 사용자별)
    // ============================================

    /** 대시보드 - 전체 (관리자/공개용) */
    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboard(int days) {
        return getDashboardInternal(null, days);
    }

    /** ⭐ 대시보드 - 본인 데이터만 */
    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboardByUser(String userId, int days) {
        return getDashboardInternal(userId, days);
    }

    /**
     * 내부 통합 대시보드 메서드.
     * userId == null → 전체 데이터 (기존 동작)
     * userId != null → 본인 데이터만 (개인 대시보드)
     */
    private DashboardResponseDto getDashboardInternal(String userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        // ===== 카운트 (5종 verdict 모두) =====
        long total = countTotal(userId, since);
        long allow = countVerdict(userId, "ALLOW", since);
        long mask = countVerdict(userId, "MASK", since);
        long warn = countVerdict(userId, "WARN", since);
        long block = countVerdict(userId, "BLOCK", since);
        long review = countVerdict(userId, "REVIEW", since);

        // ===== 메인 보안 점수: 100 - 평균 위험점수 =====
        Double avg = (userId == null)
                ? promptRepository.averageRiskScore(since)
                : promptRepository.averageRiskScoreByUser(userId, since);
        int securityScore = (avg == null) ? 100 : Math.max(0, 100 - (int) Math.round(avg));

        // ===== 일자별 추이 =====
        List<DashboardResponseDto.TimeSeriesPoint> trend = buildTrend(userId, since);

        // ===== 카테고리 통계 (reasons 파싱) =====
        List<DashboardResponseDto.CategoryStat> categoryStats = buildCategoryStats(userId, since);

        // ===== 최근 알림 =====
        List<DashboardResponseDto.RecentAlert> alerts = buildRecentAlerts(userId, since);

        return DashboardResponseDto.builder()
                .securityScore(securityScore)
                .totalChecked(total)
                .allowCount(allow)
                .maskCount(mask)
                .warnCount(warn)
                .blockCount(block)
                .reviewCount(review)
                .riskTrend(trend)
                .categoryStats(categoryStats)
                .recentAlerts(alerts)
                .build();
    }

    // ============================================
    // 🔧 헬퍼 메서드 (userId 분기 처리)
    // ============================================

    /** 전체 카운트 (userId 분기) */
    private long countTotal(String userId, LocalDateTime since) {
        if (userId == null) {
            return promptRepository.countByCreatedAtAfter(since);
        }
        return promptRepository.countByUserIdAndCreatedAtAfter(userId, since);
    }

    /** verdict 카운트 (대소문자 둘 다 시도, userId 분기) */
    private long countVerdict(String userId, String verdict, LocalDateTime since) {
        if (userId == null) {
            long upper = promptRepository.countByVerdictAndCreatedAtAfter(verdict, since);
            long lower = promptRepository.countByVerdictAndCreatedAtAfter(verdict.toLowerCase(), since);
            return upper + lower;
        }
        long upper = promptRepository.countByUserIdAndVerdictAndCreatedAtAfter(userId, verdict, since);
        long lower = promptRepository.countByUserIdAndVerdictAndCreatedAtAfter(userId, verdict.toLowerCase(), since);
        return upper + lower;
    }

    /** 일자별 추이 (userId 분기) */
    private List<DashboardResponseDto.TimeSeriesPoint> buildTrend(String userId, LocalDateTime since) {
        List<Object[]> rows = (userId == null)
                ? promptRepository.dailyRiskTrend(since)
                : promptRepository.dailyRiskTrendByUser(userId, since);

        List<DashboardResponseDto.TimeSeriesPoint> trend = new ArrayList<>();
        for (Object[] row : rows) {
            LocalDate date;
            if (row[0] instanceof Date) {
                date = ((Date) row[0]).toLocalDate();
            } else if (row[0] instanceof LocalDate) {
                date = (LocalDate) row[0];
            } else {
                date = LocalDate.parse(row[0].toString());
            }
            int avgScore = row[1] == null ? 0 : (int) Math.round(((Number) row[1]).doubleValue());
            long cnt = ((Number) row[2]).longValue();
            trend.add(new DashboardResponseDto.TimeSeriesPoint(date, avgScore, cnt));
        }
        return trend;
    }

    /** 카테고리 통계 (userId 분기) */
    private List<DashboardResponseDto.CategoryStat> buildCategoryStats(String userId, LocalDateTime since) {
        List<String> allReasons = (userId == null)
                ? promptRepository.findReasonsAfter(since)
                : promptRepository.findReasonsAfterByUser(userId, since);

        Map<String, Long> categoryCounts = new LinkedHashMap<>();

        for (String reasons : allReasons) {
            if (reasons == null || reasons.isBlank()) continue;
            Matcher m = REASON_PATTERN.matcher(reasons);
            while (m.find()) {
                String key = m.group(1).toLowerCase();
                try {
                    int v = Integer.parseInt(m.group(2));
                    if (v > 0) {
                        categoryCounts.merge(key, (long) v, Long::sum);
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }

        long sum = categoryCounts.values().stream().mapToLong(Long::longValue).sum();

        List<DashboardResponseDto.CategoryStat> result = new ArrayList<>();
        categoryCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(e -> {
                    String key = e.getKey();
                    long cnt = e.getValue();
                    double pct = sum == 0 ? 0.0 : Math.round((cnt * 1000.0 / sum)) / 10.0;
                    String name = CATEGORY_NAMES.getOrDefault(key, key);
                    result.add(new DashboardResponseDto.CategoryStat(key, name, cnt, pct));
                });
        return result;
    }

    /** 최근 알림 (userId 분기) */
    private List<DashboardResponseDto.RecentAlert> buildRecentAlerts(String userId, LocalDateTime since) {
        List<Prompt> recent;
        if (userId == null) {
            recent = promptRepository.findTop5ByCreatedAtAfterOrderByCreatedAtDesc(since);
            if (recent.isEmpty()) {
                recent = promptRepository.findTop5ByOrderByCreatedAtDesc();
            }
        } else {
            recent = promptRepository.findTop5ByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, since);
            if (recent.isEmpty()) {
                recent = promptRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
            }
        }

        List<DashboardResponseDto.RecentAlert> alerts = new ArrayList<>();
        for (Prompt p : recent) {
            String preview = p.getPrompt();
            if (preview != null && preview.length() > 80) {
                preview = preview.substring(0, 80) + "...";
            }
            alerts.add(new DashboardResponseDto.RecentAlert(
                    p.getId(),
                    p.getRiskScore() == null ? 0 : p.getRiskScore(),
                    p.getVerdict(),
                    preview,
                    p.getReasons(),
                    p.getCreatedAt() == null ? "" : p.getCreatedAt().toString()
            ));
        }
        return alerts;
    }
}