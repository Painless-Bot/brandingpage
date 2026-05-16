package presendguard.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import presendguard.domain.MaskingLog;
import presendguard.domain.Verdict;

import java.time.LocalDateTime;
import java.util.List;

public interface MaskingLogRepository extends JpaRepository<MaskingLog, Long> {

    // 페이징 목록
    Page<MaskingLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // 최근 N건 (알림용)
    List<MaskingLog> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    // 기간별 카운트 (판정별)
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime since);
    long countByUserIdAndVerdictAndCreatedAtAfter(Long userId, Verdict verdict, LocalDateTime since);

    // 평균 위험 점수 (메인 점수 산출용)
    @Query("SELECT AVG(m.riskScore) FROM MaskingLog m " +
            "WHERE m.userId = :userId AND m.createdAt >= :since")
    Double averageRiskScore(@Param("userId") Long userId,
                            @Param("since") LocalDateTime since);

    // 일자별 평균 위험 점수 (라인 차트용)
    @Query("SELECT FUNCTION('DATE', m.createdAt) as dt, " +
            "AVG(m.riskScore) as avgScore, COUNT(m) as cnt " +
            "FROM MaskingLog m " +
            "WHERE m.userId = :userId AND m.createdAt >= :since " +
            "GROUP BY FUNCTION('DATE', m.createdAt) " +
            "ORDER BY dt ASC")
    List<Object[]> dailyRiskTrend(@Param("userId") Long userId,
                                  @Param("since") LocalDateTime since);

    // 카테고리별 탐지 건수 (도넛 차트용)
    @Query("SELECT d.category, SUM(d.count) as total " +
            "FROM MaskingLog m JOIN m.details d " +
            "WHERE m.userId = :userId AND m.createdAt >= :since " +
            "GROUP BY d.category " +
            "ORDER BY total DESC")
    List<Object[]> categoryStats(@Param("userId") Long userId,
                                 @Param("since") LocalDateTime since);
}