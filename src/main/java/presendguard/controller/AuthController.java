package presendguard.controller;

import presendguard.dto.SignUpRequest;
import presendguard.dto.SignInRequest;
import presendguard.dto.UserInfoResponse;
import presendguard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpRequest request) {
        try {
            userService.register(request);
            return ResponseEntity.ok("User registered successfully");
        } catch (RuntimeException e) {
            // ✅ 이메일 중복 메시지 구분
            if (e.getMessage().contains("Email already exists")) {
                return ResponseEntity.status(409).body("이미 사용 중인 이메일입니다.");
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInRequest request) {
        try {
            // ✅ 로그인 성공 시 유저 정보 반환
            UserInfoResponse userInfo = userService.login(request);
            if (userInfo != null) {
                return ResponseEntity.ok(userInfo);
            } else {
                return ResponseEntity.status(401).body("이메일 또는 비밀번호가 틀렸습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그인 처리 중 오류 발생: " + e.getMessage());
        }
    }
}