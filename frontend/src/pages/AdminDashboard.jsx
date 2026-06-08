import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, iconBg, iconColor, trend }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 12, padding: '1.25rem 1.375rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>{icon}</div>
        {trend && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, color: trend > 0 ? '#059669' : '#DC2626',
            background: trend > 0 ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
            padding: '0.15rem 0.5rem', borderRadius: 100,
          }}>{trend > 0 ? '+' : ''}{trend} this week</span>
        )}
      </div>
      <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value ?? <span style={{ width: 48, height: 20, background: '#E5E7EB', borderRadius: 4, display: 'inline-block' }} />}
      </div>
      <div style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '0.3rem', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#A1A1AA', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  );
}

/* ── Download chart mock data ───────────────────────────── */
const CHART_DATA = [
  { day: 'Mon', today: 3, week: 12, month: 40 },
  { day: 'Tue', today: 5, week: 18, month: 47 },
  { day: 'Wed', today: 2, week: 22, month: 44 },
  { day: 'Thu', today: 8, week: 28, month: 52 },
  { day: 'Fri', today: 6, week: 31, month: 58 },
  { day: 'Sat', today: 4, week: 35, month: 62 },
  { day: 'Sun', today: 7, week: 47, month: 47 },
];

const CHART_TABS = ['Today', 'This Week', 'This Month'];

/* ── Main ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate  = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [logs,    setLogs]    = useState([]);
  const [chain,   setChain]   = useState(null);
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, l, c] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/admin/audit-logs'),
          api.get('/admin/verify-blockchain'),
        ]);
        setStats(s.data);
        setLogs(l.data.slice(0, 6));
        setChain(c.data.is_valid);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const actionLabel = (a) => {
    const map = { UPLOAD_EXAM: 'Exam Uploaded', ASSIGN_EXAM: 'Exam Assigned', DOWNLOAD_EXAM: 'Exam Downloaded', BLOCKCHAIN_LOG: 'Audit Logged' };
    return map[a] || a;
  };

  const actionColor = (a) => {
    if (a === 'UPLOAD_EXAM')   return { bg: 'rgba(124,58,237,0.08)', color: '#7C3AED' };
    if (a === 'ASSIGN_EXAM')   return { bg: 'rgba(8,145,178,0.08)',  color: '#0891B2' };
    if (a === 'DOWNLOAD_EXAM') return { bg: 'rgba(5,150,105,0.08)',  color: '#059669' };
    return                           { bg: 'rgba(217,119,6,0.08)',  color: '#D97706' };
  };

  const chartKey = ['today', 'week', 'month'][tab];

  return (
    <AdminLayout>
      {/* ── Page Header ──────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', marginBottom: '0.2rem' }}>
            {greeting()}, Harsh 👋
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#A1A1AA', fontWeight: 400 }}>
            Here's what's happening with your exam system today.
          </p>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#A1A1AA', fontWeight: 500, paddingTop: '0.25rem' }}>
          {formatDate()}
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Exams"    value={stats?.total_exams}     icon="📋" iconBg="rgba(124,58,237,0.08)" trend={2} />
        <StatCard label="Active Centers" value={stats?.total_centers}   icon="🏫" iconBg="rgba(8,145,178,0.08)"  trend={4} />
        <StatCard label="Downloads"      value={stats?.total_downloads} icon="⬇" iconBg="rgba(5,150,105,0.08)"  trend={12} />
        <StatCard
          label="Blockchain Status"
          value={chain === null ? '—' : chain ? 'Verified' : 'BROKEN'}
          icon="⛓"
          iconBg={chain ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)'}
          sub={chain ? 'All records valid' : 'Integrity failed'}
        />
      </div>

      {/* ── Bottom: Activity + Chart ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1rem' }}>

        {/* Recent Activity */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.03em' }}>
              Recent Activity
            </h2>
            <button
              onClick={() => navigate('/admin/audit')}
              style={{ fontSize: '0.75rem', color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
            >View all →</button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <span style={{ width: 24, height: 24, border: '2px solid #E5E7EB', borderTopColor: '#7C3AED', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#A1A1AA', fontSize: '0.8125rem' }}>No activity yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {logs.map((log, i) => {
                const ac = actionColor(log.action);
                return (
                  <div key={log.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.625rem 0',
                    borderBottom: i < logs.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: ac.bg, color: ac.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {log.action === 'UPLOAD_EXAM' ? '↑' : log.action === 'ASSIGN_EXAM' ? '→' : log.action === 'DOWNLOAD_EXAM' ? '↓' : '⛓'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111118', letterSpacing: '-0.01em' }}>
                        {actionLabel(log.action)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#A1A1AA', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#C4C4CC', flexShrink: 0 }}>
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Downloads Chart */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.03em' }}>
              Downloads Overview
            </h2>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {CHART_TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} style={{
                  fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  padding: '0.25rem 0.6rem', borderRadius: 6, border: 'none',
                  background: tab === i ? '#7C3AED' : 'rgba(0,0,0,0.04)',
                  color: tab === i ? 'white' : '#71717A',
                  transition: 'all 0.15s',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={CHART_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A1A1AA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A1A1AA' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, fontSize: '0.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                itemStyle={{ color: '#7C3AED' }}
              />
              <Line type="monotone" dataKey={chartKey} stroke="#7C3AED" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#7C3AED' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}
