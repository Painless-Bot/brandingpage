package presendguard.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "masking_details")
public class MaskingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "masking_log_id", nullable = false)
    private MaskingLog maskingLog;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DetectionCategory category;   // PHONE / EMAIL / RRN / PERSON_NAME ...

    @Column(nullable = false)
    private Integer count;                // 해당 카테고리 탐지 건수

    @Column(nullable = false)
    private Integer scoreAdded;           // 이 카테고리로 가산된 점수
}