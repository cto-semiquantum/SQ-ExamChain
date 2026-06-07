import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

/* ── Countdown hook ─────────────────────────────────────── */
function useCountdown(unlockIso) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!unlockIso) return;
    const tick = () => {
      const diff = Math.max(0, new Date(unlockIso + 'Z') - Date.now());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setRemaining(diff === 0 ? null : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlockIso]);

  return remaining;
}

/* ── Upcoming Unlock Card ─────────────────────────────── */
function UpcomingCard({ exam }) {
  const cd = useCountdown(exam.unlock_time);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 1rem',
      background: 'rgba(99,102,241,0.07)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid rgba(99,102,241,0.2)',
      marginBottom: '0.5rem',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exam.title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
          📅 {exam.exam_date || '—'} &nbsp;⏰ {exam.exam_time || '—'}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {cd
          ? <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'var(--yellow)', fontWeight: 700 }}>{cd}</div>
          : <span className="badge badge-green">Unlocked</span>}
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2 }}>
          {cd ? 'remaining' : 'available now'}
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState({ total_exams: 0, total_centers: 0, total_downloads: 0, total_events: 0, upcoming_unlocks: [] });
  const [chain,   setChain]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/admin/verify-blockchain'),
        ]);
        setStats(s.data);
        setChain(c.data.is_valid);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const upcoming = stats.upcoming_unlocks || [];

  const CARDS = [
    { label: 'Total Exams',       value: stats.total_exams,    icon: '📄', color: 'blue'   },
    { label: 'Exam Centers',      value: stats.total_centers,  icon: '🏫', color: 'purple' },
    { label: 'Total Downloads',   value: stats.total_downloads,icon: '⬇', color: 'cyan'   },
    { label: 'Audit Events',      value: stats.total_events,   icon: '🔒', color: 'green'  },
    { label: 'Upcoming Unlocks',  value: upcoming.length,      icon: '⏳', color: 'yellow' },
  ];

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Dashboard</h1>
          <p>Real-time overview of SQ ExamChain</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/admin/audit')}>Audit Logs</button>
          <button className="btn btn-primary"  onClick={() => navigate('/admin/upload')}>+ Upload Exam</button>
        </div>
      </div>

      {/* Blockchain Status */}
      <div className={`blockchain-panel ${chain === false ? 'invalid' : ''}`} id="blockchain-status-banner">
        <div className="blockchain-icon">{chain ? '⛓️' : '⚠️'}</div>
        <div className="blockchain-info">
          <h3 style={{ color: chain ? 'var(--green)' : 'var(--red)' }}>
            {chain ? '✓ Blockchain Integrity Valid' : '✗ Blockchain Integrity Compromised'}
          </h3>
          <p>{chain
            ? 'All audit log entries are hash-chained and verified. No tampering detected.'
            : 'Hash chain mismatch detected. Audit logs may have been tampered with.'}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div className="chain-status">
            <div className={`chain-dot ${chain ? 'valid' : 'invalid'}`} />
            <span style={{ color: chain ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {chain === null ? 'Checking…' : chain ? 'VALID' : 'INVALID'}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {CARDS.map(card => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Quick Actions */}
        <div className="content-card">
          <div className="content-card-header"><h2>⚡ Quick Actions</h2></div>
          <div className="content-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {[
                { label: 'Upload Exam Paper', icon: '📤', path: '/admin/upload',      color: 'var(--primary)' },
                { label: 'Assign to Center',  icon: '🎯', path: '/admin/assign',      color: 'var(--accent)'  },
                { label: 'View Audit Logs',   icon: '📋', path: '/admin/audit',       color: 'var(--cyan)'    },
                { label: 'Investigate Leak',  icon: '🔍', path: '/admin/investigate', color: 'var(--red)'     },
              ].map(a => (
                <button key={a.label} className="btn btn-outline"
                  style={{ padding: '1.1rem', flexDirection: 'column', gap: '0.4rem', height: 'auto', borderRadius: 'var(--radius-md)' }}
                  onClick={() => navigate(a.path)}>
                  <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                  <span style={{ fontSize: '0.78rem', color: a.color }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Unlocks */}
        <div className="content-card" id="upcoming-unlocks-panel">
          <div className="content-card-header">
            <h2>⏳ Upcoming Unlocks</h2>
            <span className="badge badge-yellow">{upcoming.length} pending</span>
          </div>
          <div className="content-card-body">
            {upcoming.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-state-icon">✅</div>
                <h3>No pending locks</h3>
                <p>All papers are either unlocked or have no time-lock set.</p>
              </div>
            ) : (
              upcoming.map(exam => <UpcomingCard key={exam.id} exam={exam} />)
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
