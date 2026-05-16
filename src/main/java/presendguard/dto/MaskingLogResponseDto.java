package presendguard.dto;

import lombok.Getter;
import presendguard.domain.DetectionCategory;
import presendguard.domain.MaskingDetail;
import presendguard.domain.MaskingLog;
import presendguard.domain.Verdict;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class MaskingLogResponseDto {
    private final Long id;
    private final Long userId;
    private final Integer riskScore;
    private final Verdict verdict;
    private final Integer totalDetected;
    private final Integer promptLength;
    private final String promptPreview;
    private final String aiTarget;
    private final LocalDateTime createdAt;
    private final List<DetailItem> details;

    public MaskingLogResponseDto(MaskingLog log) {
        this.id = log.getId();
        this.userId = log.getUserId();
        this.riskScore = log.getRiskScore();
        this.verdict = log.getVerdict();
        this.totalDetected = log.getTotalDetected();
        this.promptLength = log.getPromptLength();
        this.promptPreview = log.getPromptPreview();
        this.aiTarget = log.getAiTarget();
        this.createdAt = log.getCreatedAt();
        this.details = log.getDetails().stream()
                .map(DetailItem::new)
                .collect(Collectors.toList());
    }

    @Getter
    public static class DetailItem {
        private final DetectionCategory category;
        private final String categoryName;
        private final String detectionType;
        private final Integer count;
        private final Integer scoreAdded;

        public DetailItem(MaskingDetail d) {
            this.category = d.getCategory();
            this.categoryName = d.getCategory().getDescription();
            this.detectionType = d.getCategory().getDetectionType();
            this.count = d.getCount();
            this.scoreAdded = d.getScoreAdded();
        }
    }
}