import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

/* ── Confidence bar ─────────────────────────────────────── */
function ConfBar({ pct }) {
  const color = pct >= 80 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', color: '#52525B', fontWeight: 500 }}>Confidence Score</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 7, background: '#F4F5F8', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ fontSize: '0.68rem', color: '#A1A1AA', marginTop: 3 }}>
        {pct >= 80 ? 'High confidence — reliable match' : pct >= 50 ? 'Medium confidence' : 'Low confidence'}
      </div>
    </div>
  );
}

/* ── Detail row ─────────────────────────────────────────── */
function DetailRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <span style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 500, minWidth: 120 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', color: '#111118', fontWeight: 600, textAlign: 'right', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', wordBreak: 'break-all', maxWidth: 220 }}>{value}</span>
    </div>
  );
}

export default function Investigate() {
  const navigate = useNavigate();
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [dragging,setDragging]= useState(false);

  const handleFile = (f) => { if (f?.type === 'application/pdf') setFile(f); };
  const onDrop  = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const onDrag  = (e) => { e.preventDefault(); setDragging(true); };
  const onLeave = ()  => setDragging(false);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/investigate/extract-fingerprint', form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Investigation failed. Please try again.');
    } finally { setLoading(false); }
  };

  const found = result && !result.error;

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', marginBottom: '0.2rem' }}>Investigation</h1>
          <p style={{ fontSize: '0.8125rem', color: '#A1A1AA' }}>Trace the source of leaked examination papers</p>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setFile(null); setError(''); }} style={{
            fontSize: '0.78rem', fontWeight: 600, color: '#7C3AED',
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 7, padding: '0.4rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit',
          }}>+ New Investigation</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.1fr' : '1fr', gap: '1rem', alignItems: 'start' }}>

        {/* Left: Upload */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111118', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>Upload Suspected PDF</h2>
          <p style={{ fontSize: '0.78rem', color: '#A1A1AA', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Every PDF distributed via SQ ExamChain carries an invisible fingerprint in its metadata. Upload a leaked copy to decode and trace its exact source.
          </p>

          {/* Drop zone */}
          <div
            onDrop={onDrop} onDragOver={onDrag} onDragLeave={onLeave}
            onClick={() => document.getElementById('fp-input').click()}
            style={{
              border: `2px dashed ${dragging ? '#7C3AED' : file ? 'rgba(5,150,105,0.4)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 10, padding: '2.25rem 1rem',
              textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'rgba(124,58,237,0.03)' : file ? 'rgba(5,150,105,0.03)' : '#F8F9FB',
              transition: 'all 0.2s', marginBottom: '1rem',
            }}
          >
            <input id="fp-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.625rem' }}>{file ? '✅' : '📄'}</div>
            {file ? (
              <>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669', letterSpacing: '-0.02em' }}>{file.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#A1A1AA', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#52525B', letterSpacing: '-0.02em' }}>Click to select PDF</div>
                <div style={{ fontSize: '0.72rem', color: '#C4C4CC', marginTop: 4 }}>Fingerprint will be extracted from metadata</div>
              </>
            )}
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#DC2626', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <button onClick={handleSubmit} disabled={!file || loading} style={{
            width: '100%', padding: '0.75rem',
            background: !file || loading ? '#E5E7EB' : '#7C3AED',
            color: !file || loading ? '#A1A1AA' : 'white',
            border: 'none', borderRadius: 9, fontSize: '0.9rem', fontWeight: 700,
            cursor: !file || loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'background 0.2s',
          }}>
            {loading ? (
              <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Extracting…</>
            ) : '🔍 Extract Fingerprint & Trace'}
          </button>

          {/* Steps */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1AA', marginBottom: '0.75rem' }}>How It Works</div>
            {[
              { tag: 'Extract', label: 'Read PDF metadata for hidden fingerprint' },
              { tag: 'Decode',  label: 'Decode fingerprint to Download ID' },
              { tag: 'Trace',   label: 'Match Download ID to audit blockchain' },
            ].map(s => (
              <div key={s.tag} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7C3AED', background: 'rgba(124,58,237,0.08)', padding: '0.2rem 0.55rem', borderRadius: 5, minWidth: 54, textAlign: 'center' }}>{s.tag}</span>
                <span style={{ fontSize: '0.78rem', color: '#71717A' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Result */}
        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Status banner */}
            {found ? (
              <div style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669', letterSpacing: '-0.02em' }}>Leak Source Identified</div>
                  <div style={{ fontSize: '0.75rem', color: '#52525B', marginTop: 1 }}>Fingerprint matched to a specific download event</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✕</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#DC2626' }}>No Match Found</div>
                  <div style={{ fontSize: '0.75rem', color: '#52525B', marginTop: 1 }}>Fingerprint not linked to any known download</div>
                </div>
              </div>
            )}

            {found && (
              <>
                {/* Source card */}
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1AA', marginBottom: '1rem' }}>Source Details</div>
                  <DetailRow label="Exam" value={result.exam_title || '—'} />
                  <DetailRow label="Leaked By" value={result.center_name || result.username || '—'} />
                  <DetailRow label="Download ID" value={`#${result.download_id || result.log_id || '—'}`} mono />
                  <DetailRow label="Download Time" value={result.timestamp ? new Date(result.timestamp).toLocaleString() : '—'} />
                </div>

                {/* Confidence */}
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <ConfBar pct={result.confidence ?? 100} />
                </div>

                {/* Evidence */}
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1AA', marginBottom: '1rem' }}>Evidence</div>
                  <DetailRow label="Fingerprint Hash" value={result.fingerprint ? result.fingerprint.slice(0, 24) + '…' : '—'} mono />
                  <DetailRow label="Blockchain Verified" value={result.blockchain_verified ? 'Yes ✓' : 'No'} />
                  <DetailRow label="Reported At" value={new Date().toLocaleString()} />
                  <DetailRow label="IP Address" value={result.ip_address || '192.168.x.x'} mono />
                </div>
              </>
            )}
          </div>
        ) : !result && !loading && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '3rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#52525B', marginBottom: '0.5rem' }}>Awaiting Analysis</div>
            <div style={{ fontSize: '0.78rem', color: '#A1A1AA', lineHeight: 1.6 }}>Upload a PDF and run the fingerprint extractor to see results here.</div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}
