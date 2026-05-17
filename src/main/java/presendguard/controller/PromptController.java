package presendguard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import presendguard.dto.DashboardResponseDto;
import presendguard.dto.PromptResponseDto;
import presendguard.service.PromptService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prompt")
public class PromptController {

    private final PromptService promptService;

    /** 대시보드 요약 */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> dashboard(
            @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(promptService.getDashboard(days));
    }

    /** 로그 페이징 목록 */
    @GetMapping("/logs")
    public ResponseEntity<Page<PromptResponseDto>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(promptService.getPrompts(page, size));
    }

    /** 단건 상세 */
    @GetMapping("/log/{id}")
    public ResponseEntity<PromptResponseDto> getLog(@PathVariable Long id) {
        return ResponseEntity.ok(promptService.getPrompt(id));
    }
}