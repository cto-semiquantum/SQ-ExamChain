import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

const STATUS = { true: { label: 'Locked',    bg: 'rgba(217,119,6,0.1)',  color: '#D97706', border: 'rgba(217,119,6,0.2)' },
                 false:{ label: 'Scheduled', bg: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: 'rgba(124,58,237,0.2)' } };

export default function ExamsList() {
  const navigate  = useNavigate();
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All Status');

  useEffect(() => {
    api.get('/admin/exams')
      .then(r => setExams(r.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const filtered = exams.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All Status' || (filter === 'Locked' ? e.is_locked : !e.is_locked);
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', marginBottom: '0.2rem' }}>Exams</h1>
          <p style={{ fontSize: '0.8125rem', color: '#A1A1AA' }}>Manage all examination papers</p>
        </div>
        <button onClick={() => navigate('/admin/upload')} style={{
          background: '#7C3AED', color: 'white', border: 'none', borderRadius: 8,
          padding: '0.6rem 1.125rem', fontSize: '0.8125rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem',
        }}>
          + Upload Exam
        </button>
      </div>

      {/* Table card */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#C4C4CC', fontSize: '0.875rem' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search exams..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, height: 36, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 7, fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', background: '#F8F9FB', color: '#111118' }}
            />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{
            height: 36, padding: '0 0.75rem', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 7, fontSize: '0.8125rem', fontFamily: 'inherit', background: '#F8F9FB', color: '#111118', cursor: 'pointer',
          }}>
            {['All Status', 'Scheduled', 'Locked'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#A1A1AA', fontSize: '0.875rem' }}>Loading exams…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#A1A1AA', fontSize: '0.875rem' }}>No exams found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FB' }}>
                {['Title', 'Subject', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((exam, i) => {
                const st = STATUS[exam.is_locked];
                return (
                  <tr key={exam.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0 }}>📋</div>
                        <div>
                          <div style={{ fontSize: '0.8375rem', fontWeight: 600, color: '#111118', letterSpacing: '-0.01em' }}>{exam.title}</div>
                          {exam.unlock_time && (
                            <div style={{ fontSize: '0.7rem', color: '#A1A1AA', marginTop: 1 }}>
                              Unlocks: {new Date(exam.unlock_time).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: '#52525B' }}>—</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: '#52525B' }}>
                      {exam.exam_date || '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, color: st.color,
                        background: st.bg, border: `1px solid ${st.border}`,
                        padding: '0.2rem 0.625rem', borderRadius: 100,
                      }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <button onClick={() => navigate('/admin/assign')} style={{
                        fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED',
                        background: 'rgba(124,58,237,0.08)', border: 'none', borderRadius: 6,
                        padding: '0.3rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit',
                      }}>Assign →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>Showing 1 to {filtered.length} of {filtered.length} results</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[1].map(p => (
                <button key={p} style={{
                  width: 28, height: 28, borderRadius: 6, border: 'none',
                  background: '#7C3AED', color: 'white',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
