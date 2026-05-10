package presendguard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserInfoResponse {
    private String username;
    private String email;
    private LocalDateTime createdAt;
}