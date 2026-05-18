import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import { getCurrentUser, logout, apiFetch } from './components/util/api';
import HeroImage from "./assets/hero-image.png";
import PolicyPage from './pages/PolicyPage';
import HelpCenter from './pages/HelpCenter';
import PromptDashboard from './pages/PromptDashboard';

function App() {
  const [counts, setCounts] = useState({ total: 0, risks: 0, score: 0 });
  const [realData, setRealData] = useState({ total: 0, risks: 0, score: 100 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main');

  // ⭐ 새로고침 시 localStorage에서 사용자 정보 복원
  const [loggedInUser, setLoggedInUser] = useState(() => {
    return getCurrentUser();
  });

  // ⭐ 로그아웃 핸들러
  const handleLogout = () => {
    logout();
    setLoggedInUser(null);
    navigateTo('main');
  };

  // ⭐ 메인 화면용 실제 데이터 가져오기
  useEffect(() => {
    if (currentView !== 'main') return;
    if (!loggedInUser) {
      // 로그아웃 상태면 0으로 표시
      setRealData({ total: 0, risks: 0, score: 100 });
      return;
    }

    const fetchRealStats = async () => {
      try {
        const res = await apiFetch('/api/prompt/dashboard?days=30');
        if (!res.ok) return;
        const data = await res.json();

        // 차단된 위험 = WARN + BLOCK (실제 위험 판정된 항목)
        const risks = (data.warnCount || 0) + (data.blockCount || 0);

        setRealData({
          total: data.totalChecked || 0,
          risks: risks,
          score: data.securityScore || 100
        });
      } catch (err) {
        console.error('대시보드 데이터 로드 실패:', err);
      }
    };

    fetchRealStats();
  }, [currentView, loggedInUser]);

  // ⭐ 카운트업 애니메이션 (실제 데이터 기반)
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
        total: Math.floor(easeOut * realData.total),
        risks: Math.floor(easeOut * realData.risks),
        score: Math.floor(easeOut * realData.score)
      });
      if (frame === totalFrames) clearInterval(timer);
    }, frameRate);

    return () => clearInterval(timer);
  }, [currentView, realData]);

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
            <li onClick={() => { setIsModalOpen(true); setIsNavOpen(false); }}>로그인</li>
          )}
          <li onClick={() => navigateTo('main')}>대시보드</li>
          <li onClick={() => navigateTo('analytics')}>📊 분석</li>
          <li onClick={() => navigateTo('profile')}>프로필</li>
          <li onClick={() => navigateTo('policy')}>정책</li>
          <li onClick={() => navigateTo('help')}>고객지원</li>
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
          <li onClick={() => navigateTo('analytics')} className={currentView === 'analytics' ? 'active' : ''}>📊 분석</li>
          <li onClick={() => navigateTo('profile')} className={currentView === 'profile' ? 'active' : ''}>프로필</li>
          <li onClick={() => navigateTo('policy')} className={currentView === 'policy' ? 'active' : ''}>정책</li>
          <li onClick={() => navigateTo('help')} className={currentView === 'help' ? 'active' : ''}>고객지원</li>
          {loggedInUser && (
            <>
              <li onClick={() => navigateTo('profile')} className={currentView === 'profile' ? 'active' : ''} style={{ color: 'var(--primary-blue)', fontWeight: '700' }}>
                👤 {loggedInUser.username}
              </li>
              <li
                onClick={handleLogout}
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
                  <button
                    className="btn-get-started"
                    onClick={() => {
                      if (loggedInUser) navigateTo('analytics');
                      else setIsModalOpen(true);
                    }}
                  >
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
                <p>
                  {loggedInUser
                    ? `${loggedInUser.username}님의 실시간 보안 모니터링 현황`
                    : '로그인하면 본인의 보안 통계를 확인할 수 있습니다'}
                </p>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>전체 프롬프트</h3>
                  <p className="stat-number">{counts.total.toLocaleString()}</p>
                </div>
                <div className="stat-card danger">
                  <h3>차단된 위험</h3>
                  <p className="stat-number">{counts.risks}</p>
                </div>
                <div className="stat-card highlight">
                  <h3>보안 점수</h3>
                  <p className="stat-number">{counts.score}%</p>
                </div>
              </div>
              <div style={{ marginTop: 40, textAlign: 'center' }}>
                <button
                  className="btn-get-started"
                  onClick={() => {
                    if (loggedInUser) navigateTo('analytics');
                    else setIsModalOpen(true);
                  }}
                >
                  {loggedInUser ? '상세 분석 보기 →' : '로그인하고 시작하기 →'}
                </button>
              </div>
            </section>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="fade-in">
            <PromptDashboard />
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
                  <button
                    className="btn-login-submit"
                    style={{ marginTop: '10px', background: '#ff4d4d' }}
                    onClick={handleLogout}
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
            <PolicyPage navigateTo={navigateTo} />
          </div>
        )}

        {currentView === 'help' && (
          <div className="fade-in">
            <HelpCenter
              loggedInUser={loggedInUser}
              onRequireLogin={() => setIsModalOpen(true)}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;