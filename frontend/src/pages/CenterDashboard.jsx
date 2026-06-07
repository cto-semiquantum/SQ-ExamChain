import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/* ── Per-card countdown ──────────────────────────────── */
function useLiveCountdown(isoStr) {
  const [display, setDisplay] = useState('');
  const [locked,  setLocked]  = useState(false);

  useEffect(() => {
    if (!isoStr) { setLocked(false); return; }
    const tick = () => {
      const diff = Math.max(0, new Date(isoStr + 'Z') - Date.now());
      if (diff === 0) { setLocked(false); setDisplay(''); return; }
      setLocked(true);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setDisplay(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoStr]);

  return { display, locked };
}

/* ── Exam Card ───────────────────────────────────────── */
function ExamCard({ exam, onDownload, downloading }) {
  const { display, locked } = useLiveCountdown(exam.unlock_time);

  return (
    <div className="exam-card" style={{ borderColor: locked ? 'rgba(245,158,11,0.4)' : undefined }}>
      <div className="exam-card-icon" style={{ background: locked ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)' }}>
        {locked ? '🔒' : '📄'}
      </div>
      <div>
        <h3>{exam.title}</h3>
        <div className="exam-card-meta" style={{ marginTop: 4 }}>
          {exam.exam_date && <span>📅 {exam.exam_date} &nbsp;</span>}
          {exam.exam_time && <span>⏰ {exam.exam_time}</span>}
        </div>
        <div className="exam-card-meta">
          Assigned: {new Date(exam.assigned_at).toLocaleDateString()}
        </div>
      </div>

      {/* Lock status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        {locked
          ? <span className="badge badge-yellow">🔒 Locked</span>
          : <span className="badge badge-green">✓ Unlocked</span>}
        {locked && display && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--yellow)', fontWeight: 700 }}>
            {display}
          </span>
        )}
      </div>

      <div className="exam-card-footer">
        <button
          id={`download-exam-${exam.exam_id}`}
          className={`btn btn-sm ${locked ? 'btn-outline' : 'btn-primary'}`}
          style={{ width: '100%' }}
          onClick={() => !locked && onDownload(exam.exam_id, exam.title)}
          disabled={locked || downloading === exam.exam_id}
          title={locked ? `Unlocks in ${display}` : 'Download securely'}
        >
          {downloading === exam.exam_id
            ? <><span className="spinner" /> &nbsp;Preparing…</>
            : locked ? '🔒 Paper Locked' : '⬇ Secure Download'}
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */
export default function CenterDashboard() {
  const navigate = useNavigate();
  const [exams,       setExams]       = useState([]);
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [me, ex] = await Promise.all([api.get('/auth/me'), api.get('/center/my-exams')]);
        setUser(me.data);
        setExams(ex.data);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleDownload = async (examId, title) => {
    setDownloading(examId);
    try {
      const res = await api.get(`/center/download/${examId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_fingerprinted.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'object' && detail?.error === 'PAPER_LOCKED') {
        alert(`⏳ Paper is still locked!\n\nUnlocks at: ${new Date(detail.unlock_time + 'Z').toLocaleString()}\nTime remaining: ${detail.time_remaining}`);
      } else {
        alert('Download failed. Please try again.');
      }
    } finally {
      setDownloading(null);
    }
  };

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  const lockedCount   = exams.filter(e => e.is_locked).length;
  const unlockedCount = exams.filter(e => !e.is_locked).length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🏫</div>
          <div>
            <div className="brand-text">ExamChain</div>
            <div className="brand-sub">Center Portal</div>
          </div>
        </div>

        {user && (
          <div style={{ padding: '0 0.75rem 1rem' }}>
            <div style={{
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Logged in as</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.center_name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>@{user.username}</div>
            </div>
          </div>
        )}

        <div className="sidebar-section-label">Status</div>
        <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0.6rem', borderRadius: 6, background: 'rgba(16,185,129,0.08)' }}>
            <span>✓ Unlocked</span><span className="badge badge-green">{unlockedCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0.6rem', borderRadius: 6, background: 'rgba(245,158,11,0.08)' }}>
            <span>🔒 Locked</span><span className="badge badge-yellow">{lockedCount}</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <button id="center-logout" className="btn btn-danger btn-full btn-sm" onClick={logout}>⏻ &nbsp;Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <h1>Assigned Exam Papers</h1>
            <p>Securely download your assigned papers — fingerprinted on every download</p>
          </div>
          <span className="badge badge-green" style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}>🔒 Secure Connection</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : exams.length === 0 ? (
          <div className="content-card">
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No exams assigned yet</h3>
              <p>Contact the admin to assign examination papers to your center.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              <span className="alert-icon">🔏</span>
              <span>Each download is <strong>uniquely fingerprinted</strong>. Time-locked papers show a countdown and cannot be downloaded until unlocked by the admin-set schedule.</span>
            </div>
            <div className="exam-cards">
              {exams.map(exam => (
                <ExamCard
                  key={exam.exam_id}
                  exam={exam}
                  onDownload={handleDownload}
                  downloading={downloading}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
