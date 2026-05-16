import { useState } from 'react';

const HelpCenter = ({ loggedInUser }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [inquiryForm, setInquiryForm] = useState({ title: '', content: '' });
  const [myInquiries, setMyInquiries] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('');
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  const faqList = [
    { q: '개인정보가 서버에 저장되나요?', a: '아니요. 분석 완료 즉시 메모리에서 파기됩니다.' },
    { q: '어떤 정보를 탐지하나요?', a: '주민등록번호, 계좌번호, 전화번호 등 NER 기반으로 식별합니다.' },
    { q: '서비스는 무료인가요?', a: '기본 기능은 무료로 제공되며, 추가 기능은 추후 공지됩니다.' },
  ];

  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async () => {
    if (!loggedInUser) {
      setSubmitStatus('error:로그인이 필요합니다.');
      return;
    }
    if (!inquiryForm.title || !inquiryForm.content) {
      setSubmitStatus('error:제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/help/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: loggedInUser.id ?? 1, // 실제 userId 필드로 교체 필요
          title: inquiryForm.title,
          content: inquiryForm.content,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success:문의가 성공적으로 접수되었습니다! 🎉');
        setInquiryForm({ title: '', content: '' });
      } else {
        setSubmitStatus('error:문의 접수 중 오류가 발생했습니다.');
      }
    } catch {
      setSubmitStatus('error:서버에 연결할 수 없습니다.');
    }
  };

  const loadMyInquiries = async () => {
    if (!loggedInUser) {
      setSubmitStatus('error:로그인이 필요합니다.');
      return;
    }
    setIsLoadingInquiries(true);
    try {
      const userId = loggedInUser.id ?? 1;
      const response = await fetch(`http://localhost:8080/api/help/inquiries/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMyInquiries(data);
      }
    } catch {
      setSubmitStatus('error:문의 내역을 불러올 수 없습니다.');
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const statusLabel = { PENDING: '접수', IN_PROGRESS: '진행', COMPLETED: '완료' };
  const statusColor = { PENDING: '#f0a500', IN_PROGRESS: '#3b71e8', COMPLETED: '#22c55e' };

  const [status, message] = submitStatus.split(':');

  return (
    <div className="fade-in">
      <section className="dashboard-section" style={{ padding: '80px 0' }}>
        <h2 className="hero-title" style={{ textAlign: 'center', fontSize: '48px' }}>Help Center</h2>

        {/* 탭 메뉴 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '40px', marginBottom: '40px' }}>
          {['faq', 'guide', 'support', 'myInquiries'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSubmitStatus(''); if (tab === 'myInquiries') loadMyInquiries(); }}
              style={{
                padding: '12px 28px',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                background: activeTab === tab ? 'var(--primary-blue)' : 'white',
                color: activeTab === tab ? 'white' : 'var(--text-gray)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
              }}
            >
              {tab === 'faq' ? 'FAQ' : tab === 'guide' ? 'Guide' : tab === 'support' ? '1:1 문의' : '내 문의내역'}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {faqList.map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '30px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <p style={{ fontWeight: '800', color: 'var(--navy)', marginBottom: '10px' }}>Q. {item.q}</p>
                <p style={{ color: 'var(--text-gray)', fontSize: '15px' }}>A. {item.a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Guide */}
        {activeTab === 'guide' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: 'var(--navy)', marginBottom: '20px', fontSize: '22px' }}>📖 서비스 사용 가이드</h3>
              {['Chrome 확장 프로그램을 설치합니다.', 'AI 채팅 서비스(ChatGPT 등)에서 프롬프트를 입력합니다.', 'PreSend Guard가 개인정보를 자동으로 감지합니다.', '위험 항목이 발견되면 경고 알림이 표시됩니다.', '안전 확인 후 프롬프트를 전송합니다.'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>{i + 1}</div>
                  <p style={{ color: 'var(--text-gray)', paddingTop: '4px', fontSize: '16px' }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1:1 문의 */}
        {activeTab === 'support' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '30px', padding: '50px', boxShadow: '0 15px 40px rgba(0,0,0,0.07)' }}>
            <h3 style={{ color: 'var(--navy)', marginBottom: '24px', fontSize: '22px' }}>✉️ 1:1 문의하기</h3>

            {submitStatus && (
              <div style={{
                background: status === 'success' ? '#f0fff4' : '#fff0f0',
                border: `1px solid ${status === 'success' ? '#bbf7d0' : '#ffcccc'}`,
                borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                color: status === 'success' ? '#15803d' : '#cc0000',
                fontSize: '14px', textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            <div className="input-group">
              <label>제목</label>
              <input name="title" type="text" placeholder="문의 제목을 입력하세요" value={inquiryForm.title} onChange={handleInquiryChange} />
            </div>
            <div className="input-group">
              <label>내용</label>
              <textarea
                name="content"
                placeholder="문의 내용을 상세히 입력해주세요"
                value={inquiryForm.content}
                onChange={handleInquiryChange}
                rows={6}
                style={{ width: '100%', padding: '18px 20px', border: '1.5px solid #eef2f7', borderRadius: '16px', background: '#fdfdfe', fontSize: '16px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <button className="btn-login-submit" onClick={handleInquirySubmit} style={{ marginTop: '10px' }}>
              문의 접수하기
            </button>
            {!loggedInUser && (
              <p style={{ color: 'var(--text-gray)', fontSize: '13px', textAlign: 'center', marginTop: '12px' }}>
                ⚠️ 로그인 후 문의를 접수할 수 있습니다.
              </p>
            )}
          </div>
        )}

        {/* 내 문의내역 */}
        {activeTab === 'myInquiries' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {isLoadingInquiries ? (
              <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>불러오는 중...</p>
            ) : myInquiries.length === 0 ? (
              <div style={{ textAlign: 'center', background: 'white', borderRadius: '20px', padding: '50px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <p style={{ color: 'var(--text-gray)', fontSize: '16px' }}>문의 내역이 없습니다.</p>
              </div>
            ) : (
              myInquiries.map((inq) => (
                <div key={inq.id} style={{ background: 'white', borderRadius: '20px', padding: '30px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontWeight: '800', color: 'var(--navy)', fontSize: '17px' }}>{inq.title}</p>
                    <span style={{ background: statusColor[inq.status], color: 'white', padding: '4px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '700' }}>
                      {statusLabel[inq.status]}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '10px' }}>{inq.content}</p>
                  {inq.adminReply && (
                    <div style={{ background: '#f0f8ff', borderRadius: '12px', padding: '14px', marginTop: '10px' }}>
                      <p style={{ fontWeight: '700', color: 'var(--primary-blue)', fontSize: '13px', marginBottom: '6px' }}>💬 관리자 답변</p>
                      <p style={{ color: 'var(--text-dark)', fontSize: '14px' }}>{inq.adminReply}</p>
                    </div>
                  )}
                  <p style={{ color: '#aaa', fontSize: '12px', marginTop: '10px' }}>{new Date(inq.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HelpCenter;