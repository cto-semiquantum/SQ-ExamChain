import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login            from './pages/Login';
import AdminDashboard   from './pages/AdminDashboard';
import UploadExam       from './pages/UploadExam';
import AssignExam       from './pages/AssignExam';
import AuditLogs        from './pages/AuditLogs';
import Investigate      from './pages/Investigate';
import CenterDashboard  from './pages/CenterDashboard';
import './index.css';
import './App.css';

function ProtectedRoute({ children, adminOnly }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"       element={<Navigate to="/login" replace />} />
        <Route path="/login"  element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin"             element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/upload"      element={<ProtectedRoute><UploadExam /></ProtectedRoute>} />
        <Route path="/admin/assign"      element={<ProtectedRoute><AssignExam /></ProtectedRoute>} />
        <Route path="/admin/audit"       element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
        <Route path="/admin/investigate" element={<ProtectedRoute><Investigate /></ProtectedRoute>} />

        {/* Center Route */}
        <Route path="/center" element={<ProtectedRoute><CenterDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
