import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import './MaskingDashboard.css';

const API_BASE = 'http://localhost:8080';

const VERDICT_META = {
  ALLOW: { label: '허용', className: 'v-allow', color: '#0f5132' },
  MASK: { label: '마스킹', className: 'v-mask', color: '#856404' },
  WARN: { label: '경고', className: 'v-warn', color: '#842029' },
};

// 도넛 차트용 컬러 팔레트 (디자인 톤에 맞춤)
const PIE_COLORS = [
  '#3b71e8', '#000080', '#ff8c42', '#52c41a', '#722ed1',
  '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#1890ff'
];

// 보안 점수 → 등급
function gradeOf(score) {
  if (score >= 90) return { grade: 'A+', color: '#0f5132', label: '매우 안전' };
  if (score >= 75) return { grade: 'A', color: '#3b71e8', label: '안전' };
  if (score >= 60) return { grade: 'B', color: '#faad14', label: '주의' };
  if (score >= 40) return { grade: 'C', color: '#ff7a45', label: '위험' };
  return { grade: 'D', color: '#cc0000', label: '매우 위험' };
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}

export default function MaskingDashboard({ loggedInUser, onRequireLogin }) {
  const [period, setPeriod] = useState(30); // 7 / 30 / 90 days
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    if (!loggedInUser?.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${API_BASE}/api/masking/dashboard/${loggedInUser.id}?days=${period}`
      );
      if (!res.ok) throw new Error('대시보드 데이터를 불러오지 못했습니다.');
      setDashboard(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (pageNum = 0) => {
    if (!loggedInUser?.id) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/masking/logs/${loggedInUser.id}?page=${pageNum}&size=10`
      );
      if (!res.ok) throw new Error('로그를 불러오지 못했습니다.');
      const data = await res.json();
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(pageNum);
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchLogDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/masking/log/${id}`);
      if (!res.ok) throw new Error('상세 정보를 불러오지 못했습니다.');
      setSelectedLog(await res.json());
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('이 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/masking/log/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      fetchLogs(page);
      fetchDashboard();
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    if (loggedInUser?.id) {
      fetchDashboard();
      fetchLogs(0);
    }
  }, [loggedInUser, period]);

  // 차트 데이터 가공
  const trendData = useMemo(() => {
    if (!dashboard?.riskTrend) return [];
    return dashboard.riskTrend.map((p) => ({
      date: p.date?.slice(5),  // "05-16"
      위험점수: p.avgRiskScore,
      검사건수: p.count,
    }));
  }, [dashboard]);

  const pieData = useMemo(() => {
    if (!dashboard?.categoryStats) return [];
    return dashboard.categoryStats.map((c) => ({
      name: c.categoryName,
      value: c.totalCount,
      percentage: c.percentage,
      type: c.detectionType,
    }));
  }, [dashboard]);

  // 로그인 안 한 상태
  if (!loggedInUser) {
    return (
      <div className="md-login-required">
        <div className="md-lr-icon">🔒</div>
        <h2>로그인이 필요합니다</h2>
        <p>마스킹 대시보드는 로그인 후 이용 가능합니다.</p>
        <button className="md-btn-primary" onClick={onRequireLogin}>로그인하기</button>
      </div>
    );
  }

  const score = dashboard?.securityScore ?? 100;
  const g = gradeOf(score);

  return (
    <div className="masking-dashboard">
      {/* 헤더 */}
      <div className="md-header">
        <div>
          <h1 className="md-title">Security Dashboard</h1>
          <p className="md-subtitle">
            <strong>{loggedInUser.username}</strong>님의 프롬프트 보안 현황
          </p>
        </div>
        <div className="md-period-switch">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`md-period-btn ${period === d ? 'active' : ''}`}
              onClick={() => setPeriod(d)}
            >
              최근 {d}일
            </button>
          ))}
        </div>
      </div>

      {error && <div className="md-error">⚠️ {error}</div>}

      {/* ===== 메인 보안 점수 ===== */}
      <section className="md-score-section">
        <div className="md-score-main">
          <div className="md-score-label">보안 점수</div>
          <div className="md-score-value" style={{ color: g.color }}>
            {score}
            <span className="md-score-unit">/ 100</span>
          </div>
          <div className="md-grade-badge" style={{ background: g.color }}>
            {g.grade} · {g.label}
          </div>
          {/* 게이지 바 */}
          <div className="md-gauge-track">
            <div
              className="md-gauge-fill"
              style={{ width: `${score}%`, background: g.color }}
            />
          </div>
        </div>

        {/* 우측 요약 통계 */}
        <div className="md-stats-row">
          <div className="md-stat-card">
            <div className="md-stat-icon">📊</div>
            <div>
              <div className="md-stat-num">{dashboard?.totalChecked ?? 0}</div>
              <div className="md-stat-label">전체 검사</div>
            </div>
          </div>
          <div className="md-stat-card v-allow-bg">
            <div className="md-stat-icon">✅</div>
            <div>
              <div className="md-stat-num">{dashboard?.allowCount ?? 0}</div>
              <div className="md-stat-label">안전 (ALLOW)</div>
            </div>
          </div>
          <div className="md-stat-card v-mask-bg">
            <div className="md-stat-icon">🔒</div>
            <div>
              <div className="md-stat-num">{dashboard?.maskCount ?? 0}</div>
              <div className="md-stat-label">마스킹 (MASK)</div>
            </div>
          </div>
          <div className="md-stat-card v-warn-bg">
            <div className="md-stat-icon">⚠️</div>
            <div>
              <div className="md-stat-num">{dashboard?.warnCount ?? 0}</div>
              <div className="md-stat-label">경고 (WARN)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 차트 영역 ===== */}
      <section className="md-charts">
        {/* 타임라인 차트 */}
        <div className="md-chart-card md-chart-trend">
          <div className="md-chart-header">
            <h3>📈 위험 점수 추이</h3>
            <span className="md-chart-sub">최근 {period}일 평균</span>
          </div>
          {trendData.length === 0 ? (
            <div className="md-empty">표시할 데이터가 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #eef2f7',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="위험점수"
                  stroke="#3b71e8"
                  strokeWidth={3}
                  dot={{ fill: '#3b71e8', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 도넛 차트 */}
        <div className="md-chart-card md-chart-pie">
          <div className="md-chart-header">
            <h3>🥧 카테고리별 탐지 분포</h3>
            <span className="md-chart-sub">전체 탐지 비율</span>
          </div>
          {pieData.length === 0 ? (
            <div className="md-empty">탐지된 항목이 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  label={(entry) => `${entry.percentage}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #eef2f7',
                    borderRadius: 12,
                  }}
                  formatter={(v, n) => [`${v}건`, n]}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 일별 검사 건수 막대 차트 */}
        <div className="md-chart-card md-chart-bar">
          <div className="md-chart-header">
            <h3>📊 일별 검사 횟수</h3>
            <span className="md-chart-sub">활동 빈도</span>
          </div>
          {trendData.length === 0 ? (
            <div className="md-empty">표시할 데이터가 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #eef2f7',
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="검사건수" fill="#000080" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ===== 최근 위험 알림 ===== */}
      <section className="md-alerts-section">
        <h3 className="md-section-title">🔔 최근 활동 하이라이트</h3>
        {(!dashboard?.recentAlerts || dashboard.recentAlerts.length === 0) ? (
          <div className="md-empty">최근 활동이 없습니다.</div>
        ) : (
          <div className="md-alerts-grid">
            {dashboard.recentAlerts.map((a) => {
              const m = VERDICT_META[a.verdict] || VERDICT_META.ALLOW;
              return (
                <div
                  key={a.logId}
                  className={`md-alert-card ${m.className}`}
                  onClick={() => fetchLogDetail(a.logId)}
                >
                  <div className="md-alert-head">
                    <span className="md-alert-badge">{m.label}</span>
                    <span className="md-alert-score">{a.riskScore}점</span>
                  </div>
                  <div className="md-alert-preview">
                    {a.preview || '(미리보기 없음)'}
                  </div>
                  <div className="md-alert-time">{formatDate(a.createdAt)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== 상세 로그 테이블 ===== */}
      <section className="md-logs-section">
        <div className="md-logs-header">
          <h3 className="md-section-title">📋 상세 로그</h3>
          <button className="md-btn-refresh" onClick={() => fetchLogs(page)}>
            🔄 새로고침
          </button>
        </div>
        {logs.length === 0 ? (
          <div className="md-empty">로그가 없습니다.</div>
        ) : (
          <>
            <div className="md-table-wrap">
              <table className="md-table">
                <thead>
                  <tr>
                    <th>일시</th>
                    <th>판정</th>
                    <th>위험도</th>
                    <th>탐지 건수</th>
                    <th>AI 대상</th>
                    <th>미리보기</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const m = VERDICT_META[log.verdict] || VERDICT_META.ALLOW;
                    return (
                      <tr key={log.id} onClick={() => fetchLogDetail(log.id)}>
                        <td>{formatDate(log.createdAt)}</td>
                        <td>
                          <span className={`md-verdict-tag ${m.className}`}>
                            {m.label}
                          </span>
                        </td>
                        <td>
                          <div className="md-score-bar">
                            <div
                              className="md-score-bar-fill"
                              style={{
                                width: `${log.riskScore}%`,
                                background: m.color,
                              }}
                            />
                            <span>{log.riskScore}</span>
                          </div>
                        </td>
                        <td className="td-center">{log.totalDetected}</td>
                        <td>{log.aiTarget || '-'}</td>
                        <td className="td-preview">{log.promptPreview || '-'}</td>
                        <td className="td-action">
                          <button
                            className="md-btn-delete"
                            onClick={(e) => handleDelete(log.id, e)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="md-pagination">
                <button
                  disabled={page === 0}
                  onClick={() => fetchLogs(page - 1)}
                >
                  ← 이전
                </button>
                <span>{page + 1} / {totalPages}</span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => fetchLogs(page + 1)}
                >
                  다음 →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===== 상세 모달 ===== */}
      {selectedLog && (
        <div className="md-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="md-modal" onClick={(e) => e.stopPropagation()}>
            <button className="md-modal-close" onClick={() => setSelectedLog(null)}>×</button>

            <div className="md-modal-head">
              <h2>로그 상세 정보</h2>
              <span className="md-modal-time">{formatDate(selectedLog.createdAt)}</span>
            </div>

            <div className="md-modal-summary">
              <div className="md-modal-stat">
                <span className="label">위험 점수</span>
                <span className="value" style={{ color: VERDICT_META[selectedLog.verdict]?.color }}>
                  {selectedLog.riskScore}
                </span>
              </div>
              <div className="md-modal-stat">
                <span className="label">판정</span>
                <span className={`md-verdict-tag ${VERDICT_META[selectedLog.verdict]?.className}`}>
                  {VERDICT_META[selectedLog.verdict]?.label}
                </span>
              </div>
              <div className="md-modal-stat">
                <span className="label">탐지 건수</span>
                <span className="value">{selectedLog.totalDetected}</span>
              </div>
              <div className="md-modal-stat">
                <span className="label">프롬프트 길이</span>
                <span className="value">{selectedLog.promptLength} 자</span>
              </div>
            </div>

            <div className="md-modal-section">
              <h4>📝 프롬프트 미리보기</h4>
              <div className="md-preview-box">
                {selectedLog.promptPreview || '(미리보기 없음)'}
                {selectedLog.promptLength > 100 && (
                  <span className="md-truncated"> ... (총 {selectedLog.promptLength}자)</span>
                )}
              </div>
            </div>

            <div className="md-modal-section">
              <h4>🔍 탐지된 항목</h4>
              {selectedLog.details?.length === 0 ? (
                <div className="md-empty">탐지된 항목이 없습니다.</div>
              ) : (
                <table className="md-detail-table">
                  <thead>
                    <tr>
                      <th>카테고리</th>
                      <th>탐지방식</th>
                      <th>건수</th>
                      <th>가산 점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLog.details?.map((d, i) => (
                      <tr key={i}>
                        <td>{d.categoryName}</td>
                        <td>
                          <span className={`md-type-tag ${d.detectionType === 'REGEX' ? 'type-regex' : 'type-ner'}`}>
                            {d.detectionType}
                          </span>
                        </td>
                        <td>{d.count}건</td>
                        <td>+{d.scoreAdded}점</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}