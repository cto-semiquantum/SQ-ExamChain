import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function Blueprints() {
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [blueprintName, setBlueprintName] = useState('');
  const [rules, setRules] = useState([
    { subject_id: '', difficulty: 'Easy', question_count: 5, marks: 2 }
  ]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, questRes, bpsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/questions'),
        api.get('/blueprints')
      ]);
      setSubjects(subsRes.data);
      setQuestions(questRes.data);
      setBlueprints(bpsRes.data);

      // Initialize first rule subject
      if (subsRes.data.length > 0) {
        setRules([{ subject_id: subsRes.data[0].id.toString(), difficulty: 'Easy', question_count: 5, marks: 2 }]);
      }
    } catch (err) {
      console.error('Error loading blueprints metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get available question count in bank for a given subject & difficulty
  const getAvailableCount = (subId, diff) => {
    if (!subId) return 0;
    return questions.filter(q => q.subject_id.toString() === subId.toString() && q.difficulty === diff).length;
  };

  // Rule handlers
  const handleAddRule = () => {
    const defaultSubId = subjects.length > 0 ? subjects[0].id.toString() : '';
    setRules(prev => [...prev, { subject_id: defaultSubId, difficulty: 'Easy', question_count: 5, marks: 2 }]);
  };

  const handleRemoveRule = (index) => {
    if (rules.length === 1) return;
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index, field, value) => {
    setRules(prev => prev.map((rule, i) => {
      if (i === index) {
        return { ...rule, [field]: value };
      }
      return rule;
    }));
  };

  // Live calculation of total marks
  const calculateTotalMarks = () => {
    return rules.reduce((acc, rule) => {
      const qCount = parseInt(rule.question_count, 10) || 0;
      const qMarks = parseInt(rule.marks, 10) || 0;
      return acc + (qCount * qMarks);
    }, 0);
  };

  // Form submission
  const handleSaveBlueprint = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!blueprintName.trim()) {
      setFormError('Please enter a blueprint name.');
      return;
    }

    // Basic frontend check for rule validity
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule.subject_id) {
        setFormError(`Rule #${i + 1}: Please select a subject.`);
        return;
      }
      if (rule.question_count <= 0) {
        setFormError(`Rule #${i + 1}: Question count must be greater than 0.`);
        return;
      }
      if (rule.marks <= 0) {
        setFormError(`Rule #${i + 1}: Marks per question must be greater than 0.`);
        return;
      }
    }

    setSaving(true);
    try {
      const formattedRules = rules.map(r => ({
        subject_id: parseInt(r.subject_id, 10),
        difficulty: r.difficulty,
        question_count: parseInt(r.question_count, 10),
        marks: parseInt(r.marks, 10)
      }));

      const payload = {
        name: blueprintName.trim(),
        total_marks: calculateTotalMarks(),
        rules: formattedRules
      };

      const res = await api.post('/blueprints', payload);
      setBlueprints(prev => [res.data, ...prev]);

      // Reset form
      setBlueprintName('');
      if (subjects.length > 0) {
        setRules([{ subject_id: subjects[0].id.toString(), difficulty: 'Easy', question_count: 5, marks: 2 }]);
      }
      setFormSuccess('Blueprint saved successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save blueprint template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlueprint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blueprint template?')) return;
    try {
      await api.delete(`/blueprints/${id}`);
      setBlueprints(prev => prev.filter(bp => bp.id !== id));
    } catch (err) {
      alert('Failed to delete blueprint template.');
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
          Blueprint Engine
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#71717A' }}>
          Create and configure examination blueprints that define question distribution criteria and validate availability.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* ── BLUEPRINT BUILDER FORM ── */}
        <div style={formCard}>
          <h3 style={{ ...cardTitle, marginBottom: '1.25rem' }}>Blueprint Builder</h3>
          
          <form onSubmit={handleSaveBlueprint} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Blueprint Name</label>
              <input
                type="text"
                placeholder="e.g. JEE Mock Test #1"
                value={blueprintName}
                onChange={e => setBlueprintName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Question Distribution Rules</label>
                <button
                  type="button"
                  onClick={handleAddRule}
                  style={textLinkBtn}
                >
                  + Add Rule Constraint
                </button>
              </div>

              {rules.map((rule, idx) => {
                const available = getAvailableCount(rule.subject_id, rule.difficulty);
                const hasEnough = available >= (parseInt(rule.question_count, 10) || 0);

                return (
                  <div key={idx} style={ruleRowContainer}>
                    <div style={ruleRowHeader}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563' }}>Constraint #{idx + 1}</span>
                      {rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(idx)}
                          style={removeBtn}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div style={ruleRowGrid}>
                      <div>
                        <label style={subLabel}>Subject</label>
                        <select
                          value={rule.subject_id}
                          onChange={e => handleRuleChange(idx, 'subject_id', e.target.value)}
                          style={selectStyle}
                        >
                          <option value="" disabled>Select Subject</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={subLabel}>Difficulty</label>
                        <select
                          value={rule.difficulty}
                          onChange={e => handleRuleChange(idx, 'difficulty', e.target.value)}
                          style={selectStyle}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label style={subLabel}>Required</label>
                        <input
                          type="number"
                          min="1"
                          value={rule.question_count}
                          onChange={e => handleRuleChange(idx, 'question_count', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={subLabel}>Marks / Q</label>
                        <input
                          type="number"
                          min="1"
                          value={rule.marks}
                          onChange={e => handleRuleChange(idx, 'marks', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Live Availability Status */}
                    {rule.subject_id && (
                      <div style={statusBanner}>
                        <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          Question Bank Check:
                        </span>
                        <span style={{
                          ...statusBadge,
                          backgroundColor: hasEnough ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                          color: hasEnough ? '#10B981' : '#EF4444'
                        }}>
                          {hasEnough ? '✓ Available' : '✗ Insufficient Questions'} (Available: {available} | Required: {rule.question_count})
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Marks Banner */}
            <div style={totalMarksBox}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Total Calculated Marks:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C3AED' }}>{calculateTotalMarks()} Marks</span>
            </div>

            {formError && <div style={errorBanner}>{formError}</div>}
            {formSuccess && <div style={successBannerStyle}>{formSuccess}</div>}

            <button type="submit" disabled={saving} style={primaryBtn}>
              {saving ? 'Validating & Saving...' : 'Save Blueprint Template'}
            </button>
          </form>
        </div>

        {/* ── BLUEPRINT LIST INVENTORY ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={cardTitle}>Saved Blueprints ({blueprints.length})</h3>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <span style={spinnerStyle} />
            </div>
          ) : blueprints.length === 0 ? (
            <div style={noDataCard}>No blueprints defined yet. Configure one to start exam generation.</div>
          ) : (
            blueprints.map(bp => (
              <div key={bp.id} style={bpCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={bpName}>{bp.name}</h4>
                    <span style={bpDate}>Created {new Date(bp.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={bpTotalMarks}>{bp.total_marks} Marks</span>
                    <button
                      onClick={() => handleDeleteBlueprint(bp.id)}
                      style={deleteIconBtn}
                      title="Delete Template"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Rules breakdown inside card */}
                <div style={bpRulesContainer}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4B5563', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.25rem', marginBottom: '0.35rem' }}>
                    Rule Configs
                  </div>
                  {bp.rules.map(rule => (
                    <div key={rule.id} style={ruleBreakdownRow}>
                      <span style={ruleBreakdownSubject}>{rule.subject?.name}</span>
                      <span style={{
                        ...ruleBreakdownDiff,
                        color: rule.difficulty === 'Easy' ? '#10B981' : rule.difficulty === 'Medium' ? '#D97706' : '#EF4444'
                      }}>{rule.difficulty}</span>
                      <span style={ruleBreakdownSpec}>{rule.question_count} Qs × {rule.marks} M</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}

/* ── STYLING OBJECTS ── */
const formCard = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 12,
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
};

const cardTitle = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#111118',
  margin: 0,
  letterSpacing: '-0.02em',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#4B5563',
  marginBottom: '0.35rem',
};

const subLabel = {
  display: 'block',
  fontSize: '0.68rem',
  fontWeight: 600,
  color: '#9CA3AF',
  marginBottom: '0.25rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  border: '1px solid #E5E7EB',
  borderRadius: 7,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  color: '#1F2937',
  outline: 'none',
  background: '#FFFFFF',
};

const selectStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  border: '1px solid #E5E7EB',
  borderRadius: 7,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  color: '#1F2937',
  outline: 'none',
  background: '#FFFFFF',
};

const textLinkBtn = {
  background: 'none',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#7C3AED',
  cursor: 'pointer',
  padding: 0,
  fontFamily: 'inherit',
};

const ruleRowContainer = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  padding: '0.85rem',
  backgroundColor: '#F9FAFB',
  marginBottom: '0.75rem',
};

const ruleRowHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
};

const removeBtn = {
  background: 'none',
  border: 'none',
  color: '#EF4444',
  fontSize: '0.72rem',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
};

const ruleRowGrid = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
  gap: '0.5rem',
};

const statusBanner = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.6rem',
  borderTop: '1px dotted #E5E7EB',
  paddingTop: '0.5rem',
};

const statusBadge = {
  fontSize: '0.68rem',
  fontWeight: 700,
  padding: '0.1rem 0.4rem',
  borderRadius: 4,
};

const totalMarksBox = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  background: 'rgba(124,58,237,0.04)',
  border: '1px solid rgba(124,58,237,0.1)',
  borderRadius: 8,
};

const primaryBtn = {
  background: '#7C3AED',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 7,
  padding: '0.65rem 1rem',
  fontSize: '0.8125rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
};

const errorBanner = {
  background: '#FEF2F2',
  border: '1px solid #FCA5A5',
  color: '#EF4444',
  padding: '0.75rem',
  borderRadius: 7,
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: 1.4,
};

const successBannerStyle = {
  background: '#ECFDF5',
  border: '1px solid #6EE7B7',
  color: '#10B981',
  padding: '0.75rem',
  borderRadius: 7,
  fontSize: '0.75rem',
  fontWeight: 500,
};

const noDataCard = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 12,
  padding: '2rem',
  textAlign: 'center',
  color: '#71717A',
  fontSize: '0.8125rem',
};

