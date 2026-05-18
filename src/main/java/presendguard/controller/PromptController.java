package presendguard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import presendguard.dto.DashboardResponseDto;
import presendguard.dto.PromptResponseDto;
import presendguard.service.PromptService;
import presendguard.util.JwtTokenProvider;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prompt")
public class PromptController {

    private final PromptService promptService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 대시보드 요약 (로그인 필수 - 본인 데이터만)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> dashboard(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "30") int days
    ) {
        String userEmail = extractEmailFromToken(authHeader);
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(promptService.getDashboardByUser(userEmail, days));
    }

    /**
     * 🌐 전체 데이터 대시보드 (관리자 전용)
     * TODO: 관리자 권한 체크 로직 추가 필요
     */
    @GetMapping("/dashboard/all")
    public ResponseEntity<DashboardResponseDto> dashboardAll(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "30") int days
    ) {
        String userEmail = extractEmailFromToken(authHeader);
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }
        // TODO: 관리자 권한 체크 (예: userEmail이 admin인지)
        // 임시로 로그인만 검증
        return ResponseEntity.ok(promptService.getDashboard(days));
    }

    /**
     * 로그 페이징 목록 (로그인 필수 - 본인 데이터만)
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<PromptResponseDto>> getLogs(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String userEmail = extractEmailFromToken(authHeader);
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(promptService.getPromptsByUser(userEmail, page, size));
    }

    /**
     * 단건 상세 (로그인 필수 - 본인 거만)
     */
    @GetMapping("/log/{id}")
    public ResponseEntity<PromptResponseDto> getLog(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id
    ) {
        String userEmail = extractEmailFromToken(authHeader);
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(promptService.getPromptByUser(userEmail, id));
    }

    // ============================================
    // 헬퍼: Authorization 헤더에서 이메일 추출
    // ============================================
    private String extractEmailFromToken(String authHeader) {
        if (authHeader == null) return null;

        String token = jwtTokenProvider.resolveToken(authHeader);
        if (token == null || !jwtTokenProvider.validateToken(token)) return null;

        return jwtTokenProvider.getEmailFromToken(token);
    }
}