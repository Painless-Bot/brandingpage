import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import HelpCenter from './components/HelpCenter.jsx';
import HeroImage from "./assets/hero-image.png";

function App() {
  const [counts, setCounts] = useState({ total: 0, risks: 0, score: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    if (currentView !== 'main') return;

    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCounts({
        total: Math.floor(easeOut * 1284),
        risks: Math.floor(easeOut * 12),
        score: Math.floor(easeOut * 98)
      });
      if (frame === totalFrames) clearInterval(timer);
    }, frameRate);

    return () => clearInterval(timer);
  }, [currentView]);

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="branding-container">
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
            <LoginForm onLogin={(userInfo) => {
              setLoggedInUser(userInfo);
              setIsModalOpen(false);
            }} />
          </div>
        </div>
      )}

      <aside className={`side-nav ${isNavOpen ? 'open' : ''}`}>
        <button className="side-nav-close" onClick={() => setIsNavOpen(false)}>×</button>
        <div className="side-nav-header">
          <span className="logo-icon">🛡️</span>
          <h2>Menu</h2>
        </div>
        <ul className="side-nav-list">
          {loggedInUser ? (
            <li onClick={() => { navigateTo('profile'); }}>내 프로필</li>
          ) : (
            <li onClick={() => { setIsModalOpen(true); setIsNavOpen(false); }}>Login/Sign in</li>
          )}
          <li onClick={() => navigateTo('main')}>DashBoard</li>
          <li onClick={() => navigateTo('profile')}>Profile</li>
          <li onClick={() => navigateTo('policy')}>Policy</li>
          <li onClick={() => navigateTo('help')}>Help</li>
        </ul>
      </aside>
      {isNavOpen && <div className="side-nav-overlay" onClick={() => setIsNavOpen(false)}></div>}

      <nav className="site-header">
        <div className="logo-text" onClick={() => navigateTo('main')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon">🛡️</span> PreSend Guard
        </div>
        <ul className="nav-categories desktop-only">
          {!loggedInUser && (
            <li onClick={() => setIsModalOpen(true)}>로그인/회원가입</li>
          )}
          <li onClick={() => navigateTo('main')} className={currentView === 'main' ? 'active' : ''}>대시보드</li>
          <li onClick={() => navigateTo('profile')} className={currentView === 'profile' ? 'active' : ''}>Profile</li>
          <li onClick={() => navigateTo('policy')} className={currentView === 'policy' ? 'active' : ''}>Policy</li>
          <li onClick={() => navigateTo('help')} className={currentView === 'help' ? 'active' : ''}>Help</li>
          {loggedInUser && (
            <>
              <li onClick={() => navigateTo('profile')} className={currentView === 'profile' ? 'active' : ''} style={{ color: 'var(--primary-blue)', fontWeight: '700' }}>
                👤 {loggedInUser.username}
              </li>
              <li
                onClick={() => { setLoggedInUser(null); navigateTo('main'); }}
                style={{ color: '#ff4d4d', fontWeight: '700', cursor: 'pointer' }}
              >
                로그아웃
              </li>
            </>
          )}
        </ul>
        <div className="header-right">
          <button className="advanced-hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div style={{ minHeight: '80vh' }}>

        {currentView === 'main' && (
          <div className="fade-in">
            <main className="hero-main">
              <div className="hero-text-content">
                <h1 className="hero-title">PreSend Guard:<br />AI Prompt Protector</h1>
                <p className="hero-description">
                  AI 프롬프트의 개인정보 유출을 실시간으로 차단하고<br />
                  위험 점수를 분석하여 소중한 데이터를 안전하게 보호합니다.
                </p>
                <div className="button-group">
                  <button className="btn-go-back" onClick={() => navigateTo('policy')}>Learn More</button>
                  <button className="btn-get-started" onClick={() => document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' })}>
                    <span className="btn-icon">▶</span> 시작하기
                  </button>
                </div>
              </div>
              <div className="hero-visual">
                <div className="visual-mockup">
                  <img src={HeroImage} alt="AI Security" className="mockup-screenshot" />
                </div>
              </div>
            </main>
            <section className="dashboard-section" id="dashboard">
              <div className="section-header">
                <h2>Security Dashboard</h2>
                <p>실시간 보안 모니터링 현황</p>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><h3>전체 프롬프트</h3><p className="stat-number">{counts.total.toLocaleString()}</p></div>
                <div className="stat-card danger"><h3>차단된 위험</h3><p className="stat-number">{counts.risks}</p></div>
                <div className="stat-card highlight"><h3>보안 점수</h3><p className="stat-number">{counts.score}%</p></div>
              </div>
            </section>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="fade-in">
            <section className="dashboard-section" style={{ padding: '80px 0' }}>
              <h2 className="hero-title" style={{ textAlign: 'center' }}>My Profile</h2>
              {loggedInUser ? (
                <div className="login-box" style={{ background: 'white', padding: '40px', borderRadius: '30px', margin: '40px auto', maxWidth: '500px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '32px', color: 'white' }}>
                      {loggedInUser.username?.charAt(0).toUpperCase()}
                    </div>
                    <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>안녕하세요, {loggedInUser.username}님! 👋</p>
                  </div>
                  <div className="input-group"><label>Username</label><input type="text" value={loggedInUser.username || ''} readOnly /></div>
                  <div className="input-group"><label>Email Address</label><input type="email" value={loggedInUser.email || ''} readOnly /></div>
                  <div className="input-group"><label>가입일</label><input type="text" value={loggedInUser.createdAt ? new Date(loggedInUser.createdAt).toLocaleDateString('ko-KR') : ''} readOnly /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0' }}>
                    <div style={{ background: '#f8faff', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-blue)' }}>98%</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-gray)' }}>보안 점수</p>
                    </div>
                    <div style={{ background: '#f8faff', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--navy)' }}>0</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-gray)' }}>차단된 위험</p>
                    </div>
                  </div>
                  <button
                    className="btn-login-submit"
                    style={{ marginTop: '10px', background: '#ff4d4d' }}
                    onClick={() => { setLoggedInUser(null); navigateTo('main'); }}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <p style={{ color: 'var(--text-gray)', marginBottom: '20px' }}>로그인이 필요합니다.</p>
                  <button className="btn-login-submit" style={{ width: 'auto', padding: '12px 30px' }} onClick={() => setIsModalOpen(true)}>
                    로그인하기
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === 'policy' && (
          <div className="fade-in">
            <section className="dashboard-section" style={{ padding: '80px 0' }}>
              <h2 className="hero-title" style={{ textAlign: 'center', fontSize: '48px' }}>Service Policy</h2>
              <div className="visual-mockup" style={{ width: '100%', height: 'auto', transform: 'none', padding: '60px', textAlign: 'left', display: 'block', marginTop: '40px' }}>
                <div className="policy-item">
                  <h3 style={{ color: 'var(--navy)', marginBottom: '15px' }}>01. 휘발성 데이터 처리</h3>
                  <p className="hero-description" style={{ fontSize: '17px', color: 'var(--text-gray)' }}>
                    프롬프트 내역은 서버에 절대 영구 저장되지 않음<br />
                    탐지 분석 완료 즉시 메모리에서 데이터 파기 수행함
                  </p>
                </div>
                <hr style={{ margin: '40px 0', opacity: 0.1 }} />
                <div className="policy-item">
                  <h3 style={{ color: 'var(--navy)', marginBottom: '15px' }}>02. 보안 탐지 기준</h3>
                  <p className="hero-description" style={{ fontSize: '17px', color: 'var(--text-gray)' }}>
                    NER(개체명 인식) 기술 기반 고도화된 정보 식별<br />
                    주민등록번호, 계좌번호 등 핵심 데이터 필터링함
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}


        {currentView === 'help' && (
          <HelpCenter loggedInUser={loggedInUser} />
        )}

      </div>
    </div>
  );
}

export default App;