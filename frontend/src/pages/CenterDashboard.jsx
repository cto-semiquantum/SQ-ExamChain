import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';

/* ── Sidebar ─────────────────────────────────────────────── */
export function CenterNav({ user, onLogout }) {
  const links = [
    { to: '/center',         label: 'Dashboard',     icon: '⊞', exact: true },
    { to: '/center/exams',   label: 'My Exams',      icon: '📋' },
    { to: '/center/downloads',label: 'Downloads',    icon: '⬇' },
    { to: '/center/notifications',label: 'Notifications', icon: '🔔' },
    { to: '/center/profile', label: 'Profile',       icon: '👤' },
    { to: '/center/support', label: 'Support',       icon: '💬' },
  ];
  return (
    <aside style={{
      width: 220, flexShrink: 0, background: '#fff',
      borderRight: '1px solid rgba(0,0,0,0.07)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, overflow: 'hidden',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', height: 60 }}>
        <div style={{ width: 26, height: 26, background: '#7C3AED', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>⛓</div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>SQ ExamChain</div>
        </div>
      </div>

      {/* Center pill */}
      {user && (
        <div style={{ padding: '0.75rem 0.75rem 0' }}>
          <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', boxShadow: '0 0 0 2px rgba(5,150,105,0.2)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#A1A1AA', fontWeight: 500 }}>Test Center A</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111118' }}>{user.center_name || user.username}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.625rem 0.5rem', overflowY: 'auto', marginTop: '0.25rem' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.55rem 0.75rem', borderRadius: 7, textDecoration: 'none',
              fontSize: '0.8125rem', fontWeight: 500, marginBottom: 2,
              color: isActive ? '#7C3AED' : '#71717A',
              background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
              transition: 'all 0.15s', letterSpacing: '-0.01em',
            })}
          >
            <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
          padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.8125rem', color: '#A1A1AA', borderRadius: 6, fontFamily: 'inherit',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
          onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
        >
          <span>⏻</span> Logout
        </button>
      </div>
    </aside>
  );
}

/* ── Countdown ───────────────────────────────────────────── */
function useCountdown(isoStr) {
  const [parts, setParts] = useState({ h: 0, m: 0, s: 0, ms: 0, locked: false });
  useEffect(() => {
    if (!isoStr) return;
    const tick = () => {
      const diff = Math.max(0, new Date(isoStr + 'Z') - Date.now());
      if (diff === 0) { setParts(p => ({ ...p, locked: false })); return; }
      setParts({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
        ms: Math.floor((diff % 1_000) / 10),
        locked: true,
      });
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [isoStr]);
  return parts;
}

/* ── Countdown display ──────────────────────────────────── */
function CountdownBox({ value, label }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 56 }}>
      <div style={{
        fontSize: '2rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em',
        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        background: '#F4F5F8', borderRadius: 10, padding: '0.625rem 0.875rem',
        border: '1px solid rgba(0,0,0,0.07)',
      }}>{String(value).padStart(2, '0')}</div>
      <div style={{ fontSize: '0.65rem', color: '#A1A1AA', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────── */
export default function CenterDashboard() {
  const navigate    = useNavigate();
  const [user, setUser]     = useState(null);
  const [exams, setExams]   = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [me, ex] = await Promise.all([api.get('/auth/me'), api.get('/center/my-exams')]);
        setUser(me.data);
        setExams(ex.data);
        if (ex.data.length > 0) setSelected(ex.data[0]);
      } catch { navigate('/login'); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  const handleDownload = async (examId, title) => {
    setDownloading(examId);
    try {
      const res = await api.get(`/center/download/${examId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/\s+/g, '_')}_fingerprinted.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (err) {
      const d = err.response?.data?.detail;
      if (typeof d === 'object' && d?.error === 'PAPER_LOCKED') {
        alert(`⏳ Locked!\nUnlocks at: ${new Date(d.unlock_time + 'Z').toLocaleString()}`);
      } else { alert('Download failed.'); }
    } finally { setDownloading(null); }
  };

  const upcoming = exams.filter(e => e.is_locked)[0] || exams[0];
  const { h, m, s, ms, locked } = useCountdown(upcoming?.unlock_time);

  const notifications = [
    { text: `${upcoming?.title || 'Exam'} will be available for download on ${upcoming?.exam_date || '—'}`, time: '07 Jun 2024' },
    { text: 'Please ensure stable internet before downloading the paper.', time: '06 Jun 2024' },
    { text: 'Do not share or print the question paper before the exam time.', time: '05 Jun 2024' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FB', fontFamily: "'Inter', sans-serif" }}>
      <CenterNav user={user} onLogout={logout} />

      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ height: 60, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 1.75rem', gap: '0.5rem' }}>
          {['🔔', '🌙', '💬'].map((ic, i) => (
            <button key={i} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 7, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>{ic}</button>
          ))}
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'white', marginLeft: '0.25rem' }}>
            {user?.username?.[0]?.toUpperCase() || 'C'}
          </div>
        </header>

        <main style={{ flex: 1, padding: '1.75rem 2rem' }}>
          {/* Page title */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', marginBottom: '0.2rem' }}>Center Dashboard</h1>
              <p style={{ fontSize: '0.8125rem', color: '#A1A1AA' }}>Manage and download your assigned examination papers</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'start' }}>
            {/* Upcoming exam */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.02em' }}>Upcoming Exam</h2>
                {upcoming && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#D97706', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', padding: '0.2rem 0.6rem', borderRadius: 100 }}>Upcoming</span>}
              </div>
              {loading ? <div style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>Loading…</div> : upcoming ? (
                <>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>{upcoming.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#A1A1AA', marginBottom: '1.25rem' }}>
                    📅 {upcoming.exam_date || '—'} {upcoming.exam_time && `· ⏰ ${upcoming.exam_time}`}
                  </div>
                  {locked ? (
                    <>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Time Remaining</div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <CountdownBox value={h}  label="Hours" />
                        <CountdownBox value={m}  label="Minutes" />
                        <CountdownBox value={s}  label="Seconds" />
                        <CountdownBox value={ms} label="ms" />
                      </div>
                      <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.78rem', color: '#D97706', marginBottom: '1rem' }}>
                        🔒 This exam will be available for download at the scheduled time.
                      </div>
                    </>
                  ) : (
                    <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.78rem', color: '#059669', marginBottom: '1rem' }}>
                      ✓ This exam is unlocked and ready to download.
                    </div>
                  )}
                  <button
                    onClick={() => !locked && handleDownload(upcoming.exam_id, upcoming.title)}
                    disabled={locked || downloading === upcoming.exam_id}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 9, border: 'none',
                      background: locked ? '#E5E7EB' : '#7C3AED',
                      color: locked ? '#A1A1AA' : 'white',
                      fontSize: '0.875rem', fontWeight: 700, cursor: locked ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {downloading === upcoming.exam_id ? 'Downloading…' : locked ? '🔒 Locked' : '⬇ Secure Download'}
                  </button>
                </>
              ) : <div style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>No exams assigned yet.</div>}
            </div>

            {/* Center info + notifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Center info */}
              {user && (
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>Center Info</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    {[
                      { label: 'Center Name', val: user.center_name || user.username },
                      { label: 'Center Code', val: `FC-A-${user.id || '2024'}` },
                      { label: 'Location', val: 'Ahmedabad, Gujarat' },
                      { label: 'Contact', val: '+91 98765 43216' },
                      { label: 'Dr. Mehta', val: '' },
                    ].map(f => f.val !== undefined && (
                      <div key={f.label}>
                        <div style={{ fontSize: '0.68rem', color: '#A1A1AA', marginBottom: 2 }}>{f.label}</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111118' }}>{f.val || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>Notifications</h2>
                {notifications.map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.625rem', padding: '0.5rem 0', borderBottom: i < notifications.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7C3AED', marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.78rem', color: '#52525B', lineHeight: 1.5 }}>{n.text}</div>
                      <div style={{ fontSize: '0.68rem', color: '#A1A1AA', marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
