import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

/* ── Responsive hook ───────────────────────────────────── */
function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

/* ── Reveal animation ──────────────────────────────────── */
function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      style={style}
    >{children}</motion.div>
  );
}

/* ── Colors ────────────────────────────────────────────── */
const C = {
  bg:         '#FFFFFF',
  bg2:        '#F8F7FF',
  bg3:        '#F3F0FF',
  surface:    '#FFFFFF',
  border:     '#E8E4F8',
  borderLight:'#F0EDF8',
  purple:     '#7C3AED',
  purpleLight:'#8B5CF6',
  purpleDim:  '#EDE9FE',
  purpleText: '#6D28D9',
  text1:      '#1A1033',
  text2:      '#4C3D7A',
  text3:      '#9585B8',
  text4:      '#BFB5D9',
  green:      '#059669',
  greenDim:   '#ECFDF5',
  cyan:       '#0891B2',
  pink:       '#DB2777',
};

/* ── 3D Shield ─────────────────────────────────────────── */
function Shield3D() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto' }}>
      {/* Glow platform */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 60,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(8px)',
      }} />
      {/* Outer rings */}
      {[380, 320, 260].map((s, i) => (
        <div key={s} style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: s, height: s, borderRadius: '50%',
          border: `1px solid rgba(124,58,237,${0.06 + i * 0.04})`,
        }} />
      ))}
      {/* Shield SVG */}
      <div style={{ position: 'relative', zIndex: 2, padding: '40px 40px 60px' }}>
        <svg viewBox="0 0 200 240" width="100%" style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}>
          <defs>
            <linearGradient id="shieldFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>
            <linearGradient id="shieldLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EDE9FE" />
              <stop offset="100%" stopColor="#DDD6FE" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="20" floodColor="#7C3AED" floodOpacity="0.35" />
            </filter>
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="40%" stopColor="white" stopOpacity="0.18" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Shield outer */}
          <path d="M100 8 L180 40 L180 130 Q180 200 100 232 Q20 200 20 130 L20 40 Z"
            fill="url(#shieldFill)" filter="url(#shadow)" />
          {/* Shield inner highlight */}
          <path d="M100 22 L168 50 L168 128 Q168 188 100 218 Q32 188 32 128 L32 50 Z"
            fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          {/* Shimmer */}
          <path d="M100 8 L180 40 L180 130 Q180 200 100 232 Q20 200 20 130 L20 40 Z"
            fill="url(#shimmer)" />
          {/* Lock body */}
          <rect x="75" y="120" width="50" height="42" rx="6" fill="rgba(255,255,255,0.92)" />
          {/* Lock shackle */}
          <path d="M86 120 L86 104 Q86 86 100 86 Q114 86 114 104 L114 120"
            fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="7" strokeLinecap="round" />
          {/* Keyhole circle */}
          <circle cx="100" cy="135" r="7" fill="url(#shieldFill)" />
          <rect x="97" y="137" width="6" height="12" rx="2" fill="url(#shieldFill)" />
          {/* Floating icons */}
          <g transform="translate(148, 55)">
            <rect x="0" y="0" width="28" height="28" rx="6" fill="white" opacity="0.9" />
            <text x="14" y="19" textAnchor="middle" fontSize="14">📄</text>
          </g>
          <g transform="translate(22, 70)">
            <rect x="0" y="0" width="28" height="28" rx="6" fill="white" opacity="0.9" />
            <text x="14" y="19" textAnchor="middle" fontSize="14">🔐</text>
          </g>
          <g transform="translate(155, 140)">
            <rect x="0" y="0" width="28" height="28" rx="6" fill="white" opacity="0.9" />
            <text x="14" y="19" textAnchor="middle" fontSize="14">⛓</text>
          </g>
        </svg>
      </div>
      {/* Particles */}
      {[
        { top: '15%', left: '8%',  size: 7, c: '#A78BFA' },
        { top: '25%', right: '5%', size: 5, c: '#7C3AED' },
        { top: '65%', left: '5%',  size: 4, c: '#C4B5FD' },
        { top: '70%', right: '10%',size: 6, c: '#8B5CF6' },
        { top: '45%', left: '12%', size: 3, c: '#6D28D9' },
      ].map((p, i) => (
        <motion.div key={i}
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          style={{
            position: 'absolute', ...p,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.c,
            boxShadow: `0 0 ${p.size * 3}px ${p.c}80`,
          }}
        />
      ))}
    </div>
  );
}

