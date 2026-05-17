package presendguard.dto;

import lombok.Getter;
import presendguard.domain.Prompt;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Getter
public class PromptResponseDto {

    private static final Pattern REASON_PATTERN = Pattern.compile("(\\w+)\\s*:\\s*(\\d+)");

    private final Long id;
    private final String prompt;
    private final String reasons;
    private final Map<String, Integer> reasonsParsed;
    private final Integer riskScore;
    private final String verdict;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public PromptResponseDto(Prompt p) {
        this.id = p.getId();
        this.prompt = p.getPrompt();
        this.reasons = p.getReasons();
        this.reasonsParsed = parseReasons(p.getReasons());
        this.riskScore = p.getRiskScore();
        this.verdict = p.getVerdict();
        this.createdAt = p.getCreatedAt();
        this.updatedAt = p.getUpdatedAt();
    }

    /**
     * "phone: 1, email: 0, rrn: 0" → {phone=1, email=0, rrn=0}
     * 0인 항목도 그대로 유지 (필요한 쪽에서 필터링).
     */
    private Map<String, Integer> parseReasons(String reasonsStr) {
        Map<String, Integer> result = new LinkedHashMap<>();
        if (reasonsStr == null || reasonsStr.isBlank()) return result;

        Matcher m = REASON_PATTERN.matcher(reasonsStr);
        while (m.find()) {
            String key = m.group(1).toLowerCase();
            try {
                result.put(key, Integer.parseInt(m.group(2)));
            } catch (NumberFormatException ignored) {
            }
        }
        return result;
    }
}