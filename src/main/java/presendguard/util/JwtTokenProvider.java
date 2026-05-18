package presendguard.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:presendguard-very-secret-key-please-change-in-production-environment-min-32chars}")
    private String secretString;

    @Value("${jwt.expiration:604800000}") // 7일 (밀리초)
    private long expirationMs;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
    }

    /** JWT 토큰 생성 */
    public String createToken(String email, Long userId, String username) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)                    // 토큰 주체 (이메일)
                .claim("userId", userId)           // 추가 정보: DB id
                .claim("username", username)       // 추가 정보: 이름
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    /** 토큰에서 이메일 추출 */
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /** 토큰에서 사용자 ID 추출 */
    public Long getUserIdFromToken(String token) {
        return parseClaims(token).get("userId", Long.class);
    }

    /** 토큰에서 사용자명 추출 */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).get("username", String.class);
    }

    /** 토큰 유효성 검증 */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** "Bearer xxx" 헤더에서 토큰 부분만 추출 */
    public String resolveToken(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}