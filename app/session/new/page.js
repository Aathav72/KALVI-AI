"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowRight, GraduationCap, BookOpen, Languages } from 'lucide-react';

const LANGUAGES = [
  { value: 'en', label: '🇮🇳 English' },
  { value: 'hi', label: '🇮🇳 Hindi (हिन्दी)' },
  { value: 'ta', label: '🇮🇳 Tamil (தமிழ்)' },
  { value: 'te', label: '🇮🇳 Telugu (తెలుగు)' },
  { value: 'kn', label: '🇮🇳 Kannada (ಕನ್ನಡ)' },
  { value: 'ml', label: '🇮🇳 Malayalam (മലയാളം)' },
  { value: 'mr', label: '🇮🇳 Marathi (मराठी)' },
  { value: 'bn', label: '🇮🇳 Bengali (বাংলা)' },
  { value: 'gu', label: '🇮🇳 Gujarati (ગુજરાતી)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'zh', label: '中文' },
];

const SUBJECTS = [
  'Science', 'Mathematics', 'History', 'Geography',
  'English', 'Computer Science', 'Social Studies',
  'Hindi', 'Environmental Studies',
];

const WOOD_CARD = {
  background: '#172E24',
  border: '8px solid #8B5A2B',
  borderTopColor: '#A0703A',
  borderLeftColor: '#A0703A',
  borderBottomColor: '#5E3A1A',
  borderRightColor: '#5E3A1A',
  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 0 2px #3D1F0A, 0 16px 40px rgba(0,0,0,0.6)',
  borderRadius: '4px',
};

const SELECT_STYLE = {
  background: 'rgba(23,46,36,0.9)',
  border: '1px solid #2E6B52',
  color: '#F8F8F2',
  outline: 'none',
  fontFamily: 'var(--font-caveat), Caveat, cursive',
  letterSpacing: '0.04em',
  fontSize: '1.05rem',
  cursor: 'pointer',
};

export default function NewSession() {
  const [grade,    setGrade]    = useState('5');
  const [subject,  setSubject]  = useState('Science');
  const [language, setLanguage] = useState('en');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleStartSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Please log in first.'); router.push('/'); return; }

      const { data, error } = await supabase
        .from('sessions')
        .insert([{ teacher_id: user.id, grade, subject, language, question: '', ai_answer: '', quiz: [] }])
        .select()
        .single();

      if (error) throw error;
      router.push(`/session/${data.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to start session');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden animate-fade-in">

      {/* Deco doodles */}
      <div className="absolute top-12 left-8 opacity-10 hidden lg:block animate-chalk-float pointer-events-none select-none">
        <svg width="120" height="120" viewBox="0 0 100 100" stroke="#F8F8F2" fill="none" strokeWidth="1.5">
          <text x="4" y="46" fontSize="14" fontFamily="Caveat,cursive" fill="#F8F8F2">E = mc²</text>
          <ellipse cx="50" cy="68" rx="32" ry="10" transform="rotate(35,50,68)" />
          <ellipse cx="50" cy="68" rx="32" ry="10" transform="rotate(-35,50,68)" />
          <circle cx="50" cy="68" r="4" fill="#F8F8F2" />
        </svg>
      </div>
      <div className="absolute bottom-16 right-12 opacity-10 hidden lg:block animate-chalk-float-slow pointer-events-none select-none">
        <svg width="130" height="130" viewBox="0 0 100 100" stroke="#F8E16C" fill="none" strokeWidth="1.5">
          <path d="M15,85 L85,85 L15,15 Z" />
          <text x="28" y="72" fontSize="12" fontFamily="Caveat,cursive" fill="#F8E16C">90°</text>
        </svg>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        {/* ── Setup Form Card ── */}
        <div className="relative" style={WOOD_CARD}>
          {/* Corner pins */}
          {[['top-2','left-2'],['top-2','right-2'],['bottom-2','left-2'],['bottom-2','right-2']].map(([t,l], i) => (
            <div key={i} className={`absolute ${t} ${l} w-3 h-3 rounded-full`}
              style={{ background: '#5E3A1A', border: '1px solid #A0703A', zIndex: 5 }} />
          ))}
          <div className="absolute inset-0 board-ruled opacity-60 pointer-events-none" />

          <div className="relative z-10 p-8 space-y-6">
            <div className="space-y-1">
              <span className="font-handwritten text-sm tracking-widest" style={{ color: '#7FD6FF' }}>Step 1 of 2</span>
              <h1
                className="font-display text-3xl font-bold tracking-wider"
                style={{ color: '#F8E16C', textShadow: '0 0 10px rgba(248,225,108,0.4), 1px 1px 0 rgba(0,0,0,0.5)' }}
              >
                ✏️ Session Setup
              </h1>
              <p className="font-handwritten text-lg tracking-wider" style={{ color: 'rgba(248,248,242,0.6)' }}>
                Configure your blackboard session
              </p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-5">
              {/* Grade */}
              <div className="flex flex-col gap-2">
                <label className="font-handwritten text-lg tracking-widest flex items-center gap-2" style={{ color: '#FF9CCF' }} htmlFor="session-grade">
                  <GraduationCap size={16} /> Class (Grade)
                </label>
                <select
                  id="session-grade"
                  className="w-full px-4 py-2.5 rounded transition-all duration-200"
                  style={SELECT_STYLE}
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#F8E16C'; e.target.style.boxShadow = '0 0 0 2px rgba(248,225,108,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#2E6B52'; e.target.style.boxShadow = 'none'; }}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1} style={{ background: '#172E24' }}>Grade {i+1}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label className="font-handwritten text-lg tracking-widest flex items-center gap-2" style={{ color: '#FF9CCF' }} htmlFor="session-subject">
                  <BookOpen size={16} /> Subject
                </label>
                <select
                  id="session-subject"
                  className="w-full px-4 py-2.5 rounded transition-all duration-200"
                  style={SELECT_STYLE}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#F8E16C'; e.target.style.boxShadow = '0 0 0 2px rgba(248,225,108,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#2E6B52'; e.target.style.boxShadow = 'none'; }}
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s} style={{ background: '#172E24' }}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div className="flex flex-col gap-2">
                <label className="font-handwritten text-lg tracking-widest flex items-center gap-2" style={{ color: '#FF9CCF' }} htmlFor="session-language">
                  <Languages size={16} /> Teaching Language
                </label>
                <select
                  id="session-language"
                  className="w-full px-4 py-2.5 rounded transition-all duration-200"
                  style={SELECT_STYLE}
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#F8E16C'; e.target.style.boxShadow = '0 0 0 2px rgba(248,225,108,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#2E6B52'; e.target.style.boxShadow = 'none'; }}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value} style={{ background: '#172E24' }}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                id="start-session-btn"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded font-display text-lg tracking-widest flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
                  border: '2px solid #3D1F0A',
                  color: '#F8F8F2',
                  boxShadow: '3px 3px 0 #3D1F0A, inset 0 1px 0 rgba(255,255,255,0.15)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                {loading ? 'Starting…' : <><span>🎓 Start Teaching Session</span><ArrowRight size={18} /></>}
              </button>
            </form>
          </div>

          {/* Chalk tray */}
          <div style={{ position:'absolute', bottom:'-14px', left:'-8px', right:'-8px', height:'10px', background:'linear-gradient(to bottom,#A0703A,#8B5A2B,#5E3A1A)', borderBottom:'2px solid #3D1F0A', boxShadow:'0 6px 10px rgba(0,0,0,0.5)', borderRadius:'0 0 4px 4px', zIndex:20 }} />
          <div style={{ position:'absolute', bottom:'-11px', left:'15%', width:'28px', height:'7px', background:'#FAF6E9', borderRadius:'4px', transform:'rotate(-8deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.4)', zIndex:25 }} />
          <div style={{ position:'absolute', bottom:'-11px', left:'38%', width:'32px', height:'7px', background:'#F8E16C', borderRadius:'4px', transform:'rotate(5deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.4)', zIndex:25 }} />
          <div style={{ position:'absolute', bottom:'-11px', left:'62%', width:'28px', height:'7px', background:'#7FD6FF', borderRadius:'4px', transform:'rotate(-4deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.4)', zIndex:25 }} />
        </div>

        {/* ── How It Works Card ── */}
        <div
          className="flex flex-col justify-between rounded p-8 space-y-6 relative overflow-hidden"
          style={{ background: 'rgba(23,46,36,0.7)', border: '1px solid #2E6B52', backdropFilter: 'blur(4px)', borderRadius: '4px' }}
        >
          <div className="absolute inset-0 board-grid opacity-30 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <h2
              className="font-display text-2xl font-bold tracking-wide flex items-center gap-2"
              style={{ color: '#7FD6FF', textShadow: '0 0 8px rgba(127,214,255,0.35)' }}
            >
              ✨ How it works
            </h2>
            <p className="font-handwritten text-lg leading-relaxed tracking-wide" style={{ color: 'rgba(248,248,242,0.6)' }}>
              KalviAI turns your spoken or typed questions into full visual classroom materials instantly.
            </p>
          </div>

          <div className="relative z-10 space-y-5 flex-1 my-2">
            {[
              { num: '1', color: '#7FD6FF', title: 'Ask & Explain', desc: 'Turn on the mic and explain a topic or ask a question in your local language — or type it directly.' },
              { num: '2', color: '#FF9CCF', title: 'AI Board Generator', desc: 'Groq Whisper transcribes your speech, then AI generates structured explanations with worked examples.' },
              { num: '3', color: '#F8E16C', title: 'Projector Pop-Quizzes', desc: 'Interactive quizzes are cast automatically to the Projector Screen for live student participation.' },
            ].map(step => (
              <div key={step.num} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold shrink-0 mt-0.5"
                  style={{ border: `1px solid ${step.color}`, background: `${step.color}15`, color: step.color }}
                >
                  {step.num}
                </div>
                <div className="space-y-0.5">
                  <p className="font-display text-sm tracking-wide" style={{ color: '#F8F8F2' }}>{step.title}</p>
                  <p className="font-body text-xs leading-relaxed" style={{ color: 'rgba(248,248,242,0.6)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 pt-4" style={{ borderTop: '1px solid rgba(248,248,242,0.08)' }}>
            <p className="font-handwritten text-lg italic tracking-wider text-center" style={{ color: '#F8E16C' }}>
              &ldquo;The art of teaching is the art of assisting discovery.&rdquo;
            </p>
            <p className="text-xs text-center mt-1 font-body" style={{ color: 'rgba(248,248,242,0.4)' }}>— Mark Van Doren</p>
          </div>
        </div>
      </div>
    </div>
  );
}
