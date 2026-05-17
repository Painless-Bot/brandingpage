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

    // ===== 요약 통계 (5종 verdict 모두 카운트) =====
    private Long totalChecked;
    private Long allowCount;     // ALLOW   - 안전
    private Long maskCount;      // MASK    - 마스킹
    private Long warnCount;      // WARN    - 경고
    private Long blockCount;     // BLOCK   - 차단 ⭐ 추가
    private Long reviewCount;    // REVIEW  - 검토 필요 ⭐ 추가

    // ===== 추세 (라인 차트) =====
    private List<TimeSeriesPoint> riskTrend;

    // ===== 카테고리 (도넛 차트) =====
    private List<CategoryStat> categoryStats;

    // ===== 최근 알림 =====
    private List<RecentAlert> recentAlerts;

    @Getter
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private LocalDate date;
        private Integer avgRiskScore;
        private Long count;
    }

    @Getter
    @AllArgsConstructor
    public static class CategoryStat {
        private String category;        // phone, email, rrn ...
        private String categoryName;    // 한글: "전화번호", "이메일", "주민번호"
        private Long totalCount;
        private Double percentage;
    }

    @Getter
    @AllArgsConstructor
    public static class RecentAlert {
        private Long id;
        private Integer riskScore;
        private String verdict;
        private String preview;
        private String reasons;
        private String createdAt;
    }
}