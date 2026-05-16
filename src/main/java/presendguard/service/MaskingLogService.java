package presendguard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import presendguard.domain.*;
import presendguard.dto.DashboardResponseDto;
import presendguard.dto.MaskingLogCreateRequestDto;
import presendguard.dto.MaskingLogResponseDto;
import presendguard.repository.MaskingLogRepository;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaskingLogService {

    private final MaskingLogRepository maskingLogRepository;

    /**
     * 마스킹 로그 저장 - 클라이언트가 탐지 결과를 보내면 점수 계산 후 저장.
     */
    @Transactional
    public MaskingLogResponseDto createLog(MaskingLogCreateRequestDto req) {
        String prompt = req.getPromptText() == null ? "" : req.getPromptText();
        int promptLen = prompt.length();
        String preview = promptLen > 100 ? prompt.substring(0, 100) : prompt;

        // 점수 계산: 카테고리별 가중치 × 건수 합산 (최대 100)
        int totalScore = 0;
        int totalDetected = 0;
        List<MaskingDetail> detailEntities = new ArrayList<>();

        if (req.getDetections() != null) {
            for (var item : req.getDetections()) {
                if (item.getCategory() == null || item.getCount() == null || item.getCount() <= 0) continue;
                int added = item.getCategory().getScoreWeight() * item.getCount();
                totalScore += added;
                totalDetected += item.getCount();

                detailEntities.add(MaskingDetail.builder()
                        .category(item.getCategory())
                        .count(item.getCount())
                        .scoreAdded(added)
                        .build());
            }
        }
        int finalScore = Math.min(100, totalScore);
        Verdict verdict = Verdict.fromScore(finalScore);

        MaskingLog log = MaskingLog.builder()
                .userId(req.getUserId())
                .riskScore(finalScore)
                .verdict(verdict)
                .totalDetected(totalDetected)
                .promptLength(promptLen)
                .promptPreview(preview)
                .aiTarget(req.getAiTarget())
                .build();
        for (MaskingDetail d : detailEntities) {
            log.addDetail(d);
        }

        MaskingLog saved = maskingLogRepository.save(log);
        return new MaskingLogResponseDto(saved);
    }

    /**
     * 로그 페이징 조회
     */
    @Transactional(readOnly = true)
    public Page<MaskingLogResponseDto> getLogs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return maskingLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(MaskingLogResponseDto::new);
    }

    /**
     * 로그 단건
     */
    @Transactional(readOnly = true)
    public MaskingLogResponseDto getLog(Long id) {
        MaskingLog log = maskingLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 로그를 찾을 수 없습니다. id=" + id));
        return new MaskingLogResponseDto(log);
    }

    /**
     * 대시보드 요약 (메인 점수 + 차트 데이터 + 최근 알림)
     */
    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboard(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        // 카운트
        long total = maskingLogRepository.countByUserIdAndCreatedAtAfter(userId, since);
        long allow = maskingLogRepository.countByUserIdAndVerdictAndCreatedAtAfter(userId, Verdict.ALLOW, since);
        long mask = maskingLogRepository.countByUserIdAndVerdictAndCreatedAtAfter(userId, Verdict.MASK, since);
        long warn = maskingLogRepository.countByUserIdAndVerdictAndCreatedAtAfter(userId, Verdict.WARN, since);

        // 메인 보안 점수: 100 - 평균 위험점수 (데이터 없으면 100)
        Double avg = maskingLogRepository.averageRiskScore(userId, since);
        int securityScore = (avg == null) ? 100 : Math.max(0, 100 - (int) Math.round(avg));

        // 일자별 추이
        List<Object[]> trendRows = maskingLogRepository.dailyRiskTrend(userId, since);
        List<DashboardResponseDto.TimeSeriesPoint> trend = new ArrayList<>();
        for (Object[] row : trendRows) {
            LocalDate date = row[0] instanceof Date
                    ? ((Date) row[0]).toLocalDate()
                    : LocalDate.parse(row[0].toString());
            int avgScore = row[1] == null ? 0 : (int) Math.round(((Number) row[1]).doubleValue());
            long cnt = ((Number) row[2]).longValue();
            trend.add(new DashboardResponseDto.TimeSeriesPoint(date, avgScore, cnt));
        }

        // 카테고리별 통계
        List<Object[]> catRows = maskingLogRepository.categoryStats(userId, since);
        long sumOfCounts = catRows.stream()
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();
        List<DashboardResponseDto.CategoryStat> catStats = new ArrayList<>();
        for (Object[] row : catRows) {
            DetectionCategory cat = (DetectionCategory) row[0];
            long cnt = ((Number) row[1]).longValue();
            double pct = sumOfCounts == 0 ? 0.0 : Math.round((cnt * 1000.0 / sumOfCounts)) / 10.0;
            catStats.add(new DashboardResponseDto.CategoryStat(
                    cat.name(),
                    cat.getDescription(),
                    cat.getDetectionType(),
                    cnt,
                    pct
            ));
        }

        // 최근 알림 (위험도 높은 순으로 최근 5건)
        List<MaskingLog> recent = maskingLogRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        List<DashboardResponseDto.RecentAlert> alerts = new ArrayList<>();
        for (MaskingLog log : recent) {
            alerts.add(new DashboardResponseDto.RecentAlert(
                    log.getId(),
                    log.getRiskScore(),
                    log.getVerdict().name(),
                    log.getPromptPreview(),
                    log.getCreatedAt().toString()
            ));
        }

        return DashboardResponseDto.builder()
                .securityScore(securityScore)
                .totalChecked(total)
                .allowCount(allow)
                .maskCount(mask)
                .warnCount(warn)
                .riskTrend(trend)
                .categoryStats(catStats)
                .recentAlerts(alerts)
                .build();
    }

    @Transactional
    public void deleteLog(Long id) {
        if (!maskingLogRepository.existsById(id)) {
            throw new IllegalArgumentException("해당 로그를 찾을 수 없습니다. id=" + id);
        }
        maskingLogRepository.deleteById(id);
    }
}