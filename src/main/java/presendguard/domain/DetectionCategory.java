package presendguard.domain;

import lombok.Getter;

@Getter
public enum DetectionCategory {
    // ===== Regex 기반 (형식 탐지) =====
    RRN("주민등록번호", "REGEX", 80),
    PASSPORT("여권번호", "REGEX", 60),
    CARD_NUMBER("카드번호", "REGEX", 50),
    ACCOUNT_NUMBER("계좌번호", "REGEX", 50),
    BUSINESS_NUMBER("사업자등록번호", "REGEX", 35),
    PHONE("전화번호", "REGEX", 30),
    EMAIL("이메일", "REGEX", 20),
    IP_ADDRESS("IP주소", "REGEX", 15),

    // ===== NER 기반 (문맥 탐지) =====
    PERSON_NAME("사람이름", "NER", 15),
    ORGANIZATION("기관/회사명", "NER", 10),
    LOCATION("지역명", "NER", 10),
    OCCUPATION("직업/직위", "NER", 8);

    private final String description;
    private final String detectionType;
    private final int scoreWeight;

    DetectionCategory(String description, String detectionType, int scoreWeight) {
        this.description = description;
        this.detectionType = detectionType;
        this.scoreWeight = scoreWeight;
    }
}