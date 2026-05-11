package com.meta.presendguardbrandingpage.domain;

import lombok.Getter;

@Getter
public enum InquiryStatus {
    PENDING("접수"),
    IN_PROGRESS("진행"),
    COMPLETED("완료");

    private final String description;

    InquiryStatus(String description) {
        this.description = description;
    }
}