package presendguard.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import presendguard.domain.Prompt;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PromptRepository extends JpaRepository<Prompt, Long> {

    // ============================================
    // 🌐 기존 메서드 (전체 데이터 - 관리자/공개용)
    // ============================================

    /** 페이징 목록 (최신순) */
    Page<Prompt> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** 기간 내 최신 5건 (알림용) */
    List<Prompt> findTop5ByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);

    /** 최신 5건 전체 (기간 무관) - 데이터가 적을 때 폴백 */
    List<Prompt> findTop5ByOrderByCreatedAtDesc();

    /** 기간 내 전체 카운트 */
    long countByCreatedAtAfter(LocalDateTime since);

    /** 기간 내 판정별 카운트 (verdict는 String) */
    long countByVerdictAndCreatedAtAfter(String verdict, LocalDateTime since);

    /** 기간 내 평균 위험 점수 */
    @Query("SELECT AVG(p.riskScore) FROM Prompt p WHERE p.createdAt >= :since")
    Double averageRiskScore(@Param("since") LocalDateTime since);

    /** 일자별 평균 위험 점수 + 카운트 (라인 차트용) */
    @Query("SELECT FUNCTION('DATE', p.createdAt) as dt, " +
            "AVG(p.riskScore) as avgScore, COUNT(p) as cnt " +
            "FROM Prompt p " +
            "WHERE p.createdAt >= :since " +
            "GROUP BY FUNCTION('DATE', p.createdAt) " +
            "ORDER BY dt ASC")
    List<Object[]> dailyRiskTrend(@Param("since") LocalDateTime since);

    /** 기간 내 모든 reasons 문자열 (카테고리 집계용) */
    @Query("SELECT p.reasons FROM Prompt p " +
            "WHERE p.createdAt >= :since AND p.reasons IS NOT NULL")
    List<String> findReasonsAfter(@Param("since") LocalDateTime since);

    // ============================================
    // 👤 ⭐ 사용자별 메서드 (user_id 필터링) - 추가
    // ============================================

    /** 사용자별 페이징 목록 (최신순) */
    Page<Prompt> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /** 사용자별 기간 내 최신 5건 */
    List<Prompt> findTop5ByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(
            String userId, LocalDateTime since);

    /** 사용자별 최신 5건 (폴백) */
    List<Prompt> findTop5ByUserIdOrderByCreatedAtDesc(String userId);

    /** 사용자별 기간 내 카운트 */
    long countByUserIdAndCreatedAtAfter(String userId, LocalDateTime since);

    /** 사용자별 기간 내 판정별 카운트 */
    long countByUserIdAndVerdictAndCreatedAtAfter(
            String userId, String verdict, LocalDateTime since);

    /** 사용자별 평균 위험 점수 */
    @Query("SELECT AVG(p.riskScore) FROM Prompt p " +
            "WHERE p.userId = :userId AND p.createdAt >= :since")
    Double averageRiskScoreByUser(
            @Param("userId") String userId,
            @Param("since") LocalDateTime since);

    /** 사용자별 일자별 위험 점수 추이 */
    @Query("SELECT FUNCTION('DATE', p.createdAt) as dt, " +
            "AVG(p.riskScore) as avgScore, COUNT(p) as cnt " +
            "FROM Prompt p " +
            "WHERE p.userId = :userId AND p.createdAt >= :since " +
            "GROUP BY FUNCTION('DATE', p.createdAt) " +
            "ORDER BY dt ASC")
    List<Object[]> dailyRiskTrendByUser(
            @Param("userId") String userId,
            @Param("since") LocalDateTime since);

    /** 사용자별 reasons 조회 */
    @Query("SELECT p.reasons FROM Prompt p " +
            "WHERE p.userId = :userId AND p.createdAt >= :since AND p.reasons IS NOT NULL")
    List<String> findReasonsAfterByUser(
            @Param("userId") String userId,
            @Param("since") LocalDateTime since);

    /** 사용자별 단일 조회 (보안 - 본인 데이터인지 확인) */
    @Query("SELECT p FROM Prompt p WHERE p.id = :id AND p.userId = :userId")
    Optional<Prompt> findByIdAndUserId(
            @Param("id") Long id,
            @Param("userId") String userId);
}