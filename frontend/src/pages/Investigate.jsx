import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function Investigate() {
  const navigate = useNavigate();
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/investigate/check-leak', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setResult({ status: 'error', message: err.response?.data?.detail || 'Analysis failed.' });
    } finally {
      setLoading(false);
    }
  };

  const fp = result?.fingerprint;
  const src = result?.source_center;

  return (
    <AdminLayout>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Leak Investigation</h1>
          <p>Upload a suspected leaked PDF to trace its origin</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/admin')}>← Back</button>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div className="content-card" style={{ marginBottom: '1.5rem' }}>
          <div className="content-card-header">
            <h2>🔍 Upload Suspected PDF</h2>
          </div>
          <div className="content-card-body">
            <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>
              Every PDF downloaded through SQ ExamChain carries an invisible fingerprint embedded in the document metadata.
              Upload any suspected leaked paper to extract and decode that fingerprint.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Suspected PDF</label>
                <div className="file-input-wrapper">
                  <span className="file-input-icon">🔎</span>
                  <div className="file-input-text">
                    {file ? (
                      <><strong style={{ color: 'var(--text-1)' }}>{file.name}</strong><br />
                      <span>{(file.size / 1024).toFixed(1)} KB</span></>
                    ) : (
                      <><strong>Click to select PDF for analysis</strong><br />Fingerprint will be extracted from metadata</>
                    )}
                  </div>
                  <input
                    id="investigate-file"
                    type="file"
                    accept=".pdf"
                    onChange={e => { setFile(e.target.files[0]); setResult(null); }}
                    required
                  />
                </div>
              </div>

              <button
                id="investigate-submit"
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading || !file}
              >
                {loading ? <><span className="spinner" /> &nbsp;Analyzing fingerprint…</> : '🔬 Extract Fingerprint & Trace'}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`result-card ${result.status === 'success' ? 'success' : 'failure'}`} id="investigate-result">
            <div className={`result-header ${result.status === 'success' ? 'success' : 'failure'}`}>
              <span style={{ fontSize: '1.6rem' }}>{result.status === 'success' ? '🚨' : '❌'}</span>
              <h3>
                {result.status === 'success' ? 'Leak Source Identified!' : 'No Fingerprint Found'}
              </h3>
            </div>

            {result.status === 'success' && src && fp ? (
              <>
                <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                  <span className="alert-icon">⚠️</span>
                  <span>This paper was leaked by <strong>{src.center_name}</strong>. Evidence has been logged to the blockchain audit trail.</span>
                </div>
                <div className="result-fields">
                  <div className="result-field">
                    <div className="result-field-label">Source Center</div>
                    <div className="result-field-value" id="result-center-name">{src.center_name}</div>
                  </div>
                  <div className="result-field">
                    <div className="result-field-label">Center Username</div>
                    <div className="result-field-value">{src.username}</div>
                  </div>
                  <div className="result-field">
                    <div className="result-field-label">Center ID</div>
                    <div className="result-field-value">#{src.id}</div>
                  </div>
                  <div className="result-field">
                    <div className="result-field-label">Blockchain Log ID</div>
                    <div className="result-field-value" id="result-download-id">#{fp.download_id}</div>
                  </div>
                  <div className="result-field" style={{ gridColumn: '1 / -1' }}>
                    <div className="result-field-label">Download Timestamp</div>
                    <div className="result-field-value" id="result-timestamp">
                      {new Date(fp.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted text-sm">{result.message}</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
