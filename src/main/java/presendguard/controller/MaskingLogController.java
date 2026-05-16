package presendguard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import presendguard.dto.DashboardResponseDto;
import presendguard.dto.MaskingLogCreateRequestDto;
import presendguard.dto.MaskingLogResponseDto;
import presendguard.service.MaskingLogService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/masking")
public class MaskingLogController {

    private final MaskingLogService maskingLogService;

    /** 마스킹 로그 저장 */
    @PostMapping("/log")
    public ResponseEntity<MaskingLogResponseDto> createLog(
            @RequestBody MaskingLogCreateRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maskingLogService.createLog(request));
    }

    /** 사용자별 페이징 목록 */
    @GetMapping("/logs/{userId}")
    public ResponseEntity<Page<MaskingLogResponseDto>> getLogs(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(maskingLogService.getLogs(userId, page, size));
    }

    /** 로그 단건 상세 */
    @GetMapping("/log/{id}")
    public ResponseEntity<MaskingLogResponseDto> getLog(@PathVariable Long id) {
        return ResponseEntity.ok(maskingLogService.getLog(id));
    }

    /** 대시보드 요약 (메인 점수 + 추이/카테고리/알림) */
    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<DashboardResponseDto> dashboard(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(maskingLogService.getDashboard(userId, days));
    }

    /** 로그 삭제 */
    @DeleteMapping("/log/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        maskingLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}