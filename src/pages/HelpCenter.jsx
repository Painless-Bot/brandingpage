import { useState, useEffect } from 'react';
import './HelpCenter.css';

const API_BASE = 'http://localhost:8080';

const STATUS_LABEL = {
  PENDING: { text: '접수', className: 'status-pending' },
  IN_PROGRESS: { text: '진행', className: 'status-progress' },
  COMPLETED: { text: '완료', className: 'status-completed' },
};

export default function HelpCenter({ loggedInUser, onRequireLogin }) {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'guide' | 'inquiry'
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // 문의 작성 폼
  const [form, setForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  // 내 문의 내역 불러오기
  const fetchMyInquiries = async () => {
    if (!loggedInUser?.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/help/inquiries/user/${loggedInUser.id}`);
      if (!res.ok) throw new Error('문의 내역을 불러오지 못했습니다.');
      const data = await res.json();
      setInquiries(data);
    } catch (e) {
      setError(e.message || '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inquiry' && loggedInUser?.id) {
      fetchMyInquiries();
    }
  }, [activeTab, loggedInUser]);

  // 문의 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loggedInUser?.id) {
      onRequireLogin?.();
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/help/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: loggedInUser.id,
          title: form.title,
          content: form.content,
        }),
      });
      if (!res.ok) throw new Error('문의 등록에 실패했습니다.');
      setSuccessMsg('문의가 정상적으로 접수되었습니다! 🎉');
      setForm({ title: '', content: '' });
      fetchMyInquiries();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e.message || '서버에 연결할 수 없습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 문의 삭제
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('이 문의를 정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/help/inquiry/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      setInquiries(inquiries.filter((q) => q.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <section className="help-center">
      <div className="help-hero">
        <div className="help-badge">고객 지원</div>
        <h1 className="help-title">
          무엇을 도와드릴까요?
        </h1>
        <p className="help-subtitle">
          PreSend Guard 사용 중 궁금한 점이나 문제가 있으면<br />
          언제든지 문의해주세요.
        </p>
      </div>

      {/* 탭 */}
      <div className="help-tabs">
        <button
          className={`help-tab ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <span className="tab-icon">❓</span>
          <div className="tab-text">
            <strong>FAQ</strong>
            <span>자주 묻는 질문</span>
          </div>
        </button>
        <button
          className={`help-tab ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <span className="tab-icon">📖</span>
          <div className="tab-text">
            <strong>Guide</strong>
            <span>사용 가이드</span>
          </div>
        </button>
        <button
          className={`help-tab ${activeTab === 'inquiry' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiry')}
        >
          <span className="tab-icon">💬</span>
          <div className="tab-text">
            <strong>1:1 문의</strong>
            <span>{loggedInUser ? '문의 작성/내역' : '로그인 필요'}</span>
          </div>
        </button>
      </div>

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="help-content">
          <div className="faq-list">
            {[
              { q: 'PreSend Guard는 어떤 서비스인가요?', a: 'AI 프롬프트 입력 시 개인정보 유출 위험을 실시간으로 분석하고 차단하는 보안 솔루션입니다.' },
              { q: '어떤 종류의 개인정보를 탐지하나요?', a: '주민등록번호, 전화번호, 이메일, 카드번호 등 정규식 기반 탐지와 이름, 기관명 등 NER 기반 탐지를 모두 지원합니다.' },
              { q: '위험 점수는 어떻게 계산되나요?', a: '탐지된 항목별로 가중치를 부여하여 합산합니다. 자세한 점수 체계는 Policy 페이지에서 확인할 수 있습니다.' },
              { q: '서비스 이용 요금이 있나요?', a: '현재 베타 기간으로 무료로 이용 가능합니다.' },
              { q: '입력한 프롬프트는 저장되나요?', a: '탐지 결과 통계만 저장되며, 원본 프롬프트 내용은 저장하지 않습니다.' },
            ].map((item, i) => (
              <details className="faq-item" key={i}>
                <summary>
                  <span className="faq-q">Q{i + 1}.</span> {item.q}
                </summary>
                <p className="faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Guide */}
      {activeTab === 'guide' && (
        <div className="help-content">
          <div className="guide-grid">
            {[
              { icon: '🚀', title: '시작하기', desc: '회원가입부터 첫 프롬프트 검사까지의 빠른 시작 가이드' },
              { icon: '🛡️', title: '탐지 설정', desc: '탐지 항목과 위험 점수 임계값을 설정하는 방법' },
              { icon: '📊', title: '대시보드 활용', desc: '보안 통계와 분석 리포트를 효과적으로 활용하는 방법' },
              { icon: '⚙️', title: '고급 옵션', desc: 'API 연동, 커스텀 규칙 추가 등 고급 기능 안내' },
            ].map((item, i) => (
              <div className="guide-card" key={i}>
                <div className="guide-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1:1 문의 */}
      {activeTab === 'inquiry' && (
        <div className="help-content">
          {!loggedInUser ? (
            <div className="login-required">
              <div className="lr-icon">🔒</div>
              <h3>로그인이 필요합니다</h3>
              <p>1:1 문의 작성과 내역 조회는 로그인 후 이용 가능합니다.</p>
              <button className="btn-primary" onClick={onRequireLogin}>
                로그인하기
              </button>
            </div>
          ) : (
            <div className="inquiry-section">
              {/* 문의 작성 폼 */}
              <div className="inquiry-form-card">
                <h3 className="inquiry-section-title">새 문의 작성</h3>
                {error && <div className="inquiry-error">⚠️ {error}</div>}
                {successMsg && <div className="inquiry-success">✅ {successMsg}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <label>제목</label>
                    <input
                      type="text"
                      placeholder="문의 제목을 입력하세요"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>내용</label>
                    <textarea
                      placeholder="문의하실 내용을 자세히 적어주세요"
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? '전송 중...' : '문의 보내기'}
                  </button>
                </form>
              </div>

              {/* 내 문의 내역 */}
              <div className="inquiry-list-card">
                <div className="inquiry-list-header">
                  <h3 className="inquiry-section-title">내 문의 내역</h3>
                  <button
                    className="btn-refresh"
                    onClick={fetchMyInquiries}
                    disabled={loading}
                  >
                    {loading ? '불러오는 중...' : '🔄 새로고침'}
                  </button>
                </div>

                {loading && inquiries.length === 0 && (
                  <div className="inquiry-empty">불러오는 중...</div>
                )}

                {!loading && inquiries.length === 0 && (
                  <div className="inquiry-empty">
                    <p>아직 작성한 문의가 없습니다.</p>
                    <small>위 폼에서 첫 문의를 남겨보세요.</small>
                  </div>
                )}

                {inquiries.length > 0 && (
                  <ul className="inquiry-list">
                    {inquiries.map((q) => {
                      const statusInfo = STATUS_LABEL[q.status] || STATUS_LABEL.PENDING;
                      const isOpen = selectedInquiry?.id === q.id;
                      return (
                        <li
                          key={q.id}
                          className={`inquiry-item ${isOpen ? 'open' : ''}`}
                          onClick={() => setSelectedInquiry(isOpen ? null : q)}
                        >
                          <div className="inquiry-header">
                            <div className="inquiry-meta">
                              <span className={`inquiry-status ${statusInfo.className}`}>
                                {statusInfo.text}
                              </span>
                              <span className="inquiry-date">{formatDate(q.createdAt)}</span>
                            </div>
                            <button
                              className="inquiry-delete"
                              onClick={(e) => handleDelete(q.id, e)}
                              title="삭제"
                            >
                              ✕
                            </button>
                          </div>
                          <h4 className="inquiry-title-text">{q.title}</h4>
                          {isOpen && (
                            <div className="inquiry-body">
                              <div className="inquiry-content-block">
                                <strong>문의 내용</strong>
                                <p>{q.content}</p>
                              </div>
                              {q.adminReply ? (
                                <div className="inquiry-reply-block">
                                  <strong>관리자 답변</strong>
                                  <p>{q.adminReply}</p>
                                </div>
                              ) : (
                                <div className="inquiry-reply-block pending">
                                  <em>아직 답변이 등록되지 않았습니다.</em>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
