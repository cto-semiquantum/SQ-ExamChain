import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LeakInvestigation() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInvestigate = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/investigate/check-leak', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setResult({ status: 'error', message: err.response?.data?.detail || 'Analysis failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Leak Investigation Module</div>
        <div>
          <button className="btn btn-outline" style={{ marginRight: '1rem' }} onClick={() => navigate('/admin')}>Back to Dashboard</button>
          <button className="btn btn-primary" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Trace Leaked Paper</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Upload a suspected leaked PDF to extract its invisible fingerprint and identify the source center.
          </p>
          
          <form onSubmit={handleInvestigate} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <input 
                type="file" 
                className="input-field" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files[0])} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !file} style={{ width: '100%', maxWidth: '400px' }}>
              {loading ? 'Analyzing...' : 'Extract Fingerprint'}
            </button>
          </form>

          {result && (
            <div style={{ 
              padding: '2rem', 
              borderRadius: '12px', 
              background: result.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${result.status === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`
            }}>
              <h3 style={{ color: result.status === 'success' ? 'var(--success-color)' : 'var(--danger-color)', marginBottom: '1rem' }}>
                {result.message}
              </h3>
              
              {result.status === 'success' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Source Center</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {result.source_center.center_name} (ID: {result.source_center.id})
                    </div>
                  </div>
                  
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Download Timestamp</div>
                    <div style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>
                      {new Date(result.fingerprint.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Blockchain Log ID</div>
                    <div style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>
                      {result.fingerprint.download_id}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeakInvestigation;
