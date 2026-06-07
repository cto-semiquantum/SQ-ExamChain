import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: '◈',  to: '/admin',           exact: true },
  { label: 'Upload Exam', icon: '↑',  to: '/admin/upload' },
  { label: 'Assign Exam', icon: '⇌',  to: '/admin/assign' },
  { label: 'Audit Logs',  icon: '≡',  to: '/admin/audit' },
  { label: 'Investigate', icon: '🔍', to: '/admin/investigate' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🔗</div>
          <div>
            <div className="brand-text">SQ ExamChain</div>
            <div className="brand-sub">Admin Portal</div>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>
        <ul className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button id="admin-logout" className="btn btn-danger btn-full btn-sm" onClick={logout}>
            ⏻ &nbsp;Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
