"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.session) {
          router.push('/dashboard');
          return;
        } else {
          alert("Signup successful! Please check your email inbox to confirm your account, then log in.");
          setIsLogin(true);
          setLoading(false);
          return;
        }
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[92vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden animate-fade-in">

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
      <div className="text-center mb-10 space-y-3">
        <div className="flex items-center justify-center gap-3 mb-2">
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
          AI Classroom Copilot for Indian Teachers · Classes 1–12
        </p>
        {/* Chalk divider */}
        <div className="chalk-divider max-w-sm mx-auto mt-3" />
      </div>

      {/* Auth Card — mini chalkboard with wood frame */}
      <div
        className="w-full max-w-md relative"
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

        <div className="relative z-10 p-8">
          {/* Card heading */}
          <h2
            className="font-display text-2xl sm:text-3xl font-bold text-center mb-6 tracking-wider"
            style={{ color: '#F8E16C', textShadow: '0 0 8px rgba(248,225,108,0.4), 1px 1px 0 rgba(0,0,0,0.4)' }}
          >
            {isLogin ? '✏️ Teacher Login' : '🎓 Register'}
          </h2>

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

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label
                className="font-handwritten text-lg tracking-widest"
                style={{ color: '#FF9CCF', textShadow: '0 0 6px rgba(255,156,207,0.3)' }}
                htmlFor="auth-email"
              >
                📧 Email Address
              </label>
              <input
                type="email"
                id="auth-email"
                className="w-full px-4 py-3 rounded font-handwritten text-lg tracking-wide transition-all duration-200"
                style={{
                  background: 'rgba(23,46,36,0.9)',
                  border: '1px solid #2E6B52',
                  color: '#F8F8F2',
                  outline: 'none',
                }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                required
                onFocus={e => { e.target.style.borderColor = '#F8E16C'; e.target.style.boxShadow = '0 0 0 2px rgba(248,225,108,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#2E6B52'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="font-handwritten text-lg tracking-widest"
                style={{ color: '#FF9CCF', textShadow: '0 0 6px rgba(255,156,207,0.3)' }}
                htmlFor="auth-password"
              >
                🔒 Password
              </label>
              <input
                type="password"
                id="auth-password"
                className="w-full px-4 py-3 rounded font-handwritten text-lg tracking-wide transition-all duration-200"
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
                onFocus={e => { e.target.style.borderColor = '#F8E16C'; e.target.style.boxShadow = '0 0 0 2px rgba(248,225,108,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#2E6B52'; e.target.style.boxShadow = 'none'; }}
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
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              {loading ? '⌛ Processing…' : isLogin ? '🎯 Login →' : '🎓 Sign Up →'}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
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
      <div className="mt-14 flex flex-wrap items-center justify-center gap-4 max-w-lg">
        {[
          ['🎤', 'Voice Input'],
          ['🤖', 'AI Explanations'],
          ['📝', 'Auto Quiz'],
          ['🌐', 'Multilingual'],
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
