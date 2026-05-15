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
                  <div className="detect-icon">{item.icon}</div>
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
                  <div className="detect-icon">{item.icon}</div>
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

      {/* 위험도 점수 안내 */}
      <section className="policy-section score-section">
        <div className="policy-container">
          <div class="section-label">위험도 산정</div>
          <h2 className="section-title">위험 점수는 어떻게 계산되나요?</h2>
          <div className="score-grid">
            <div className="score-card">
              <div className="score-badge" style={{ background: '#fff3cd', color: '#856404' }}>+30점</div>
              <h3>전화번호</h3>
              <p>1건 탐지 시</p>
            </div>
            <div className="score-card">
              <div className="score-badge" style={{ background: '#d1e7dd', color: '#0f5132' }}>+20점</div>
              <h3>이메일</h3>
              <p>1건 탐지 시</p>
            </div>
            <div className="score-card">
              <div className="score-badge" style={{ background: '#f8d7da', color: '#842029' }}>+80점</div>
              <h3>주민번호</h3>
              <p>1건 탐지 시</p>
            </div>
            <div className="score-card">
              <div className="score-badge" style={{ background: '#cff4fc', color: '#055160' }}>+15점</div>
              <h3>이름 (NER)</h3>
              <p>1건 탐지 시</p>
            </div>
            <div className="score-card">
              <div className="score-badge" style={{ background: '#e2e3e5', color: '#383d41' }}>+10점</div>
              <h3>기관/지역 (NER)</h3>
              <p>1건 탐지 시</p>
            </div>
            <div className="score-card verdict">
              <div className="verdict-row">
                <span className="verdict-badge allow">ALLOW</span>
                <span>0점 — 전송 허용</span>
              </div>
              <div className="verdict-row">
                <span className="verdict-badge mask">MASK</span>
                <span>1~69점 — 마스킹 권고</span>
              </div>
              <div className="verdict-row">
                <span className="verdict-badge warn">WARN</span>
                <span>70점 이상 — 위험 경고</span>
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