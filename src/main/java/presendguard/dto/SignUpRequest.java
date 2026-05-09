package presendguard.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SignUpRequest { // 파일명도 반드시 SignUpRequest.java 여야 함
    private String email;
    private String password;
    private String username;
}