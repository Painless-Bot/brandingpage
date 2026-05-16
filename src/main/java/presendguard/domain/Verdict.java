package presendguard.domain;

import lombok.Getter;

@Getter
public enum Verdict {
    ALLOW("허용", 0, 0),
    MASK("마스킹 권고", 1, 69),
    WARN("위험 경고", 70, 100);

    private final String description;
    private final int minScore;
    private final int maxScore;

    Verdict(String description, int minScore, int maxScore) {
        this.description = description;
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public static Verdict fromScore(int score) {
        if (score >= 70) return WARN;
        if (score >= 1) return MASK;
        return ALLOW;
    }
}