/* ── BLUEPRINT CARD STYLINGS ── */
const bpCard = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 12,
  padding: '1.15rem 1.25rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
};

const bpName = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#111118',
  margin: 0,
};

const bpDate = {
  fontSize: '0.68rem',
  color: '#9CA3AF',
  display: 'block',
  marginTop: '0.1rem',
};

const bpTotalMarks = {
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#7C3AED',
  background: 'rgba(124,58,237,0.08)',
  padding: '0.2rem 0.5rem',
  borderRadius: 6,
};

const deleteIconBtn = {
  background: 'none',
  border: 'none',
  color: '#EF4444',
  fontSize: '0.72rem',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '0.2rem',
};

const bpRulesContainer = {
  marginTop: '0.75rem',
  background: '#F9FAFB',
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  padding: '0.6rem 0.75rem',
};

const ruleBreakdownRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.72rem',
  padding: '0.15rem 0',
};

const ruleBreakdownSubject = {
  fontWeight: 600,
  color: '#374151',
  width: '40%',
};

const ruleBreakdownDiff = {
  fontWeight: 700,
  width: '20%',
};

const ruleBreakdownSpec = {
  color: '#6B7280',
  textAlign: 'right',
  width: '40%',
};

const spinnerStyle = {
  width: '28px',
  height: '28px',
  border: '2.5px solid #F3F4F6',
  borderTopColor: '#7C3AED',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'spin 0.75s linear infinite',
};
