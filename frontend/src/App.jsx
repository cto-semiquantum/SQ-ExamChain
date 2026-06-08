import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing          from './pages/Landing';
import Login            from './pages/Login';
import AdminDashboard   from './pages/AdminDashboard';
import ExamsList        from './pages/ExamsList';
import UploadExam       from './pages/UploadExam';
import AssignExam       from './pages/AssignExam';
import AuditLogs        from './pages/AuditLogs';
import Investigate      from './pages/Investigate';
import CenterDashboard  from './pages/CenterDashboard';
import AdminLayout      from './components/AdminLayout';
import './index.css';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function ProtectedRoute({ children, adminOnly, centerOnly }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  
  const payload = parseJwt(token);
  if (!payload) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !payload.is_admin) {
    return <Navigate to="/center" replace />;
  }
  if (centerOnly && payload.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/* Placeholder pages for new nav items */
function PlaceholderPage({ title, desc }) {
  return (
    <AdminLayout>
      <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111118', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ fontSize: '0.875rem', color: '#A1A1AA' }}>{desc || 'Coming soon.'}</p>
      </div>
    </AdminLayout>
  );
}

import api              from './services/api';
import { CenterNav }    from './pages/CenterDashboard';

/* Placeholder pages for center nav items */
function CenterPlaceholderPage({ title, desc }) {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {});
  }, []);
  const logout = () => { localStorage.removeItem('token'); window.location.href = '/login'; };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FB', fontFamily: "'Inter', sans-serif" }}>
      <CenterNav user={user} onLogout={logout} />
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 60, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 1.75rem', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'white' }}>
            {user?.username?.[0]?.toUpperCase() || 'C'}
          </div>
        </header>
        <main style={{ flex: 1, padding: '1.75rem 2rem', textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111118', marginBottom: '0.5rem' }}>{title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#A1A1AA' }}>{desc || 'Coming soon.'}</p>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"      element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin"              element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/exams"        element={<ProtectedRoute adminOnly><ExamsList /></ProtectedRoute>} />
        <Route path="/admin/upload"       element={<ProtectedRoute adminOnly><UploadExam /></ProtectedRoute>} />
        <Route path="/admin/assign"       element={<ProtectedRoute adminOnly><AssignExam /></ProtectedRoute>} />
        <Route path="/admin/audit"        element={<ProtectedRoute adminOnly><AuditLogs /></ProtectedRoute>} />
        <Route path="/admin/investigate"  element={<ProtectedRoute adminOnly><Investigate /></ProtectedRoute>} />
        <Route path="/admin/centers"      element={<ProtectedRoute adminOnly><PlaceholderPage title="Centers" desc="Manage examination centers and their access." /></ProtectedRoute>} />
        <Route path="/admin/downloads"    element={<ProtectedRoute adminOnly><PlaceholderPage title="Downloads" desc="View all paper download events." /></ProtectedRoute>} />
        <Route path="/admin/blockchain"   element={<ProtectedRoute adminOnly><PlaceholderPage title="Blockchain" desc="View blockchain audit chain status." /></ProtectedRoute>} />

        {/* Center */}
        <Route path="/center"              element={<ProtectedRoute centerOnly><CenterDashboard /></ProtectedRoute>} />
        <Route path="/center/exams"        element={<ProtectedRoute centerOnly><CenterPlaceholderPage title="My Exams" desc="View your assigned exams and scheduled papers." /></ProtectedRoute>} />
        <Route path="/center/downloads"    element={<ProtectedRoute centerOnly><CenterPlaceholderPage title="Downloads" desc="View your secure examination paper download logs." /></ProtectedRoute>} />
        <Route path="/center/notifications"element={<ProtectedRoute centerOnly><CenterPlaceholderPage title="Notifications" desc="View notifications sent to your exam center." /></ProtectedRoute>} />
        <Route path="/center/profile"      element={<ProtectedRoute centerOnly><CenterPlaceholderPage title="Profile" desc="Manage your exam center account and details." /></ProtectedRoute>} />
        <Route path="/center/support"      element={<ProtectedRoute centerOnly><CenterPlaceholderPage title="Support" desc="Get support for exam papers or download issues." /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
