package presendguard.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "masking_logs", indexes = {
        @Index(name = "idx_user_created", columnList = "userId, createdAt")
})
public class MaskingLog extends TimeStamped {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    // ===== 위험 판정 =====
    @Column(nullable = false)
    private Integer riskScore;       // 0~100

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Verdict verdict;         // ALLOW / MASK / WARN

    // ===== 탐지 요약 =====
    @Column(nullable = false)
    private Integer totalDetected;   // 총 탐지 개수

    // ===== 원본 메타정보 (원문은 저장하지 않음) =====
    @Column(nullable = false)
    private Integer promptLength;    // 프롬프트 글자 수

    @Column(length = 100)
    private String promptPreview;    // 첫 100자 미리보기 (옵션)

    @Column(length = 50)
    private String aiTarget;         // ChatGPT, Claude, Gemini 등

    // ===== 상세 (1:N) =====
    @Builder.Default
    @OneToMany(mappedBy = "maskingLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaskingDetail> details = new ArrayList<>();

    public void addDetail(MaskingDetail detail) {
        this.details.add(detail);
        detail.setMaskingLog(this);
    }
}