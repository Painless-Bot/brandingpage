package presendguard.controller;

import presendguard.dto.SignUpRequest;
import presendguard.dto.SignInRequest; // 로그인 요청용 DTO 추가 필요
import presendguard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // 1. 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpRequest request) {
        try {
            userService.register(request);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. 로그인 API 추가
    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInRequest request) {
        try {
            // UserService에 login 메서드를 만들어 실제 DB와 대조해야 함
            boolean isAuthenticated = userService.login(request);

            if (isAuthenticated) {
                // 로그인 성공 시 응답 (나중에는 여기서 토큰을 주기도 함)
                return ResponseEntity.ok("로그인 성공");
            } else {
                return ResponseEntity.status(401).body("이메일 또는 비밀번호가 틀렸습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그인 처리 중 오류 발생: " + e.getMessage());
        }
    }
}