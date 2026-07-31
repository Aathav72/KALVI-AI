"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { saveUserProfile } from '@/lib/profile';
import { ShieldCheck, UserCheck, GraduationCap, BookOpen } from 'lucide-react';

const SUBJECTS = [
  'Science', 'Mathematics', 'History', 'Geography',
  'English', 'Computer Science', 'Social Studies',
  'Hindi', 'Environmental Studies',
];

export default function Home() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role,     setRole]     = useState('teacher'); // 'teacher' or 'headmaster'
  const [subject,  setSubject]  = useState('Science');
  const [grade,    setGrade]    = useState('5');
  const [isLogin,  setIsLogin]  = useState(true);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Save/Sync profile role if present
        const user = data.user;
        const profile = await saveUserProfile(user, { full_name: fullName, role, subject, grade });

        if (profile?.role === 'headmaster' || role === 'headmaster') {
          router.push('/headmaster');
        } else {
          router.push('/dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role, subject, grade }
          }
        });
        if (error) throw error;

        if (data?.user) {
          await saveUserProfile(data.user, { full_name: fullName, role, subject, grade });
        }

        if (data?.session) {
          if (role === 'headmaster') {
            router.push('/headmaster');
          } else {
            router.push('/dashboard');
          }
          return;
        } else {
          alert("Signup successful! Please check your email inbox to confirm your account, then log in.");
          setIsLogin(true);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Instant Quick Demo Logins for easy testing
  const handleDemoLogin = async (demoRole) => {
    setLoading(true);
    const demoUser = demoRole === 'headmaster' 
      ? {
          id: 'hm-demo-1',
          email: 'headmaster@school.edu',
          full_name: 'Dr. R. Ramanathan (Head Master)',
          role: 'headmaster',
          subject: 'Administration',
          grade: 'All Classes',
        }
      : {
          id: 'teacher-demo-1',
          email: 'anitha.sharma@school.edu',
          full_name: 'Dr. Anitha Sharma',
          role: 'teacher',
          subject: 'Science',
          grade: '5',
        };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kalvi_demo_user', JSON.stringify(demoUser));
    }

    setTimeout(() => {
      if (demoRole === 'headmaster') {
        router.push('/headmaster');
      } else {
        router.push('/dashboard');
      }
    }, 400);
  };

  return (
    <div className="min-h-[92vh] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden animate-fade-in">

      {/* Background deco doodles */}
      <div className="absolute top-16 left-10 opacity-10 hidden lg:block animate-chalk-float pointer-events-none select-none">
        <svg width="120" height="120" viewBox="0 0 100 100" stroke="#F8F8F2" fill="none" strokeWidth="1.5">
          <text x="4" y="46" fontSize="14" fontFamily="Caveat,cursive" fill="#F8F8F2">E = mc²</text>
          <ellipse cx="50" cy="65" rx="30" ry="9" transform="rotate(30,50,65)" />
          <ellipse cx="50" cy="65" rx="30" ry="9" transform="rotate(-30,50,65)" />
          <circle cx="50" cy="65" r="3.5" fill="#F8F8F2" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-14 opacity-10 hidden lg:block animate-chalk-float-slow pointer-events-none select-none">
        <svg width="130" height="130" viewBox="0 0 100 100" stroke="#F8E16C" fill="none" strokeWidth="1.5">
          <path d="M20,80 L80,80 L20,20 Z" />
          <text x="30" y="65" fontSize="12" fontFamily="Caveat,cursive" fill="#F8E16C">90°</text>
        </svg>
      </div>
      <div className="absolute top-1/3 right-8 opacity-10 hidden xl:block animate-chalk-float-slower pointer-events-none select-none">
        <svg width="110" height="110" viewBox="0 0 100 100" stroke="#7FD6FF" fill="none" strokeWidth="1.5">
          <path d="M50,15 A25,25 0 0,1 75,40 C75,55 60,60 60,70 L40,70 C40,60 25,55 25,40 A25,25 0 0,1 50,15Z" />
          <path d="M40,75 L60,75 M43,80 L57,80" />
        </svg>
      </div>

      {/* Hero */}
      <div className="text-center mb-8 space-y-2">
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-5xl">📚</span>
        </div>
        <h1
          className="font-display text-5xl sm:text-6xl font-bold tracking-wider chalk-glow"
          style={{ color: '#F8E16C', textShadow: '0 0 16px rgba(248,225,108,0.5), 2px 2px 0 rgba(0,0,0,0.5)' }}
        >
          KalviAI
        </h1>
        <p
          className="font-handwritten text-xl sm:text-2xl tracking-widest"
          style={{ color: 'rgba(248,248,242,0.7)' }}
        >
          AI Classroom Copilot & Head Master Management System
        </p>
        <div className="chalk-divider max-w-sm mx-auto mt-2" />
      </div>

      {/* Auth Card — mini chalkboard with wood frame */}
      <div
        className="w-full max-w-lg relative"
        style={{
          background: '#172E24',
          border: '8px solid #8B5A2B',
          borderTopColor: '#A0703A',
          borderLeftColor: '#A0703A',
          borderBottomColor: '#5E3A1A',
          borderRightColor: '#5E3A1A',
          boxShadow: 'inset 0 0 24px rgba(0,0,0,0.5), 0 0 0 2px #3D1F0A, 0 20px 48px rgba(0,0,0,0.6)',
          borderRadius: '4px',
        }}
      >
        {/* Board texture inside card */}
        <div className="absolute inset-0 board-ruled opacity-70 pointer-events-none rounded" />

        <div className="relative z-10 p-6 sm:p-8">
          
          {/* Role Selection Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6 p-1 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2E6B52' }}>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2.5 px-3 rounded font-display text-sm sm:text-base tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${role === 'teacher' ? 'shadow-md' : 'opacity-60'}`}
              style={{
                background: role === 'teacher' ? 'linear-gradient(to bottom, #A0703A, #8B5A2B)' : 'transparent',
                color: role === 'teacher' ? '#F8E16C' : '#F8F8F2',
                border: role === 'teacher' ? '1px solid #3D1F0A' : 'none',
              }}
            >
              <span>✏️ Teacher Login</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('headmaster')}
              className={`flex-1 py-2.5 px-3 rounded font-display text-sm sm:text-base tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${role === 'headmaster' ? 'shadow-md' : 'opacity-60'}`}
              style={{
                background: role === 'headmaster' ? 'linear-gradient(to bottom, #A0703A, #8B5A2B)' : 'transparent',
                color: role === 'headmaster' ? '#F8E16C' : '#F8F8F2',
                border: role === 'headmaster' ? '1px solid #3D1F0A' : 'none',
              }}
            >
              <span>👑 Head Master Login</span>
            </button>
          </div>

          <h2
            className="font-display text-2xl sm:text-3xl font-bold text-center mb-6 tracking-wider"
            style={{ color: '#F8E16C', textShadow: '0 0 8px rgba(248,225,108,0.4), 1px 1px 0 rgba(0,0,0,0.4)' }}
          >
            {isLogin ? (role === 'headmaster' ? '👑 Head Master Portal Login' : '✏️ Teacher Login') : '🎓 Create Account'}
          </h2>

          {/* Quick Demo Login Bar */}
          <div className="mb-6 p-3 rounded text-center space-y-2" style={{ background: 'rgba(248,225,108,0.08)', border: '1px stroke rgba(248,225,108,0.25)' }}>
            <p className="font-handwritten text-sm tracking-wide" style={{ color: '#F8E16C' }}>
              🚀 Quick Demo Access (1-Click Test):
            </p>
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => handleDemoLogin('headmaster')}
                className="px-3 py-1.5 rounded font-display text-xs tracking-wider transition-all duration-200 hover:scale-105"
                style={{ background: '#F8E16C', color: '#172E24', fontWeight: 'bold' }}
              >
                👑 Demo Login as Head Master
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('teacher')}
                className="px-3 py-1.5 rounded font-display text-xs tracking-wider transition-all duration-200 hover:scale-105"
                style={{ background: '#7FD6FF', color: '#172E24', fontWeight: 'bold' }}
              >
                ✏️ Demo Login as Teacher
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 p-3 rounded font-handwritten text-lg tracking-wide text-center animate-fade-in"
              style={{
                background: 'rgba(255,156,207,0.1)',
                border: '1px solid rgba(255,156,207,0.4)',
                color: '#FF9CCF',
                textShadow: '0 0 6px rgba(255,156,207,0.3)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="font-handwritten text-base tracking-widest" style={{ color: '#FF9CCF' }} htmlFor="auth-name">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  id="auth-name"
                  className="w-full px-4 py-2.5 rounded font-handwritten text-lg tracking-wide"
                  style={{ background: 'rgba(23,46,36,0.9)', border: '1px solid #2E6B52', color: '#F8F8F2', outline: 'none' }}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={role === 'headmaster' ? 'Dr. R. Ramanathan' : 'Dr. Anitha Sharma'}
                  required={!isLogin}
                />
              </div>
            )}

            {!isLogin && role === 'teacher' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-handwritten text-base tracking-widest" style={{ color: '#FF9CCF' }} htmlFor="auth-subject">
                    📖 Primary Subject
                  </label>
                  <select
                    id="auth-subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded font-handwritten text-base"
                    style={{ background: 'rgba(23,46,36,0.9)', border: '1px solid #2E6B52', color: '#F8F8F2' }}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-handwritten text-base tracking-widest" style={{ color: '#FF9CCF' }} htmlFor="auth-grade">
                    🎓 Standard (Grade)
                  </label>
                  <select
                    id="auth-grade"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded font-handwritten text-base"
                    style={{ background: 'rgba(23,46,36,0.9)', border: '1px solid #2E6B52', color: '#F8F8F2' }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={`${i+1}`}>Grade {i+1}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                className="font-handwritten text-base tracking-widest"
                style={{ color: '#FF9CCF', textShadow: '0 0 6px rgba(255,156,207,0.3)' }}
                htmlFor="auth-email"
              >
                📧 Email Address
              </label>
              <input
                type="email"
                id="auth-email"
                className="w-full px-4 py-2.5 rounded font-handwritten text-lg tracking-wide transition-all duration-200"
                style={{
                  background: 'rgba(23,46,36,0.9)',
                  border: '1px solid #2E6B52',
                  color: '#F8F8F2',
                  outline: 'none',
                }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'headmaster' ? 'headmaster@school.edu' : 'teacher@school.edu'}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="font-handwritten text-base tracking-widest"
                style={{ color: '#FF9CCF', textShadow: '0 0 6px rgba(255,156,207,0.3)' }}
                htmlFor="auth-password"
              >
                🔒 Password
              </label>
              <input
                type="password"
                id="auth-password"
                className="w-full px-4 py-2.5 rounded font-handwritten text-lg tracking-wide transition-all duration-200"
                style={{
                  background: 'rgba(23,46,36,0.9)',
                  border: '1px solid #2E6B52',
                  color: '#F8F8F2',
                  outline: 'none',
                }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="auth-submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded font-display text-lg tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(248,225,108,0.3)'
                  : 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
                border: '2px solid #3D1F0A',
                color: '#F8F8F2',
                boxShadow: '3px 3px 0 #3D1F0A, inset 0 1px 0 rgba(255,255,255,0.15)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {loading ? '⌛ Processing…' : isLogin ? (role === 'headmaster' ? '👑 Head Master Login →' : '🎯 Teacher Login →') : '🎓 Register Account →'}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-5">
            <button
              id="auth-toggle"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="font-handwritten text-lg tracking-wide transition-all duration-200 underline underline-offset-4"
              style={{ color: '#7FD6FF', textShadow: '0 0 6px rgba(127,214,255,0.3)', background: 'none', border: 'none' }}
            >
              {isLogin ? "Don't have an account? Sign up ✏️" : "Already have an account? Login →"}
            </button>
          </div>
        </div>

        {/* Chalk tray */}
        <div style={{
          position: 'absolute', bottom: '-14px', left: '-8px', right: '-8px',
          height: '10px',
          background: 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
          borderBottom: '2px solid #3D1F0A',
          boxShadow: '0 6px 12px rgba(0,0,0,0.5)',
          zIndex: 20, borderRadius: '0 0 4px 4px',
        }} />
        {/* Chalk sticks */}
        <div style={{ position:'absolute', bottom:'-11px', left:'18%', width:'28px', height:'7px', background:'#FAF6E9', borderRadius:'4px', transform:'rotate(-8deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.4)', zIndex:25 }} />
        <div style={{ position:'absolute', bottom:'-11px', left:'40%', width:'32px', height:'7px', background:'#F8E16C', borderRadius:'4px', transform:'rotate(6deg)',  boxShadow:'0 2px 4px rgba(0,0,0,0.4)', zIndex:25 }} />
        <div style={{ position:'absolute', bottom:'-11px', left:'62%', width:'28px', height:'7px', background:'#FF9CCF', borderRadius:'4px', transform:'rotate(-5deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.4)', zIndex:25 }} />
      </div>

      {/* Feature chips */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 max-w-lg">
        {[
          ['👑', 'Head Master Portal'],
          ['👩‍🏫', 'Teacher Roster'],
          ['🎤', 'Voice Input'],
          ['🤖', 'AI Explanations'],
          ['📝', 'Auto Quiz'],
          ['📊', 'Live Projector'],
        ].map(([icon, label]) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded font-handwritten text-base tracking-wide"
            style={{
              background: 'rgba(23,46,36,0.7)',
              border: '1px solid #2E6B52',
              color: 'rgba(248,248,242,0.8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
