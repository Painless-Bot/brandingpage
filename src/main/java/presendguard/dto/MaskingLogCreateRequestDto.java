package presendguard.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import presendguard.domain.DetectionCategory;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class MaskingLogCreateRequestDto {
    private Long userId;
    private String promptText;       // 서버에서 길이/미리보기만 추출
    private String aiTarget;         // ChatGPT, Claude 등 (옵션)
    private List<DetectionItem> detections;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class DetectionItem {
        private DetectionCategory category;
        private Integer count;
    }
}