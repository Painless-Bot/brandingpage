package presendguard.controller;

import presendguard.dto.LoginResponse;
import presendguard.dto.SignInRequest;
import presendguard.dto.SignUpRequest;
import presendguard.entity.User;
import presendguard.service.UserService;
import presendguard.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

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

    // 2. 로그인 API - JWT 토큰 발급
    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInRequest request) {
        try {
            User user = userService.loginAndGetUser(request);

            String token = jwtTokenProvider.createToken(
                    user.getEmail(),
                    user.getId(),
                    user.getUsername()
            );

            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(604800000L)
                    .user(LoginResponse.UserInfo.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .username(user.getUsername())
                            .createdAt(user.getCreatedAt())   // ⭐ 추가
                            .build())
                    .build();

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그인 처리 중 오류 발생: " + e.getMessage());
        }
    }

    // 3. 토큰으로 현재 사용자 정보 조회
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = jwtTokenProvider.resolveToken(authHeader);
            if (token == null || !jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(401).body("유효하지 않은 토큰입니다.");
            }

            String email = jwtTokenProvider.getEmailFromToken(token);
            User user = userService.getUserByEmail(email);

            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .createdAt(user.getCreatedAt())   // ⭐ 추가
                    .build();

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("인증 오류: " + e.getMessage());
        }
    }
}