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

    /** 카테고리 키 → 한글 이름 매핑 (확장 가능) */
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

    /** 페이징 목록 */
    @Transactional(readOnly = true)
    public Page<PromptResponseDto> getPrompts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return promptRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PromptResponseDto::new);
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    public PromptResponseDto getPrompt(Long id) {
        Prompt p = promptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 프롬프트를 찾을 수 없습니다. id=" + id));
        return new PromptResponseDto(p);
    }

    /** 대시보드 통합 응답 */
    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboard(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        // ===== 카운트 (5종 verdict 모두) =====
        long total = promptRepository.countByCreatedAtAfter(since);
        long allow = countVerdict("ALLOW", since);
        long mask = countVerdict("MASK", since);
        long warn = countVerdict("WARN", since);
        long block = countVerdict("BLOCK", since);    // ⭐ 추가
        long review = countVerdict("REVIEW", since);  // ⭐ 추가

        // ===== 메인 보안 점수: 100 - 평균 위험점수 =====
        Double avg = promptRepository.averageRiskScore(since);
        int securityScore = (avg == null) ? 100 : Math.max(0, 100 - (int) Math.round(avg));

        // ===== 일자별 추이 =====
        List<DashboardResponseDto.TimeSeriesPoint> trend = buildTrend(since);

        // ===== 카테고리 통계 (reasons 파싱) =====
        List<DashboardResponseDto.CategoryStat> categoryStats = buildCategoryStats(since);

        // ===== 최근 알림 =====
        List<DashboardResponseDto.RecentAlert> alerts = buildRecentAlerts(since);

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

    /** verdict 카운트 (대소문자 다를 수 있어서 둘 다 시도) */
    private long countVerdict(String verdict, LocalDateTime since) {
        long upper = promptRepository.countByVerdictAndCreatedAtAfter(verdict, since);
        long lower = promptRepository.countByVerdictAndCreatedAtAfter(verdict.toLowerCase(), since);
        return upper + lower;
    }

    private List<DashboardResponseDto.TimeSeriesPoint> buildTrend(LocalDateTime since) {
        List<Object[]> rows = promptRepository.dailyRiskTrend(since);
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

    /**
     * 모든 prompt의 reasons 문자열을 파싱해서 카테고리별로 합산.
     */
    private List<DashboardResponseDto.CategoryStat> buildCategoryStats(LocalDateTime since) {
        List<String> allReasons = promptRepository.findReasonsAfter(since);
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

    private List<DashboardResponseDto.RecentAlert> buildRecentAlerts(LocalDateTime since) {
        List<Prompt> recent = promptRepository.findTop5ByCreatedAtAfterOrderByCreatedAtDesc(since);
        if (recent.isEmpty()) {
            recent = promptRepository.findTop5ByOrderByCreatedAtDesc();
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