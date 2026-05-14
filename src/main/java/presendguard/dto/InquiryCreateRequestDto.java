package presendguard.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InquiryCreateRequestDto {
    private String title;
    private String content;
    private Long userId;
}