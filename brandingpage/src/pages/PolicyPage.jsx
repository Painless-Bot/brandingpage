import { useState } from 'react';
import './PolicyPage.css';

const regexItems = [
  { title: '주민등록번호', desc: '6자리-7자리 형식 탐지', law: '개인정보보호법 제24조' },
  { title: '전화번호', desc: '010, 011, 016, 017, 018, 019 시작 번호', law: '개인정보보호법 제15조' },
  { title: '이메일', desc: '이메일 주소 형식 탐지', law: '개인정보보호법 제15조' },
  { title: '카드번호', desc: '16자리 신용카드 번호 패턴', law: '개인정보보호법 제24조' },
  { title: '계좌번호', desc: '금융기관 계좌번호 패턴', law: '개인정보보호법 제24조' },
  { title: 'IP 주소', desc: 'IPv4 형식 주소 탐지', law: '개인정보보호법 제2조' },
  { title: '사업자등록번호', desc: '10자리 사업자번호 형식', law: '개인정보보호법 제15조' },
  { title: '여권번호', desc: '알파벳+숫자 조합 여권번호', law: '개인정보보호법 제24조' },
];

const nerItems = [
  { title: '사람 이름', tag: 'PER', desc: '문맥 기반 인명 탐지' },
  { title: '기관명', tag: 'ORG', desc: '회사, 단체, 기관 명칭' },
  { title: '지역명', tag: 'LOC', desc: '도시, 지역, 장소명' },
  { title: '학교명', tag: 'ORG', desc: '교육기관 명칭 탐지' },
  { title: '회사명', tag: 'ORG', desc: '기업 및 법인 명칭' },
  { title: '직업', tag: 'CVL', desc: '직종 및 직위 정보' },
  { title: '부서명', tag: 'ORG', desc: '조직 내 부서 명칭' },
];

const laws = [
  {
    num: '제15조',
    title: '개인정보의 수집·이용',
    desc: '정보주체의 동의 없이 개인정보를 수집하거나 이용할 수 없습니다. AI 서비스에 개인정보를 입력하는 행위는 제3자 제공에 해당할 수 있습니다.'
  },
  {
    num: '제24조',
    title: '고유식별정보의 처리 제한',
    desc: '주민등록번호, 여권번호, 운전면허번호, 외국인등록번호는 별도 동의 또는 법령 근거 없이 처리할 수 없는 고유식별정보입니다.'
  },
  {
    num: '제29조',
    title: '안전조치의무',
    desc: '개인정보처리자는 개인정보가 분실·도난·유출되지 않도록 안전성 확보에 필요한 기술적·관리적 보호조치를 취해야 합니다.'
  },
  {
    num: '제39조',
    title: '손해배상책임',
    desc: '개인정보 유출로 인한 손해가 발생한 경우, 처리자는 손해배상 책임을 집니다. AI 입력을 통한 유출도 해당될 수 있습니다.'
  },
];

const scoreItems = [
  { score: 80, name: '주민번호', color: '#cc0000', bg: '#f8d7da', textColor: '#842029' },
  { score: 30, name: '전화번호', color: '#faad14', bg: '#fff3cd', textColor: '#856404' },
  { score: 20, name: '이메일', color: '#52c41a', bg: '#d1e7dd', textColor: '#0f5132' },
  { score: 15, name: '이름 (NER)', color: '#1890ff', bg: '#cff4fc', textColor: '#055160' },
  { score: 10, name: '기관/지역 (NER)', color: '#888', bg: '#e2e3e5', textColor: '#383d41' },
];

