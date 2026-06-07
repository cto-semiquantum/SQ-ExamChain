import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function UploadExam() {
  const navigate = useNavigate();
  const [title,      setTitle]      = useState('');
  const [file,       setFile]       = useState(null);
  const [examDate,   setExamDate]   = useState('');
  const [examTime,   setExamTime]   = useState('');
  const [unlockTime, setUnlockTime] = useState('');
  const [useLock,    setUseLock]    = useState(false);
  const [status,     setStatus]     = useState(null);
  const [msg,        setMsg]        = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('file',  file);
      if (examDate)               form.append('exam_date',   examDate);
      if (examTime)               form.append('exam_time',   examTime);
      if (useLock && unlockTime)  form.append('unlock_time', unlockTime);

      await api.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setMsg(`"${title}" encrypted with AES-256 and stored.${useLock && unlockTime ? ` Time-lock set for ${new Date(unlockTime).toLocaleString()}.` : ''}`);
      setTitle(''); setFile(null);
      setExamDate(''); setExamTime(''); setUnlockTime('');
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Upload Exam Paper</h1>
          <p>Encrypt and store a PDF with optional time-lock</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/admin')}>← Back</button>
      </div>

      <div style={{ maxWidth: 600 }}>
        {status === 'success' && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <div><strong>Upload successful!</strong><br /><span>{msg}</span></div>
          </div>
        )}
        {status === 'error' && (
          <div className="alert alert-error">
            <span className="alert-icon">✕</span><span>{msg}</span>
          </div>
        )}

        <div className="content-card">
          <div className="content-card-header"><h2>📤 Paper Details</h2></div>
          <div className="content-card-body">
            <form onSubmit={handleSubmit}>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Exam Title</label>
                <input id="upload-title" className="form-control" type="text"
                  placeholder="e.g. Class 12 Physics — 2026"
                  value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              {/* File */}
              <div className="form-group">
                <label className="form-label">PDF File</label>
                <div className="file-input-wrapper">
                  <span className="file-input-icon">📄</span>
                  <div className="file-input-text">
                    {file
                      ? <><strong style={{ color: 'var(--text-1)' }}>{file.name}</strong><br />
                          <span>{(file.size / 1024).toFixed(1)} KB</span></>
                      : <><strong>Click to choose a PDF</strong><br />Only .pdf files allowed</>}
                  </div>
                  <input id="upload-file" type="file" accept=".pdf"
                    onChange={e => setFile(e.target.files[0])} required />
                </div>
              </div>

              {/* Exam Date / Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Exam Date</label>
                  <input id="upload-exam-date" className="form-control" type="date"
                    value={examDate} onChange={e => setExamDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Time</label>
                  <input id="upload-exam-time" className="form-control" type="time"
                    value={examTime} onChange={e => setExamTime(e.target.value)} />
                </div>
              </div>

              {/* Time-Lock Toggle */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                  <div
                    id="timelock-toggle"
                    onClick={() => setUseLock(v => !v)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: useLock ? 'var(--primary)' : 'var(--border)',
                      position: 'relative', cursor: 'pointer',
                      transition: 'background 0.3s', flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'white', position: 'absolute',
                      top: 2, left: useLock ? 22 : 2,
                      transition: 'left 0.25s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    }} />
                  </div>
                  <span className="form-label" style={{ margin: 0 }}>Enable Time-Lock 🔒</span>
                </label>
                <p className="text-muted text-sm mt-1">
                  Centers cannot download this paper until the unlock time is reached.
                </p>
              </div>

              {useLock && (
                <div className="form-group" style={{
                  padding: '1.25rem', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}>
                  <label className="form-label" style={{ color: 'var(--primary)' }}>
                    🕐 Unlock Date &amp; Time (Local)
                  </label>
                  <input
                    id="upload-unlock-time"
                    className="form-control"
                    type="datetime-local"
                    value={unlockTime}
                    onChange={e => setUnlockTime(e.target.value)}
                    required={useLock}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-muted text-sm mt-1">
                    Paper will automatically become downloadable at this time.
                  </p>
                </div>
              )}

              <div className="alert alert-info" style={{ marginTop: '1.25rem' }}>
                <span className="alert-icon">🔐</span>
                <span>PDF will be encrypted with AES-256. The original file is never stored in plaintext.</span>
              </div>

              <button id="upload-submit" type="submit"
                className="btn btn-primary btn-lg btn-full mt-2"
                disabled={loading || !file}>
                {loading ? <><span className="spinner" /> &nbsp;Encrypting…</> : '🔐 Encrypt & Upload'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
