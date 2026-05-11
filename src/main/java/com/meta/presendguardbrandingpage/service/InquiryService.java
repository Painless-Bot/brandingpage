package com.meta.presendguardbrandingpage.service;

import com.meta.presendguardbrandingpage.domain.Inquiry;
import com.meta.presendguardbrandingpage.domain.InquiryStatus;
import com.meta.presendguardbrandingpage.repository.InquiryRepository;

import com.meta.presendguardbrandingpage.dto.InquiryCreateRequestDto;
import com.meta.presendguardbrandingpage.dto.InquiryResponseDto;
import com.meta.presendguardbrandingpage.dto.InquiryUpdateRequestDto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;


    @Transactional
    public InquiryResponseDto createInquiry(InquiryCreateRequestDto requestDto) {
        Inquiry inquiry = Inquiry.builder()
                .userId(requestDto.getUserId())
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .status(InquiryStatus.PENDING) // 처음 등록 시 무조건 '접수' 상태
                .build();

        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        return new InquiryResponseDto(savedInquiry);
    }


    @Transactional(readOnly = true)
    public InquiryResponseDto getInquiry(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다. id=" + id));
        return new InquiryResponseDto(inquiry);
    }


    @Transactional(readOnly = true)
    public List<InquiryResponseDto> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(InquiryResponseDto::new) // Entity를 DTO 상자로 쏙쏙 옮겨 담음
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<InquiryResponseDto> getUserInquiries(Long userId) {
        return inquiryRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(InquiryResponseDto::new)
                .collect(Collectors.toList());
    }


    @Transactional
    public InquiryResponseDto updateInquiryReply(Long id, InquiryUpdateRequestDto requestDto) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다. id=" + id));


        inquiry.setAdminReply(requestDto.getAdminReply());
        inquiry.updateStatus(requestDto.getStatus());

        return new InquiryResponseDto(inquiry);
    }

    @Transactional
    public void deleteInquiry(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다. id=" + id));
        inquiryRepository.delete(inquiry);
    }
}