const verdicts = [
  {
    code: 'ALLOW',
    label: '안전',
    range: '0점',
    desc: '민감정보가 탐지되지 않아 안전하게 전송할 수 있습니다.',
    color: '#0f5132',
    bg: '#d1e7dd',
    light: '#f0faf3',
    icon: '✅',
    rangeStart: 0,
    rangeEnd: 0,
  },
  {
    code: 'MASK',
    label: '마스킹 권고',
    range: '1 ~ 69점',
    desc: '민감정보가 포함되어 있어 마스킹 후 전송이 권장됩니다.',
    color: '#856404',
    bg: '#fff3cd',
    light: '#fffaf0',
    icon: '🔒',
    rangeStart: 1,
    rangeEnd: 69,
  },
  {
    code: 'WARN',
    label: '위험 경고',
    range: '70점 이상',
    desc: '치명적 민감정보가 포함되어 전송을 중단하고 검토가 필요합니다.',
    color: '#842029',
    bg: '#f8d7da',
    light: '#fdf5f6',
    icon: '⚠️',
    rangeStart: 70,
    rangeEnd: 100,
  },
];

export default function PolicyPage({ navigateTo }) {
  const [activeTab, setActiveTab] = useState('regex');

  return (
    <div className="policy-page">
      {/* Hero */}
      <section className="policy-hero">
        <div className="policy-hero-inner">
          <div className="policy-badge">개인정보보호법 기반</div>
          <h1 className="policy-title">
            탐지 정책 &<br />
            <span className="policy-title-accent">법적 근거</span>
          </h1>
          <p className="policy-subtitle">
            PreSend Guard는 개인정보보호법에 근거하여<br />
            AI 프롬프트 내 민감정보를 탐지하고 보호합니다.
          </p>
        </div>
        <div className="policy-hero-deco">
          <div className="deco-circle deco-1" />
          <div className="deco-circle deco-2" />
          <div className="deco-circle deco-3" />
        </div>
      </section>

      {/* 탐지 항목 */}
      <section className="policy-section">
        <div className="policy-container">
          <div className="section-label">탐지 방식</div>
          <h2 className="section-title">무엇을 탐지하나요?</h2>

          {/* 탭 */}
          <div className="policy-tabs">
            <button
              className={`policy-tab ${activeTab === 'regex' ? 'active' : ''}`}
              onClick={() => setActiveTab('regex')}
            >
              Regex 탐지
              <span className="tab-desc">형식 기반</span>
            </button>
            <button
              className={`policy-tab ${activeTab === 'ner' ? 'active' : ''}`}
              onClick={() => setActiveTab('ner')}
            >
              NER 탐지
              <span className="tab-desc">문맥 기반</span>
            </button>
          </div>

          {/* Regex 항목 */}
          {activeTab === 'regex' && (
            <div className="detect-grid">
              {regexItems.map((item, i) => (
                <div className="detect-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="detect-info">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <span className="detect-law">{item.law}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NER 항목 */}
          {activeTab === 'ner' && (
            <div className="detect-grid">
              {nerItems.map((item, i) => (
                <div className="detect-card ner" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="detect-info">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <span className="detect-tag">{item.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 법적 근거 */}
      <section className="policy-section law-section">
        <div className="policy-container">
          <div className="section-label">법적 근거</div>
          <h2 className="section-title">개인정보보호법 주요 조항</h2>
          <div className="law-grid">
            {laws.map((law, i) => (
              <div className="law-card" key={i}>
                <div className="law-num">{law.num}</div>
                <h3 className="law-title">{law.title}</h3>
                <p className="law-desc">{law.desc}</p>
              </div>
            ))}
          </div>
          <div className="law-link-wrap">
            <a
              href="https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=36"
              target="_blank"
              rel="noreferrer"
              className="law-link"
            >
              개인정보 포털에서 전문 보기 →
            </a>
          </div>
        </div>
      </section>

      {/* 위험도 점수 - 메인 섹션 ⭐ */}
      <section className="policy-section score-section">
        <div className="policy-container">
          <div className="section-label">위험도 산정</div>
          <h2 className="section-title">위험 점수는 어떻게 계산되나요?</h2>
          <p className="score-intro">
            탐지된 항목별 점수를 합산하여 최종 위험도를 산정하고,
            점수 구간에 따라 자동으로 판정이 이루어집니다.
          </p>

          {/* 메인 그리드: 좌(점수표) + 우(판정 메인) */}
          <div className="score-main-grid">

            {/* 왼쪽: 점수 항목 리스트 */}
            <aside className="score-items-panel">
              <div className="panel-header">
                <h3>📋 항목별 점수</h3>
                <span className="panel-sub">탐지 시 부여되는 점수</span>
              </div>

              <div className="score-items-list">
                {scoreItems.map((item, i) => (
                  <div className="score-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="score-item-left">
                      <span className="score-item-name">{item.name}</span>
                      <span className="score-item-desc">1건 탐지 시</span>
                    </div>
                    <div
                      className="score-item-value"
                      style={{ background: item.bg, color: item.textColor }}
                    >
                      +{item.score}
                    </div>
                  </div>
                ))}
              </div>

              <div className="score-formula">
                <div className="formula-label">계산 방식</div>
                <div className="formula-text">
                  탐지 점수 × 건수의 <strong>합계</strong>
                </div>
              </div>
            </aside>

            {/* 오른쪽: 판정 시스템 (메인) ⭐ */}
            <div className="verdict-main-panel">
              <div className="verdict-panel-header">
                <h3>🎯 최종 판정 시스템</h3>
                <span className="panel-sub">총점에 따른 자동 판정</span>
              </div>

              {/* 점수 스펙트럼 게이지 */}
              <div className="verdict-spectrum">
                <div className="spectrum-bar">
                  <div className="spectrum-segment allow-seg" style={{ flex: '0 0 8%' }}>
                    <span className="seg-label">0</span>
                  </div>
                  <div className="spectrum-segment mask-seg" style={{ flex: '0 0 62%' }}>
                    <span className="seg-label">1 ~ 69</span>
                  </div>
                  <div className="spectrum-segment warn-seg" style={{ flex: '0 0 30%' }}>
                    <span className="seg-label">70 ~ 100</span>
                  </div>
                </div>
                <div className="spectrum-axis">
                  <span>안전</span>
                  <span>주의</span>
                  <span>위험</span>
                </div>
              </div>

              {/* 판정 카드 3종 (세로 배치, 큼) */}
              <div className="verdict-cards-vertical">
                {verdicts.map((v, i) => (
                  <div
                    className={`verdict-big-card verdict-${v.code.toLowerCase()}`}
                    key={i}
                    style={{
                      borderLeftColor: v.color,
                      animationDelay: `${0.3 + i * 0.12}s`
                    }}
                  >
                    <div className="verdict-icon-wrap" style={{ background: v.bg }}>
                      <span className="verdict-emoji">{v.icon}</span>
                    </div>

                    <div className="verdict-content">
                      <div className="verdict-header-row">
                        <span
                          className="verdict-code-badge"
                          style={{ background: v.bg, color: v.color }}
                        >
                          {v.code}
                        </span>
                        <span className="verdict-range" style={{ color: v.color }}>
                          {v.range}
                        </span>
                      </div>
                      <h4 className="verdict-label" style={{ color: v.color }}>{v.label}</h4>
                      <p className="verdict-desc">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 예시 시나리오 */}
              <div className="verdict-example">
                <div className="example-label">💡 예시</div>
                <div className="example-text">
                  <span className="example-input">"제 전화번호는 010-1234-5678이고 이메일은 abc@gmail.com 이에요"</span>
                  <div className="example-arrow">↓</div>
                  <div className="example-calc">
                    <span className="calc-item">전화번호 +30</span>
                    <span className="calc-op">+</span>
                    <span className="calc-item">이메일 +20</span>
                    <span className="calc-op">=</span>
                    <span className="calc-result">50점</span>
                  </div>
                  <div className="example-verdict">
                    <span className="verdict-code-badge" style={{ background: '#fff3cd', color: '#856404' }}>
                      🔒 MASK
                    </span>
                    <span>마스킹 권고</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="policy-footer">
        <div className="policy-container">
          <p>© 2026 PreSend Guard. 개인정보보호법 기반 AI 프롬프트 보호 솔루션.</p>
          <p>
            <a href="https://www.privacy.go.kr" target="_blank" rel="noreferrer">
              개인정보 포털 바로가기
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}