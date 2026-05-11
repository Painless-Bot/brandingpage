package com.meta.presendguardbrandingpage.dto;

import com.meta.presendguardbrandingpage.domain.InquiryStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Setter
public class InquiryUpdateRequestDto {
    // 유저가 수정할 때 쓰는 필드
    private String title;
    private String content;

    // 관리자가 답변할 때 쓰는 필드
    private String adminReply;
    private InquiryStatus status;
}