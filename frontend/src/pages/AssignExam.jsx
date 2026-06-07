import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function AssignExam() {
  const navigate = useNavigate();
  const [exams, setExams]       = useState([]);
  const [centers, setCenters]   = useState([]);
  const [examId, setExamId]     = useState('');
  const [centerId, setCenterId] = useState('');
  const [status, setStatus]     = useState(null);
  const [msg, setMsg]           = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [e, c] = await Promise.all([api.get('/admin/exams'), api.get('/admin/centers')]);
        setExams(e.data);
        setCenters(c.data);
      } catch {
        navigate('/login');
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('exam_id', examId);
      form.append('center_id', centerId);
      await api.post('/admin/assign', form);
      const exam   = exams.find(x => x.id == examId);
      const center = centers.find(x => x.id == centerId);
      setStatus('success');
      setMsg(`"${exam?.title}" assigned to "${center?.center_name}" successfully.`);
      setExamId('');
      setCenterId('');
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.detail || 'Assignment failed. It may already be assigned.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Assign Exam</h1>
          <p>Assign an encrypted exam paper to an examination center</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/admin')}>← Back</button>
      </div>

      <div style={{ maxWidth: 560 }}>
        {status === 'success' && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>{msg}</span>
          </div>
        )}
        {status === 'error' && (
          <div className="alert alert-error">
            <span className="alert-icon">✕</span>
            <span>{msg}</span>
          </div>
        )}

        <div className="content-card">
          <div className="content-card-header">
            <h2>🎯 Assignment Details</h2>
          </div>
          <div className="content-card-body">
            {exams.length === 0 || centers.length === 0 ? (
              <div className="alert alert-info">
                <span className="alert-icon">ℹ</span>
                <span>
                  {exams.length === 0 ? 'No exam papers found. Please upload an exam first. ' : ''}
                  {centers.length === 0 ? 'No centers registered yet.' : ''}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Exam Paper</label>
                  <select
                    id="assign-exam-select"
                    className="form-control"
                    value={examId}
                    onChange={e => setExamId(e.target.value)}
                    required
                  >
                    <option value="">— Choose an exam —</option>
                    {exams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Examination Center</label>
                  <select
                    id="assign-center-select"
                    className="form-control"
                    value={centerId}
                    onChange={e => setCenterId(e.target.value)}
                    required
                  >
                    <option value="">— Choose a center —</option>
                    {centers.map(c => (
                      <option key={c.id} value={c.id}>{c.center_name} ({c.username})</option>
                    ))}
                  </select>
                </div>

                <div className="alert alert-info">
                  <span className="alert-icon">🔏</span>
                  <span>When the center downloads this paper, a unique invisible fingerprint will be embedded automatically.</span>
                </div>

                <button
                  id="assign-submit"
                  type="submit"
                  className="btn btn-primary btn-lg btn-full mt-2"
                  disabled={loading}
                >
                  {loading ? <><span className="spinner" /> &nbsp;Assigning…</> : '⇌ Assign Paper'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
