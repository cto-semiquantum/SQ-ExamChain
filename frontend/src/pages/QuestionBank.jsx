import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function QuestionBank() {
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Subject form state
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState('');

  // New Question form state
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [marks, setMarks] = useState(2);
  const [questionText, setQuestionText] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [savingQuestion, setSavingQuestion] = useState(false);

  // CSV upload state
  const [csvSubjectId, setCsvSubjectId] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');
  const [uploadingCsv, setUploadingCsv] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, questRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/questions'),
      ]);
      setSubjects(subsRes.data);
      setQuestions(questRes.data);
      
      // Auto select first subject in dropdowns
      if (subsRes.data.length > 0) {
        setSelectedSubjectId(subsRes.data[0].id.toString());
        setCsvSubjectId(subsRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create subject handler
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSubjectError('');
    if (!newSubjectName.trim()) return;

    try {
      const res = await api.post('/subjects', { name: newSubjectName.trim() });
      const created = res.data;
      setSubjects(prev => [...prev, created]);
      setSelectedSubjectId(created.id.toString());
      setCsvSubjectId(created.id.toString());
      setNewSubjectName('');
      setShowAddSubject(false);
    } catch (err) {
      setSubjectError(err.response?.data?.detail || 'Failed to create subject.');
    }
  };

  // Create question handler
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedSubjectId) {
      setFormError('Please select or create a subject first.');
      return;
    }
    if (!topic.trim()) {
      setFormError('Please enter a topic.');
      return;
    }
    if (!questionText.trim()) {
      setFormError('Please enter the question text.');
      return;
    }
    if (marks <= 0) {
      setFormError('Marks must be greater than 0.');
      return;
    }

    setSavingQuestion(true);
    try {
      const payload = {
        subject_id: parseInt(selectedSubjectId, 10),
        question_text: questionText.trim(),
        topic: topic.trim(),
        difficulty,
        marks: parseInt(marks, 10),
      };
      const res = await api.post('/questions', payload);
      setQuestions(prev => [res.data, ...prev]);
      setQuestionText('');
      setTopic('');
      setFormSuccess('Question saved successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save question.');
    } finally {
      setSavingQuestion(false);
    }
  };

  // CSV upload handler
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    setCsvError('');
    setCsvSuccess('');

    if (!csvSubjectId) {
      setCsvError('Please select a subject for import.');
      return;
    }
    if (!csvFile) {
      setCsvError('Please select a CSV file.');
      return;
    }

    setUploadingCsv(true);
    const formData = new FormData();
    formData.append('subject_id', csvSubjectId);
    formData.append('file', csvFile);

    try {
      const res = await api.post('/questions/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCsvSuccess(res.data.message || 'Successfully imported questions!');
      setCsvFile(null);
      // Reset input
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';
      
      // Refresh questions list
      const questRes = await api.get('/questions');
      setQuestions(questRes.data);
    } catch (err) {
      setCsvError(err.response?.data?.detail || 'Failed to import CSV. Ensure format is correct.');
    } finally {
      setUploadingCsv(false);
    }
  };

  // Delete question handler
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert('Failed to delete question.');
    }
  };

  // Compute breakdown stats per subject
  const getSubjectStats = () => {
    const stats = {};
    // Initialize stats with all available subjects
    subjects.forEach(sub => {
      stats[sub.name] = { Easy: 0, Medium: 0, Hard: 0, Total: 0 };
    });

    questions.forEach(q => {
      const subName = q.subject?.name;
      if (subName && stats[subName]) {
        stats[subName][q.difficulty] = (stats[subName][q.difficulty] || 0) + 1;
        stats[subName].Total += 1;
      }
    });

    return stats;
  };

  const subjectStats = getSubjectStats();

  // Filtered questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubjectId === '' || q.subject_id.toString() === filterSubjectId;
    const matchesDifficulty = filterDifficulty === '' || q.difficulty === filterDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <AdminLayout>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111118', letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
          Question Bank Management
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#71717A' }}>
          Manage your examination subjects, topics, questions, and perform bulk CSV imports.
        </p>
      </div>

      {/* ── SUBJECT BREAKDOWN STATISTICS ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111118', marginBottom: '0.85rem', letterSpacing: '-0.02em' }}>
          Subject Breakdowns
        </h2>
        {subjects.length === 0 ? (
          <div style={noDataCard}>No subjects available. Create a subject to get started.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Object.entries(subjectStats).map(([subjectName, counts]) => (
              <div key={subjectName} style={statsCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111118' }}>{subjectName}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED', background: 'rgba(124,58,237,0.08)', padding: '0.15rem 0.5rem', borderRadius: 100 }}>
                    {counts.Total} Questions
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={statBarRow}>
                    <span style={statBarLabel}>Easy</span>
                    <div style={progressBg}>
                      <div style={{ ...progressFill, width: `${counts.Total > 0 ? (counts.Easy / counts.Total) * 100 : 0}%`, backgroundColor: '#10B981' }} />
                    </div>
                    <span style={statBarValue}>{counts.Easy}</span>
                  </div>
                  <div style={statBarRow}>
                    <span style={statBarLabel}>Medium</span>
                    <div style={progressBg}>
                      <div style={{ ...progressFill, width: `${counts.Total > 0 ? (counts.Medium / counts.Total) * 100 : 0}%`, backgroundColor: '#F59E0B' }} />
                    </div>
                    <span style={statBarValue}>{counts.Medium}</span>
                  </div>
                  <div style={statBarRow}>
                    <span style={statBarLabel}>Hard</span>
                    <div style={progressBg}>
                      <div style={{ ...progressFill, width: `${counts.Total > 0 ? (counts.Hard / counts.Total) * 100 : 0}%`, backgroundColor: '#EF4444' }} />
                    </div>
                    <span style={statBarValue}>{counts.Hard}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TWO-COLUMN LAYOUT: ADD QUESTION & CSV BULK IMPORT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Manual Add Question */}
        <div style={formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={cardTitle}>Add Single Question</h3>
            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              style={{ fontSize: '0.78rem', color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              {showAddSubject ? 'Cancel' : '+ New Subject'}
            </button>
          </div>

          {showAddSubject && (
            <form onSubmit={handleCreateSubject} style={inlineSubjectForm}>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Subject name (e.g. Physics)"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="submit" style={subBtn}>Create</button>
              </div>
              {subjectError && <p style={errorText}>{subjectError}</p>}
            </form>
          )}

          <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  style={selectStyle}
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Topic</label>
                <input
                  type="text"
                  placeholder="Mechanics, Organic, etc."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  style={selectStyle}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Marks</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Question Text</label>
              <textarea
                rows="4"
                placeholder="What is Newton's First Law?"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                style={textareaStyle}
              />
            </div>

            {formError && <p style={errorText}>{formError}</p>}
            {formSuccess && <p style={successText}>{formSuccess}</p>}

            <button type="submit" disabled={savingQuestion} style={primaryBtn}>
              {savingQuestion ? 'Saving...' : 'Save Question'}
            </button>
          </form>
        </div>

        {/* CSV Import Card */}
        <div style={formCard}>
          <h3 style={{ ...cardTitle, marginBottom: '0.5rem' }}>CSV Bulk Import</h3>
          <p style={{ fontSize: '0.78rem', color: '#71717A', marginBottom: '1.25rem' }}>
            Import up to 100 questions instantly. The CSV headers must be:
            <code style={codeBlock}>Question,Topic,Difficulty,Marks</code>.
          </p>

          <form onSubmit={handleCsvUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Target Subject</label>
              <select
                value={csvSubjectId}
                onChange={e => setCsvSubjectId(e.target.value)}
                style={selectStyle}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Select CSV File</label>
              <div style={fileUploadContainer}>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={e => setCsvFile(e.target.files[0])}
                  style={fileInputStyle}
                />
              </div>
            </div>

            {csvError && <p style={errorText}>{csvError}</p>}
            {csvSuccess && <p style={successText}>{csvSuccess}</p>}

            <button type="submit" disabled={uploadingCsv} style={secondaryBtn}>
              {uploadingCsv ? 'Uploading...' : 'Import CSV'}
            </button>
          </form>

          {/* Sample CSV Template helper */}
          <div style={sampleTemplateBox}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111118', marginBottom: '0.25rem' }}>Sample Format:</h4>
            <pre style={{ fontSize: '0.68rem', color: '#4B5563', margin: 0, background: '#F3F4F6', padding: '0.5rem', borderRadius: 6, overflowX: 'auto' }}>
{`Question,Topic,Difficulty,Marks
What is Newton's First Law?,Mechanics,Easy,2
Define organic chemistry.,Organic,Medium,3
Explain Schrodinger's Cat experiment.,Quantum,Hard,5`}
            </pre>
          </div>
        </div>

      </div>

      {/* ── QUESTIONS LIST & TABLE ── */}
      <div style={tableCard}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={cardTitle}>Questions Inventory ({filteredQuestions.length})</h3>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search text or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={searchStyle}
            />
            <select
              value={filterSubjectId}
              onChange={e => setFilterSubjectId(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <span style={spinnerStyle} />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#A1A1AA', fontSize: '0.85rem' }}>
            No questions match the current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thRowStyle}>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Topic</th>
                  <th style={thStyle}>Difficulty</th>
                  <th style={thStyle}>Marks</th>
                  <th style={{ ...thStyle, width: '45%' }}>Question Text</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q, idx) => (
                  <tr key={q.id} style={{ ...trRowStyle, background: idx % 2 === 0 ? '#FFFFFF' : '#FDFDFD' }}>
                    <td style={tdStyle}>
                      <span style={subjectTag}>{q.subject?.name || 'Unknown'}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{q.topic}</td>
                    <td style={tdStyle}>
                      <span style={{
                        ...diffTag,
                        backgroundColor: q.difficulty === 'Easy' ? 'rgba(16,185,129,0.08)' : q.difficulty === 'Medium' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                        color: q.difficulty === 'Easy' ? '#10B981' : q.difficulty === 'Medium' ? '#D97706' : '#EF4444'
                      }}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#1F2937' }}>{q.marks} Marks</td>
                    <td style={{ ...tdStyle, color: '#4B5563', whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.78rem', lineHeight: 1.4 }}>
                      {q.question_text}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={deleteBtnStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Styles insertion for spinner and keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}

/* ── STYLING OBJECTS (Vanilla CSS in JS for absolute precision) ── */
const statsCard = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
};

const statBarRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.75rem',
};

const statBarLabel = {
  width: '50px',
  color: '#71717A',
  fontWeight: 500,
};

const statBarValue = {
  width: '20px',
  textAlign: 'right',
  color: '#111118',
  fontWeight: 600,
};

const progressBg = {
  flex: 1,
  height: 6,
  background: '#F1F5F9',
  borderRadius: 100,
  overflow: 'hidden',
  position: 'relative',
};

const progressFill = {
  height: '100%',
  borderRadius: 100,
  transition: 'width 0.4s ease-out',
};

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
  transition: 'border-color 0.15s',
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

const textareaStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  border: '1px solid #E5E7EB',
  borderRadius: 7,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  color: '#1F2937',
  outline: 'none',
  resize: 'vertical',
  background: '#FFFFFF',
};

const primaryBtn = {
  background: '#7C3AED',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 7,
  padding: '0.6rem 1rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
};

const secondaryBtn = {
  background: '#1F2937',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 7,
  padding: '0.6rem 1rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
};

const inlineSubjectForm = {
  background: '#F9FAFB',
  padding: '0.75rem',
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  marginBottom: '1rem',
};

const subBtn = {
  background: '#7C3AED',
  color: 'white',
  border: 'none',
  borderRadius: 7,
  padding: '0 0.85rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const codeBlock = {
  background: '#F3F4F6',
  color: '#1F2937',
  padding: '0.15rem 0.35rem',
  borderRadius: 4,
  fontFamily: 'monospace',
  fontSize: '0.72rem',
  marginLeft: '0.25rem',
};

const fileUploadContainer = {
  border: '2px dashed #E5E7EB',
  padding: '1rem',
  borderRadius: 8,
  textAlign: 'center',
  background: '#F9FAFB',
  cursor: 'pointer',
};

const fileInputStyle = {
  fontSize: '0.78rem',
  color: '#4B5563',
  cursor: 'pointer',
  maxWidth: '100%',
};

const sampleTemplateBox = {
  marginTop: '1.25rem',
  borderTop: '1px solid #E5E7EB',
  paddingTop: '1rem',
};

const errorText = {
  fontSize: '0.75rem',
  color: '#EF4444',
  margin: '0.25rem 0 0 0',
  fontWeight: 500,
};

const successText = {
  fontSize: '0.75rem',
  color: '#10B981',
  margin: '0.25rem 0 0 0',
  fontWeight: 500,
};

const noDataCard = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 12,
  padding: '2rem',
  textAlign: 'center',
  color: '#71717A',
  fontSize: '0.85rem',
};

/* ── TABLE STYLING ── */
const tableCard = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 12,
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
};

const searchStyle = {
  padding: '0.4rem 0.75rem',
  fontSize: '0.78rem',
  border: '1px solid #E5E7EB',
  borderRadius: 7,
  outline: 'none',
  fontFamily: 'inherit',
  width: '180px',
  background: '#FFFFFF',
};

const filterSelectStyle = {
  padding: '0.4rem 0.75rem',
  fontSize: '0.78rem',
  border: '1px solid #E5E7EB',
  borderRadius: 7,
  outline: 'none',
  fontFamily: 'inherit',
  background: '#FFFFFF',
  color: '#4B5563',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontFamily: 'inherit',
};

const thRowStyle = {
  borderBottom: '2px solid #F3F4F6',
};

const thStyle = {
  padding: '0.75rem 1rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const trRowStyle = {
  borderBottom: '1px solid #F3F4F6',
  transition: 'background 0.15s',
};

const tdStyle = {
  padding: '0.85rem 1rem',
  fontSize: '0.8125rem',
  color: '#111118',
  whiteSpace: 'nowrap',
};

const subjectTag = {
  background: 'rgba(124,58,237,0.08)',
  color: '#7C3AED',
  padding: '0.2rem 0.5rem',
  borderRadius: 6,
  fontSize: '0.72rem',
  fontWeight: 600,
};

const diffTag = {
  padding: '0.15rem 0.5rem',
  borderRadius: 100,
  fontSize: '0.7rem',
  fontWeight: 600,
};

const deleteBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#EF4444',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  borderRadius: 4,
  transition: 'background 0.15s',
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
