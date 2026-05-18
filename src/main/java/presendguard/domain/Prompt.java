package presendguard.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 마스킹 엔진이 INSERT 하는 prompt 테이블에 매핑되는 Entity.
 *
 * 실제 스키마 (Presend_Guard.prompt):
 *   id          bigint           NOT NULL  PRI  auto_increment
 *   prompt      varchar(5000)    NOT NULL
 *   reasons     text             NULL
 *   risk_score  int              NOT NULL
 *   verdict     enum('ALLOW','BLOCK','MASK','REVIEW','WARN')  NOT NULL
 *   created_at  datetime(6)      NOT NULL
 *   updated_at  datetime(6)      NOT NULL
 *   user_id     varchar(255)     NULL          ⭐ 추가
 */
@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "prompt")
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 마스킹 처리된 프롬프트 (최대 5000자) */
    @Column(nullable = false, length = 5000)
    private String prompt;

    /** 카테고리별 탐지 결과 (예: "phone: 1, email: 0, rrn: 0") */
    @Column(columnDefinition = "TEXT")
    private String reasons;

    /** 위험 점수 0~100 */
    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    /**
     * 판정 결과 (DB는 enum 컬럼이지만 JPA에서는 문자열로 받음).
     * 가능한 값: ALLOW, BLOCK, MASK, REVIEW, WARN
     */
    @Column(nullable = false, length = 20)
    private String verdict;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * ⭐ 사용자 식별자 (이메일 또는 "anonymousUser")
     * - 로그인 사용자: 본인 이메일
     * - 비로그인 사용자: "anonymousUser"
     * - 마스킹 엔진이 INSERT 시 함께 저장
     */
    @Column(name = "user_id", length = 255)
    private String userId;
}