package presendguard.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inquiry extends TimeStamped {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 2000, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryStatus status;

    @Column(length = 2000, columnDefinition = "TEXT")
    private String adminReply;

    @Builder
    public Inquiry(Long userId, String title, String content, InquiryStatus status) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.status = status != null ? status : InquiryStatus.PENDING;
    }

    // 관리자 답변 등록 (InquiryService.updateInquiryReply에서 호출)
    public void setAdminReply(String adminReply) {
        this.adminReply = adminReply;
    }

    // 상태 변경 (InquiryService.updateInquiryReply에서 호출)
    public void updateStatus(InquiryStatus status) {
        if (status != null) {
            this.status = status;
        }
    }
}