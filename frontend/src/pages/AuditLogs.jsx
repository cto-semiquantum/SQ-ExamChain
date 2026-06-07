import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

function actionBadge(action) {
  const map = {
    LOGIN:           'badge-blue',
    REGISTER:        'badge-cyan',
    UPLOAD_EXAM:     'badge-yellow',
    ASSIGN_EXAM:     'badge-blue',
    DOWNLOAD_EXAM:   'badge-green',
    INVESTIGATE_LEAK:'badge-red',
  };
  return map[action] || 'badge-blue';
}

export default function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs]       = useState([]);
  const [chain, setChain]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [l, c] = await Promise.all([
          api.get('/admin/audit-logs'),
          api.get('/admin/verify-blockchain'),
        ]);
        setLogs(l.data);
        setChain(c.data.is_valid);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const filtered = filter
    ? logs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) || l.details.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <AdminLayout>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Audit Logs</h1>
          <p>Immutable, hash-chained blockchain audit trail</p>
        </div>
        <div className="chain-status">
          <div className={`chain-dot ${chain ? 'valid' : 'invalid'}`} />
          <span style={{ color: chain ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
            Chain {chain === null ? 'Checking…' : chain ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <h2>📋 Event Log ({filtered.length} records)</h2>
          <input
            id="audit-search"
            className="form-control"
            type="text"
            placeholder="Filter events…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: 240, padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No logs found</h3>
            <p>Try adjusting your filter</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table" id="audit-logs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Action</th>
                  <th>User ID</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                  <th>Current Hash</th>
                  <th>Prev. Hash</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>{log.id}</td>
                    <td>
                      <span className={`badge ${actionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.user_id}</td>
                    <td style={{ maxWidth: 280, color: 'var(--text-1)', fontSize: '0.82rem' }}>
                      {log.details}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="hash-text" title={log.current_hash}>
                      {log.current_hash.slice(0, 12)}…
                    </td>
                    <td className="hash-text" title={log.previous_hash}>
                      {log.previous_hash === 'GENESIS'
                        ? <span className="badge badge-yellow">GENESIS</span>
                        : `${log.previous_hash.slice(0, 12)}…`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
