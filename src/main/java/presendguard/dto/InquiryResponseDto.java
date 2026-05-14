package presendguard.dto;

import presendguard.domain.Inquiry;
import presendguard.domain.InquiryStatus;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class InquiryResponseDto {
    private Long id;
    private String title;
    private String content;
    private InquiryStatus status;
    private String adminReply;
    private LocalDateTime createdAt;

    public InquiryResponseDto(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.title = inquiry.getTitle();
        this.content = inquiry.getContent();
        this.status = inquiry.getStatus();
        this.adminReply = inquiry.getAdminReply();
        this.createdAt = inquiry.getCreatedAt();
    }
}