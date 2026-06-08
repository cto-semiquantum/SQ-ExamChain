import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/* ── SVG Icons ──────────────────────────────────────────── */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard:   'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  exams:       'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  centers:     'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  assign:      'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  downloads:   'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  audit:       'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 5a2 2 0 000 4h6a2 2 0 000-4',
  investigate: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  blockchain:  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  settings:    'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z',
  upload:      'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
};

const ADMIN_NAV = [
  { label: 'Dashboard',    icon: 'dashboard',   to: '/admin',              exact: true },
  { label: 'Exams',        icon: 'exams',       to: '/admin/exams' },
  { label: 'Centers',      icon: 'centers',     to: '/admin/centers' },
  { label: 'Assignments',  icon: 'assign',      to: '/admin/assign' },
  { label: 'Downloads',    icon: 'downloads',   to: '/admin/downloads' },
  { label: 'Audit Logs',   icon: 'audit',       to: '/admin/audit' },
  { label: 'Investigation',icon: 'investigate', to: '/admin/investigate' },
  { label: 'Blockchain',   icon: 'blockchain',  to: '/admin/blockchain' },
];

/* ── Layout ────────────────────────────────────────────── */
export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const user = { name: 'Harsh Patel', role: 'Administrator', initials: 'HP' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FB', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        overflow: 'hidden',
        zIndex: 100,
        transition: 'width 0.2s ease',
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '0.625rem',
          padding: '1rem 1rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          height: 60,
        }}>
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.25rem', color: '#A1A1AA', flexShrink: 0,
            display: 'flex', alignItems: 'center',
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
              <div style={{
                width: 26, height: 26, background: '#7C3AED',
                borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', flexShrink: 0,
              }}>⛓</div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>SQ ExamChain</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
          {ADMIN_NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => isActive ? 'nav-item nav-item-active' : 'nav-item'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: collapsed ? '0.6rem 0' : '0.55rem 0.75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 7,
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: isActive ? '#7C3AED' : '#71717A',
                background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                marginBottom: 2,
                transition: 'all 0.15s',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ flexShrink: 0, color: isActive ? '#7C3AED' : '#A1A1AA', display: 'flex' }}>
                    <Icon d={ICONS[item.icon]} size={15} />
                  </span>
                  {!collapsed && item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: collapsed ? '0.5rem 0' : '0.5rem 0.75rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 7,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user.initials}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#111118', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#A1A1AA', whiteSpace: 'nowrap' }}>{user.role}</div>
              </div>
            )}
          </div>
          <button
            id="admin-logout"
            onClick={logout}
            title={collapsed ? 'Sign out' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '0.5rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%', padding: collapsed ? '0.5rem 0' : '0.5rem 0.75rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.78rem', color: '#A1A1AA', borderRadius: 6,
              fontFamily: 'inherit', marginTop: 2,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: collapsed ? 64 : 220, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>

        {/* Topbar */}
        <header style={{
          height: 60,
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 1.75rem',
          gap: '0.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          {/* Notification bell */}
          <button style={iconBtn}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth={2} strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
          {/* Moon */}
          <button style={iconBtn}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth={2} strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </button>
          {/* Upload quick action */}
          <button
            onClick={() => navigate('/admin/upload')}
            style={{
              background: '#7C3AED', color: 'white', border: 'none',
              borderRadius: 7, padding: '0.45rem 1rem',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}
          >
            <Icon d={ICONS.upload} size={13} />
            Upload Exam
          </button>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700, color: 'white', cursor: 'pointer', marginLeft: '0.25rem',
          }}>HP</div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '1.75rem 2rem', minHeight: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

const iconBtn = {
  background: 'none', border: '1px solid rgba(0,0,0,0.07)',
  borderRadius: 7, width: 34, height: 34,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#71717A', transition: 'background 0.15s',
};
