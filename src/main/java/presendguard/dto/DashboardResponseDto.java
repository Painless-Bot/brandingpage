package presendguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class DashboardResponseDto {

    // ===== 메인 보안 점수 =====
    private Integer securityScore;          // 0~100 (높을수록 안전)

    // ===== 요약 통계 =====
    private Long totalChecked;              // 전체 검사 횟수
    private Long maskCount;                 // MASK 판정 횟수
    private Long warnCount;                 // WARN 판정 횟수
    private Long allowCount;                // ALLOW 판정 횟수

    // ===== 추세 차트 데이터 (라인 차트) =====
    private List<TimeSeriesPoint> riskTrend;

    // ===== 카테고리 차트 데이터 (도넛 차트) =====
    private List<CategoryStat> categoryStats;

    // ===== 최근 알림 (하이라이트) =====
    private List<RecentAlert> recentAlerts;

    // ===== Inner DTOs =====
    @Getter
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private LocalDate date;             // 2026-05-16
        private Integer avgRiskScore;       // 그날 평균 위험 점수
        private Long count;                 // 그날 검사 횟수
    }

    @Getter
    @AllArgsConstructor
    public static class CategoryStat {
        private String category;            // PHONE, EMAIL ...
        private String categoryName;        // "전화번호", "이메일"
        private String detectionType;       // REGEX / NER
        private Long totalCount;            // 총 탐지 건수
        private Double percentage;          // 전체 대비 비율
    }

    @Getter
    @AllArgsConstructor
    public static class RecentAlert {
        private Long logId;
        private Integer riskScore;
        private String verdict;
        private String preview;
        private String createdAt;           // ISO 문자열
    }
}