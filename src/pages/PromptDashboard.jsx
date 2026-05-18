import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { apiFetch } from '../components/util/api';
import './PromptDashboard.css';

// 5종 verdict 메타정보 (DB enum과 동일)
const VERDICT_META = {
  ALLOW:  { label: '허용',    className: 'v-allow',  color: '#0f5132', icon: '✅' },
  MASK:   { label: '마스킹',  className: 'v-mask',   color: '#856404', icon: '🔒' },
  WARN:   { label: '경고',    className: 'v-warn',   color: '#842029', icon: '⚠️' },
  BLOCK:  { label: '차단',    className: 'v-block',  color: '#6c1414', icon: '🚫' },
  REVIEW: { label: '검토',    className: 'v-review', color: '#0c63e4', icon: '👁️' },
};

const PIE_COLORS = [
  '#3b71e8', '#000080', '#ff8c42', '#52c41a', '#722ed1',
  '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#1890ff'
];

function getVerdictMeta(verdict) {
  if (!verdict) return { label: '-', className: 'v-allow', color: '#888', icon: '•' };
  const upper = verdict.toUpperCase();
  return VERDICT_META[upper] || { label: verdict, className: 'v-allow', color: '#888', icon: '•' };
}

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

export default function PromptDashboard() {
  const [period, setPeriod] = useState(30);
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      // ⭐ apiFetch 사용 (토큰 자동 첨부)
      const res = await apiFetch(`/api/prompt/dashboard?days=${period}`);
      if (!res.ok) throw new Error('대시보드 데이터를 불러오지 못했습니다.');
      setDashboard(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (pageNum = 0) => {
    try {
      // ⭐ apiFetch 사용
      const res = await apiFetch(`/api/prompt/logs?page=${pageNum}&size=10`);
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
      // ⭐ apiFetch 사용
      const res = await apiFetch(`/api/prompt/log/${id}`);
      if (!res.ok) throw new Error('상세 정보를 불러오지 못했습니다.');
      setSelectedLog(await res.json());
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchLogs(0);
  }, [period]);

  const trendData = useMemo(() => {
    if (!dashboard?.riskTrend) return [];
    return dashboard.riskTrend.map((p) => ({
      date: typeof p.date === 'string' ? p.date.slice(5) : '',
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
    }));
  }, [dashboard]);

  const score = dashboard?.securityScore ?? 100;
  const g = gradeOf(score);

  // 5종 verdict 통계 카드
  const verdictCards = [
    { key: 'ALLOW',  count: dashboard?.allowCount  ?? 0 },
    { key: 'MASK',   count: dashboard?.maskCount   ?? 0 },
    { key: 'WARN',   count: dashboard?.warnCount   ?? 0 },
    { key: 'BLOCK',  count: dashboard?.blockCount  ?? 0 },
    { key: 'REVIEW', count: dashboard?.reviewCount ?? 0 },
  ];

  return (
    <div className="pd-dashboard">
      {/* 헤더 */}
      <div className="pd-header">
        <div>
          <h1 className="pd-title">Security Dashboard</h1>
          <p className="pd-subtitle">
            PreSend Guard 마스킹 엔진 실시간 모니터링
          </p>
        </div>
        <div className="pd-period-switch">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`pd-period-btn ${period === d ? 'active' : ''}`}
              onClick={() => setPeriod(d)}
            >
              최근 {d}일
            </button>
          ))}
        </div>
      </div>

      {error && <div className="pd-error">⚠️ {error}</div>}
      {loading && !dashboard && <div className="pd-loading">불러오는 중...</div>}

      {/* ===== 메인 보안 점수 ===== */}
      <section className="pd-score-section">
        <div className="pd-score-main">
          <div className="pd-score-label">보안 점수</div>
          <div className="pd-score-value" style={{ color: g.color }}>
            {score}
            <span className="pd-score-unit">/ 100</span>
          </div>
          <div className="pd-grade-badge" style={{ background: g.color }}>
            {g.grade} · {g.label}
          </div>
          <div className="pd-gauge-track">
            <div
              className="pd-gauge-fill"
              style={{ width: `${score}%`, background: g.color }}
            />
          </div>
          <div className="pd-total-checked">
            전체 검사 <strong>{dashboard?.totalChecked ?? 0}</strong>건
          </div>
        </div>

        {/* 5종 verdict 카드 */}
        <div className="pd-stats-row">
          {verdictCards.map((v) => {
            const m = VERDICT_META[v.key];
            return (
              <div key={v.key} className={`pd-stat-card ${m.className}-bg`}>
                <div className="pd-stat-icon">{m.icon}</div>
                <div>
                  <div className="pd-stat-num">{v.count}</div>
                  <div className="pd-stat-label">{m.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 차트 영역 ===== */}
      <section className="pd-charts">
        <div className="pd-chart-card pd-chart-trend">
          <div className="pd-chart-header">
            <h3>📈 위험 점수 추이</h3>
            <span className="pd-chart-sub">최근 {period}일 일별 평균</span>
          </div>
          {trendData.length === 0 ? (
            <div className="pd-empty">표시할 데이터가 없습니다.</div>
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

        <div className="pd-chart-card pd-chart-pie">
          <div className="pd-chart-header">
            <h3>🥧 카테고리별 탐지</h3>
            <span className="pd-chart-sub">전체 탐지 분포</span>
          </div>
          {pieData.length === 0 ? (
            <div className="pd-empty">탐지된 항목이 없습니다.</div>
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
                <Tooltip formatter={(v, n) => [`${v}건`, n]} />
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

        <div className="pd-chart-card pd-chart-bar">
          <div className="pd-chart-header">
            <h3>📊 일별 검사 횟수</h3>
            <span className="pd-chart-sub">활동 빈도</span>
          </div>
          {trendData.length === 0 ? (
            <div className="pd-empty">표시할 데이터가 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip />
                <Bar dataKey="검사건수" fill="#000080" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ===== 최근 알림 ===== */}
      <section className="pd-alerts-section">
        <h3 className="pd-section-title">🔔 최근 활동 하이라이트</h3>
        {(!dashboard?.recentAlerts || dashboard.recentAlerts.length === 0) ? (
          <div className="pd-empty">최근 활동이 없습니다.</div>
        ) : (
          <div className="pd-alerts-grid">
            {dashboard.recentAlerts.map((a) => {
              const m = getVerdictMeta(a.verdict);
              return (
                <div
                  key={a.id}
                  className={`pd-alert-card ${m.className}`}
                  onClick={() => fetchLogDetail(a.id)}
                >
                  <div className="pd-alert-head">
                    <span className="pd-alert-badge">{m.icon} {m.label}</span>
                    <span className="pd-alert-score">{a.riskScore}점</span>
                  </div>
                  <div className="pd-alert-preview">
                    {a.preview || '(미리보기 없음)'}
                  </div>
                  {a.reasons && (
                    <div className="pd-alert-reasons">{a.reasons}</div>
                  )}
                  <div className="pd-alert-time">{formatDate(a.createdAt)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== 상세 로그 테이블 ===== */}
      <section className="pd-logs-section">
        <div className="pd-logs-header">
          <h3 className="pd-section-title">📋 상세 로그</h3>
          <button className="pd-btn-refresh" onClick={() => { fetchLogs(page); fetchDashboard(); }}>
            🔄 새로고침
          </button>
        </div>
        {logs.length === 0 ? (
          <div className="pd-empty">로그가 없습니다.</div>
        ) : (
          <>
            <div className="pd-table-wrap">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th>일시</th>
                    <th>판정</th>
                    <th>위험도</th>
                    <th>탐지 항목</th>
                    <th>프롬프트</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const m = getVerdictMeta(log.verdict);
                    const parsed = log.reasonsParsed || {};
                    const detected = Object.entries(parsed)
                      .filter(([_, v]) => v > 0)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(', ');
                    return (
                      <tr key={log.id} onClick={() => fetchLogDetail(log.id)}>
                        <td>{formatDate(log.createdAt)}</td>
                        <td>
                          <span className={`pd-verdict-tag ${m.className}`}>
                            {m.label}
                          </span>
                        </td>
                        <td>
                          <div className="pd-score-bar">
                            <div
                              className="pd-score-bar-fill"
                              style={{
                                width: `${log.riskScore ?? 0}%`,
                                background: m.color,
                              }}
                            />
                            <span>{log.riskScore ?? 0}</span>
                          </div>
                        </td>
                        <td className="pd-detected">{detected || '-'}</td>
                        <td className="pd-prompt-cell">{log.prompt || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pd-pagination">
                <button disabled={page === 0} onClick={() => fetchLogs(page - 1)}>
                  ← 이전
                </button>
                <span>{page + 1} / {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => fetchLogs(page + 1)}>
                  다음 →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===== 상세 모달 ===== */}
      {selectedLog && (
        <div className="pd-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pd-modal-close" onClick={() => setSelectedLog(null)}>×</button>

            <div className="pd-modal-head">
              <h2>로그 상세 정보</h2>
              <span className="pd-modal-time">{formatDate(selectedLog.createdAt)}</span>
            </div>

            <div className="pd-modal-summary">
              <div className="pd-modal-stat">
                <span className="label">위험 점수</span>
                <span className="value" style={{ color: getVerdictMeta(selectedLog.verdict).color }}>
                  {selectedLog.riskScore ?? 0}
                </span>
              </div>
              <div className="pd-modal-stat">
                <span className="label">판정</span>
                <span className={`pd-verdict-tag ${getVerdictMeta(selectedLog.verdict).className}`}>
                  {getVerdictMeta(selectedLog.verdict).icon} {getVerdictMeta(selectedLog.verdict).label}
                </span>
              </div>
              <div className="pd-modal-stat">
                <span className="label">탐지 건수</span>
                <span className="value">
                  {Object.values(selectedLog.reasonsParsed || {}).reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <div className="pd-modal-stat">
                <span className="label">ID</span>
                <span className="value">#{selectedLog.id}</span>
              </div>
            </div>

            <div className="pd-modal-section">
              <h4>📝 프롬프트</h4>
              <div className="pd-preview-box">
                {selectedLog.prompt || '(내용 없음)'}
              </div>
            </div>

            <div className="pd-modal-section">
              <h4>🔍 탐지된 항목</h4>
              {Object.keys(selectedLog.reasonsParsed || {}).length === 0 ? (
                <div className="pd-empty">탐지된 항목이 없습니다.</div>
              ) : (
                <table className="pd-detail-table">
                  <thead>
                    <tr>
                      <th>카테고리</th>
                      <th>탐지 건수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedLog.reasonsParsed || {}).map(([key, count]) => (
                      <tr key={key} className={count > 0 ? '' : 'pd-zero'}>
                        <td>{key}</td>
                        <td>
                          <span className={count > 0 ? 'pd-count-pos' : 'pd-count-zero'}>
                            {count}건
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedLog.reasons && (
              <div className="pd-modal-section">
                <h4>📄 원본 reasons 문자열</h4>
                <div className="pd-reasons-raw">{selectedLog.reasons}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}