/* ── System Status Card ─────────────────────────────────── */
function StatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '1.125rem 1.25rem',
        minWidth: 200,
        boxShadow: '0 4px 24px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        marginBottom: '0.875rem', paddingBottom: '0.75rem',
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}60` }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.text3 }}>
          System Status
        </span>
      </div>
      {[
        { icon: '✓', label: 'Blockchain', value: 'Verified',  color: C.green,  iconBg: C.greenDim },
        { icon: '🏫', label: 'Active Centers', value: '—',    color: C.purple, iconBg: C.purpleDim },
        { icon: '📄', label: 'Exams Protected', value: '—',   color: C.cyan,   iconBg: '#E0F2FE' },
        { icon: '🔒', label: 'Security Status', value: 'Secure', color: C.green, iconBg: C.greenDim },
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: item.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', flexShrink: 0,
          }}>{item.icon}</div>
          <div>
            <div style={{ fontSize: '0.68rem', color: C.text3, lineHeight: 1 }}>{item.label}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: item.color, letterSpacing: '-0.02em', lineHeight: 1.4 }}>{item.value}</div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Data ──────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🛡', label: 'AES-256 Encryption',      desc: 'Every examination paper is encrypted before storage and distribution.', iconBg: C.purpleDim, iconColor: C.purple },
  { icon: '🔎', label: 'Forensic Fingerprinting', desc: 'Each downloaded copy receives a unique invisible identifier linked to its examination center.', iconBg: '#E0F2FE', iconColor: C.cyan },
  { icon: '⏰', label: 'Time-Locked Access',      desc: 'Question papers remain inaccessible until the scheduled release time.', iconBg: '#FDF4FF', iconColor: '#A855F7' },
  { icon: '⛓', label: 'Blockchain Audit Chain',  desc: 'Every upload, assignment, download, and unlock event is permanently recorded.', iconBg: C.greenDim, iconColor: C.green },
  { icon: '🕵', label: 'Leak Investigation',      desc: 'Identify the source of leaked examination papers with forensic accuracy.', iconBg: '#FFF1F2', iconColor: '#E11D48' },
  { icon: '👥', label: 'Multi-Center Management', desc: 'Securely manage multiple examination centers with role-based access.', iconBg: '#FFFBEB', iconColor: '#D97706' },
];

const STEPS = [
  { n: '01', icon: '☁', label: 'Upload Examination Paper', desc: 'Administrators securely upload examination papers into the system.' },
  { n: '02', icon: '🔐', label: 'Encryption & Assignment', desc: 'Papers are encrypted and assigned to authorized examination centers.' },
  { n: '03', icon: '⏰', label: 'Timed Release', desc: 'Access remains locked until the approved examination schedule.' },
  { n: '04', icon: '📄', label: 'Secure Distribution', desc: 'Centers receive uniquely fingerprinted copies of examination papers.' },
  { n: '05', icon: '🔍', label: 'Leak Investigation', desc: 'If a paper is leaked, the system identifies the exact source center and audit trail.' },
];

const TAGS = [
  { icon: '🛡', label: 'AES-256 Encryption' },
  { icon: '✓',  label: 'SHA-256 Audit Verification' },
  { icon: '👤', label: 'Role-Based Access Control' },
  { icon: '🔎', label: 'Center-Specific Fingerprinting' },
  { icon: '⏰', label: 'Time-Locked Release Engine' },
  { icon: '⛓', label: 'Blockchain Integrity Validation' },
];

const NAV = ['Features', 'How It Works', 'Security', 'About'];

/* ── Section label ─────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: C.text3, marginBottom: '0.875rem',
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
      fontWeight: 800, letterSpacing: '-0.04em',
      color: C.text1, lineHeight: 1.15, marginBottom: '0.5rem',
    }}>{children}</h2>
  );
}

/* ── Main ──────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const w = useWidth();
  const isMobile = w < 768;
  const isTablet = w < 1024;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text1, fontFamily: "'Inter', -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased', overflowX: 'hidden' }}>

      {/* ─── GLOBAL STYLES ──────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        .nav-link-item { color: #4C3D7A; font-size: 0.875rem; font-weight: 500; transition: color 0.15s; cursor: pointer; }
        .nav-link-item:hover { color: #1A1033; }
        .feat-card { background: #fff; border: 1px solid #E8E4F8; border-radius: 12px; padding: 1.5rem; transition: box-shadow 0.2s, transform 0.2s; cursor: default; }
        .feat-card:hover { box-shadow: 0 8px 32px rgba(124,58,237,0.12); transform: translateY(-2px); }
        .step-circle { transition: box-shadow 0.2s; }
        .step-circle:hover { box-shadow: 0 0 24px rgba(124,58,237,0.25) !important; }
        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; text-align: center; align-items: center; }
          .hero-right { display: none !important; }
          .feat-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-row { flex-wrap: wrap !important; gap: 1.5rem !important; }
          .step-item { min-width: 140px; flex: 1 1 140px; }
          .step-arrow { display: none !important; }
          .tag-bar { gap: 0.75rem 1.5rem !important; }
          .footer-inner { flex-direction: column; text-align: center; gap: 0.5rem; }
          .nav-links { display: none !important; }
          .hero-btns { justify-content: center; }
          .section-pad { padding: 3rem 1.5rem !important; }
          .hero-pad { padding: 6.5rem 1.5rem 3rem !important; }
        }
        @media (max-width: 480px) {
          .feat-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1023px) {
          .hero-right-shield { max-width: 280px !important; }
          .status-card { min-width: 170px !important; }
          .feat-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.borderLight}`,
        height: 60, display: 'flex', alignItems: 'center',
        padding: '0 clamp(1rem, 4vw, 2.5rem)',
        gap: '1.5rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto' }}>
          <div style={{
            width: 30, height: 30,
            background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`,
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', boxShadow: `0 2px 8px rgba(124,58,237,0.35)`,
          }}>🛡</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: C.purple, letterSpacing: '-0.03em' }}>SQ</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: C.text1, letterSpacing: '-0.03em' }}>ExamChain</span>
          </div>
        </div>
        {/* Nav */}
        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          {NAV.map(n => (
            <a key={n} href={`#${n.toLowerCase().replace(/ /g, '-')}`} className="nav-link-item">{n}</a>
          ))}
        </nav>
        {/* CTA */}
        <motion.button
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`,
            color: 'white', border: 'none', borderRadius: 8,
            padding: '0.5rem 1.125rem',
            fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 12px rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            whiteSpace: 'nowrap',
          }}
        >Continue to System →</motion.button>
      </header>

      {/* ─── HERO ───────────────────────────────────────── */}
      <section className="hero-pad" style={{ padding: 'clamp(5rem,10vw,7rem) clamp(1rem,5vw,4rem) clamp(2rem,5vw,4rem)', maxWidth: 1280, margin: '0 auto' }}>
        <div className="hero-grid" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)' }}>

          {/* Left */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16,1,0.3,1] }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: C.purpleDim,
                border: `1px solid rgba(124,58,237,0.2)`,
                borderRadius: 100,
                fontSize: '0.72rem', fontWeight: 600, color: C.purpleText,
                marginBottom: '1.25rem',
              }}>
                <span style={{ fontSize: '0.75rem' }}>🛡</span> Secure. Traceable. Tamper-Proof.
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
                fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.02,
                marginBottom: '0.625rem',
              }}>
                <span style={{ color: C.purple }}>SQ</span>{' '}
                <span style={{ color: C.text1 }}>ExamChain</span>
              </h1>

              <div style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontWeight: 600, color: C.text2, lineHeight: 1.35, letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
                Secure Examination Distribution.
              </div>
              <div style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
                Leak Traceability.{' '}
                <span style={{ color: C.purple }}>Verified Security.</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: C.text3, lineHeight: 1.75, maxWidth: 460, marginBottom: '2rem' }}>
                Protect examination papers with military-grade encryption,
                forensic fingerprinting, time-locked access controls, and
                blockchain-backed audit verification.
              </p>

              {/* Buttons */}
              <div className="hero-btns" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                <motion.button
                  id="landing-cta"
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(124,58,237,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`,
                    color: 'white', border: 'none', borderRadius: 9,
                    padding: '0.75rem 1.625rem',
                    fontSize: '0.9rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '-0.02em',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  }}
                >Continue to System →</motion.button>

                <motion.button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ background: C.purpleDim }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'transparent',
                    color: C.text2, border: `1px solid ${C.border}`, borderRadius: 9,
                    padding: '0.75rem 1.375rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '-0.02em',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '0.875rem' }}>▷</span> Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right — Shield + Status */}
          <div className="hero-right" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="hero-right-shield" style={{ maxWidth: 340, width: '100%' }}>
              <Shield3D />
            </div>
            <div className="status-card">
              <StatusCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED SECURITY LAYERS ───────────────────── */}
      <section id="features" className="section-pad" style={{ background: C.bg2, padding: 'clamp(2.5rem,5vw,4rem) clamp(1rem,5vw,4rem)', borderTop: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <SectionLabel>Trusted Security Layers</SectionLabel>
            </div>
          </Reveal>
          <div className="feat-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1rem',
          }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.07}>
                <div className="feat-card">
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: f.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', marginBottom: '0.875rem',
                  }}>{f.icon}</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text1, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: C.text3, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────── */}
      <section id="how-it-works" className="section-pad" style={{ padding: 'clamp(2.5rem,5vw,4.5rem) clamp(1rem,5vw,4rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <SectionLabel>Workflow</SectionLabel>
              <SectionTitle>
                How{' '}<span style={{ color: C.purple }}>SQ ExamChain</span>{' '}Works
              </SectionTitle>
            </div>
          </Reveal>

          <div className="steps-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
            {/* Background line */}
            <div style={{
              position: 'absolute', top: 36, left: '7%', right: '7%',
              height: 1, background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
              display: isMobile ? 'none' : 'block',
            }} />
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                <Reveal delay={i * 0.08} style={{ flex: 1, minWidth: 0 }}>
                  <div className="step-item" style={{ textAlign: 'center', padding: '0 0.5rem', position: 'relative', zIndex: 1 }}>
                    <div className="step-circle" style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: i === 0 ? `linear-gradient(135deg, ${C.purple}, #5B21B6)` : C.bg,
                      border: `1.5px solid ${i === 0 ? 'transparent' : C.border}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1rem',
                      boxShadow: i === 0 ? '0 4px 20px rgba(124,58,237,0.4)' : '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{s.icon}</span>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, color: i === 0 ? 'rgba(255,255,255,0.7)' : C.text4,
                        marginTop: 3, letterSpacing: '0.04em',
                      }}>{s.n}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text1, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.72rem', color: C.text3, lineHeight: 1.5, padding: '0 0.25rem' }}>{s.desc}</div>
                  </div>
                </Reveal>
                {i < STEPS.length - 1 && (
                  <div className="step-arrow" style={{
                    flexShrink: 0, width: 32, paddingTop: 24,
                    textAlign: 'center', color: C.border, fontSize: '1.25rem', fontWeight: 300,
                  }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECURITY ───────────────────────────────────── */}
      <section id="security" className="section-pad" style={{ background: C.bg2, padding: 'clamp(2.5rem,5vw,4rem) clamp(1rem,5vw,4rem)', borderTop: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <SectionLabel>Enterprise Grade</SectionLabel>
            <SectionTitle>Military-grade security</SectionTitle>
            <p style={{ fontSize: '0.875rem', color: C.text3, marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Every layer of SQ ExamChain is engineered for maximum protection, auditability, and accountability.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, overflow: 'hidden', textAlign: 'left',
              boxShadow: '0 4px 24px rgba(124,58,237,0.07)',
            }}>
              {[
                { label: 'AES-256 Encryption',             val: 'Military-grade', color: C.green },
                { label: 'SHA-256 Audit Chain',            val: 'Immutable',      color: C.purple },
                { label: 'Center-Specific Fingerprinting', val: 'Deterministic',  color: C.cyan },
                { label: 'Role-Based Access Control',      val: 'Enforced',       color: '#D97706' },
              ].map((s, i, arr) => (
                <motion.div key={s.label}
                  whileHover={{ background: C.bg3 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.375rem',
                    borderBottom: i < arr.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: s.color, boxShadow: `0 0 6px ${s.color}80`,
                    }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: C.text2 }}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, color: s.color,
                      background: `${s.color}15`, border: `1px solid ${s.color}30`,
                      padding: '0.15rem 0.55rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{s.val}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: C.green,
                      background: `${C.green}12`, border: `1px solid ${C.green}30`,
                      padding: '0.15rem 0.5rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>Active</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(124,58,237,0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: '2.5rem',
                background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`,
                color: 'white', border: 'none', borderRadius: 9,
                padding: '0.825rem 2rem',
                fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                letterSpacing: '-0.02em',
                boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              }}
            >Continue to System →</motion.button>
          </Reveal>
        </div>
      </section>

      {/* ─── TAG BAR ─────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${C.borderLight}`, background: C.bg,
        padding: '1rem clamp(1rem,4vw,4rem)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexWrap: 'wrap', gap: '0.5rem 1.75rem',
      }}>
        {TAGS.map(t => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4,
              background: C.purpleDim, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', flexShrink: 0,
            }}>{t.icon}</div>
            <span style={{ fontSize: '0.72rem', color: C.text3, fontWeight: 500, whiteSpace: 'nowrap' }}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer id="about" style={{
        borderTop: `1px solid ${C.borderLight}`, background: C.bg,
        padding: '1.25rem clamp(1rem,4vw,4rem)',
      }}>
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 22, height: 22,
              background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`,
              borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem',
            }}>🛡</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: C.purple, letterSpacing: '-0.02em' }}>SQ</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.text1, letterSpacing: '-0.02em' }}>ExamChain</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: C.text4 }}>Secure today. Trace tomorrow. Trust always.</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: C.text3 }}>
            Built by{' '}
            <span style={{ color: C.purple, fontWeight: 700, cursor: 'pointer' }}>SemiQuantum</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: C.text4, fontWeight: 500 }}>Version 2.0</div>
        </div>
      </footer>

    </div>
  );
}
