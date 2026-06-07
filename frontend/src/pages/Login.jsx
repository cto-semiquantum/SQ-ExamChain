import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('username', username);
      form.append('password', password);

      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.access_token);

      const me = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });
      navigate(me.data.is_admin ? '/admin' : '/center');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🔗</div>
          <div className="login-logo-text">
            <h1>SQ ExamChain</h1>
            <span>Secure Examination System</span>
          </div>
        </div>

        <h2>Welcome back</h2>
        <p>Sign in to your portal to continue</p>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">✕</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              className="form-control"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-control"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg btn-full mt-2"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : '🔐 Sign In'}
          </button>
        </form>

        <div className="divider" />
        <p className="text-muted text-sm" style={{ textAlign: 'center' }}>
          Admin: <strong style={{ color: 'var(--text-1)' }}>admin / admin123</strong>
          &nbsp;·&nbsp;
          Center: <strong style={{ color: 'var(--text-1)' }}>center1 / center123</strong>
        </p>
      </div>
    </div>
  );
}
