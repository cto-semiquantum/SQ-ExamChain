import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function AuditLogs() {
  const navigate  = useNavigate();
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All Actions');
  const [chain,   setChain]   = useState(null);

  useEffect(() => {
    Promise.all([api.get('/admin/audit-logs'), api.get('/admin/verify-blockchain')])
      .then(([l, c]) => { setLogs(l.data); setChain(c.data.is_valid); })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const ACTION_LABELS = {
    UPLOAD_EXAM:   'Upload',
    ASSIGN_EXAM:   'Assign',
    DOWNLOAD_EXAM: 'Download',
    BLOCKCHAIN_LOG:'Blockchain',
  };
  const ACTION_COLORS = {
    UPLOAD_EXAM:   { bg: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: 'rgba(124,58,237,0.2)' },
    ASSIGN_EXAM:   { bg: 'rgba(8,145,178,0.08)',  color: '#0891B2', border: 'rgba(8,145,178,0.2)' },
    DOWNLOAD_EXAM: { bg: 'rgba(5,150,105,0.08)',  color: '#059669', border: 'rgba(5,150,105,0.2)' },
    BLOCKCHAIN_LOG:{ bg: 'rgba(217,119,6,0.08)',  color: '#D97706', border: 'rgba(217,119,6,0.2)' },
  };

  const actions = ['All Actions', ...Object.keys(ACTION_LABELS)];

  const filtered = logs.filter(l => {
    const matchSearch = l.details?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All Actions' || l.action === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', marginBottom: '0.2rem' }}>Audit Logs</h1>
          <p style={{ fontSize: '0.8125rem', color: '#A1A1AA' }}>Track all system activities</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            color: chain ? '#059669' : '#DC2626',
            background: chain ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
            border: `1px solid ${chain ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
            padding: '0.35rem 0.875rem', borderRadius: 100,
          }}>
            ⛓ Chain {chain === null ? '…' : chain ? 'Verified' : 'BROKEN'}
          </span>
          <button style={{
            fontSize: '0.78rem', fontWeight: 600, color: '#7C3AED',
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 7, padding: '0.4rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit',
          }}>⬇ Export</button>
        </div>
      </div>

      {/* Table card */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#C4C4CC' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…"
              style={{ width: '100%', paddingLeft: 30, height: 34, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 7, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', background: '#F8F9FB', color: '#111118' }}
            />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ height: 34, padding: '0 0.75rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 7, fontSize: '0.8rem', fontFamily: 'inherit', background: '#F8F9FB', color: '#111118', cursor: 'pointer' }}>
            {actions.map(a => <option key={a} value={a}>{a === 'All Actions' ? a : (ACTION_LABELS[a] || a)}</option>)}
          </select>
          <select style={{ height: 34, padding: '0 0.75rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 7, fontSize: '0.8rem', fontFamily: 'inherit', background: '#F8F9FB', color: '#111118', cursor: 'pointer' }}>
            <option>All Entities</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#A1A1AA', fontSize: '0.875rem' }}>Loading logs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#A1A1AA', fontSize: '0.875rem' }}>No logs found</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FB' }}>
                  {['Time', 'Action', 'Entity', 'Details', 'To Month'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const ac = ACTION_COLORS[log.action] || { bg: 'rgba(0,0,0,0.05)', color: '#71717A', border: 'rgba(0,0,0,0.1)' };
                  const label = ACTION_LABELS[log.action] || log.action;
                  return (
                    <tr key={log.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.78rem', color: '#52525B', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} —
                        <div style={{ fontSize: '0.68rem', color: '#A1A1AA' }}>{new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: ac.color, background: ac.bg, border: `1px solid ${ac.border}`, padding: '0.2rem 0.6rem', borderRadius: 100 }}>{label}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: '#52525B' }}>
                        User #{log.user_id || '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.78rem', color: '#52525B', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', color: '#A1A1AA', background: '#F4F5F8', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                          {log.prev_hash ? log.prev_hash.slice(0, 8) + '…' : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>Showing 1 to {Math.min(filtered.length, 10)} of {filtered.length} logs</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3].map((p, i) => (
                  <button key={p} style={{
                    width: 28, height: 28, borderRadius: 6, border: 'none',
                    background: i === 0 ? '#7C3AED' : '#F4F5F8',
                    color: i === 0 ? 'white' : '#71717A',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{p}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
