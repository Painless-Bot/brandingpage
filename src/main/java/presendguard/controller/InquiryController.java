package presendguard.controller;

import presendguard.dto.InquiryCreateRequestDto;
import presendguard.dto.InquiryResponseDto;
import presendguard.dto.InquiryUpdateRequestDto;
import presendguard.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/help")
public class InquiryController {

    private final InquiryService inquiryService;

    // 문의사항 올리기
    @PostMapping("/inquiry")
    public ResponseEntity<InquiryResponseDto> createInquiry(@RequestBody InquiryCreateRequestDto requestDto) {
        InquiryResponseDto responseDto = inquiryService.createInquiry(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // 관리자가 모든 문의사항 확인
    @GetMapping("/inquiries")
    public ResponseEntity<List<InquiryResponseDto>> getAllInquiries() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    // 나의 문의내역 보기
    @GetMapping("/inquiries/user/{userId}")
    public ResponseEntity<List<InquiryResponseDto>> getUserInquiries(@PathVariable Long userId) {
        return ResponseEntity.ok(inquiryService.getUserInquiries(userId));
    }

    // 특정 문의 내용 확인
    @GetMapping("/inquiry/{id}")
    public ResponseEntity<InquiryResponseDto> getInquiry(@PathVariable Long id) {
        return ResponseEntity.ok(inquiryService.getInquiry(id));
    }

    // 관리자가 문의글에 답변을 달고 상태 변경
    @PutMapping("/inquiry/{id}")
    public ResponseEntity<InquiryResponseDto> updateInquiryReply(
            @PathVariable Long id,
            @RequestBody InquiryUpdateRequestDto requestDto) {
        InquiryResponseDto responseDto = inquiryService.updateInquiryReply(id, requestDto);
        return ResponseEntity.ok(responseDto);
    }

    // 문의글 지우기
    @DeleteMapping("/inquiry/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.noContent().build();
    }
}