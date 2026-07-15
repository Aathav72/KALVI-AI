"use client";
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';

/* ── Premium Classroom Blackboard Frame ── */
function ProjectorBoard({ children }) {
  return (
    <div
      className="min-h-screen flex items-stretch p-4 md:p-8"
      style={{ background: '#172E24' }}
    >
      {/* Wood outer frame */}
      <div
        className="w-full flex flex-col items-center justify-center text-center flex-1 relative overflow-hidden select-none animate-fade-in"
        style={{
          background: '#1F4D3A',
          border: '10px solid #8B5A2B',
          borderTopColor: '#A0703A',
          borderLeftColor: '#A0703A',
          borderBottomColor: '#5E3A1A',
          borderRightColor: '#5E3A1A',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.55), 0 0 0 2px #3D1F0A, 0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Board texture grid */}
        <div className="absolute inset-0 board-grid opacity-30 pointer-events-none" />

        {/* Eraser smudge light glows */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.018) 0%, transparent 45%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 78% 70%, rgba(255,255,255,0.015) 0%, transparent 50%)' }} />

        {/* Chalk tray */}
        <div
          style={{
            position: 'absolute', bottom: '-12px', left: '-10px', right: '-10px',
            height: '11px',
            background: 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
            borderBottom: '3px solid #3D1F0A',
            boxShadow: '0 8px 14px rgba(0,0,0,0.6)',
            zIndex: 30,
          }}
        />
        {/* Chalk sticks */}
        <div style={{ position:'absolute', bottom:'-9px', left:'12%', width:'30px', height:'8px', background:'#FAF6E9', borderRadius:'4px', transform:'rotate(10deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.5)', zIndex:35 }} />
        <div style={{ position:'absolute', bottom:'-9px', left:'15%', width:'30px', height:'8px', background:'#FAF6E9', borderRadius:'4px', transform:'rotate(-6deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.5)', zIndex:35 }} />
        <div style={{ position:'absolute', bottom:'-9px', left:'33%', width:'34px', height:'8px', background:'#F8E16C', borderRadius:'4px', transform:'rotate(-14deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.5)', zIndex:35 }} />
        <div style={{ position:'absolute', bottom:'-9px', left:'53%', width:'30px', height:'8px', background:'#FF9CCF', borderRadius:'4px', transform:'rotate(5deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.5)', zIndex:35 }} />
        <div style={{ position:'absolute', bottom:'-9px', left:'73%', width:'34px', height:'8px', background:'#7FD6FF', borderRadius:'4px', transform:'rotate(18deg)', boxShadow:'0 2px 4px rgba(0,0,0,0.5)', zIndex:35 }} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl px-6 md:px-12 py-8 flex flex-col items-center justify-center space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Projector({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Initial fetch
    const fetchSession = async () => {
      const { data } = await supabase.from('sessions').select('*').eq('id', id).single();
      if (data) setSession(data);
    };
    fetchSession();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel(`session-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${id}` },
        (payload) => {
          setSession(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  /* ── 1. Loading Projector screen ── */
  if (!session) {
    return (
      <ProjectorBoard>
        <p
          className="font-display text-3xl sm:text-4xl tracking-wider animate-pulse"
          style={{ color: 'rgba(248,248,242,0.45)' }}
        >
          ⌛ Loading projector…
        </p>
      </ProjectorBoard>
    );
  }

  /* ── 2. Waiting for Teacher question screen ── */
  if (!session.question) {
    return (
      <ProjectorBoard>
        <div className="space-y-5 animate-fade-in">
          <p
            className="font-display text-4xl sm:text-5xl md:text-6xl tracking-widest animate-pulse chalk-glow"
            style={{ color: 'rgba(248,248,242,0.55)' }}
          >
            Waiting for teacher…
          </p>
          <p
            className="font-handwritten text-2xl sm:text-3xl tracking-widest"
            style={{ color: 'rgba(168,181,160,0.8)' }}
          >
            ✏️ Ask your question aloud or type it to begin
          </p>
        </div>
      </ProjectorBoard>
    );
  }

  /* ── 3. Active classroom screen ── */
  return (
    <ProjectorBoard>
      {/* Large chalk-rendered Question */}
      <h1
        className="font-display text-3xl sm:text-5xl leading-tight max-w-5xl"
        style={{
          color: '#F8E16C',
          textShadow: '0 0 12px rgba(248,225,108,0.4), 1px 1px 0 rgba(0,0,0,0.5)',
          letterSpacing: '0.04em',
        }}
      >
        &ldquo;{session.question}&rdquo;
      </h1>

      {/* Explanation Box Slate */}
      {session.ai_answer && (
        <div
          className="max-w-4xl w-full p-8 md:p-10 text-left font-body text-lg sm:text-2xl leading-relaxed animate-fade-in"
          style={{
            background: 'rgba(23,46,36,0.6)',
            border: '2px dashed #2E6B52',
            borderRadius: '4px',
            color: '#F8F8F2',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {session.ai_answer}
        </div>
      )}

      {/* Pop Quiz Section */}
      {session.quiz && session.quiz.length > 0 && (
        <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in space-y-6">
          <h2
            className="font-display text-2xl sm:text-4xl tracking-wider"
            style={{ color: '#FF9CCF', textShadow: '0 0 10px rgba(255,156,207,0.4), 1px 1px 0 rgba(0,0,0,0.4)' }}
          >
            📝 Pop Quiz!
          </h2>
          <p
            className="font-handwritten text-xl sm:text-3xl tracking-wider text-center max-w-3xl"
            style={{ color: '#F8F8F2' }}
          >
            {session.quiz[0].question}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {session.quiz[0].options.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 cursor-default transition-all duration-300"
                style={{
                  padding: '1.25rem 1.5rem',
                  background: 'rgba(23,46,36,0.6)',
                  border: '2px dashed #2E6B52',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7FD6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2E6B52'; }}
              >
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center font-display text-lg flex-shrink-0"
                  style={{
                    border: '2px solid #F8E16C',
                    background: 'rgba(248,225,108,0.1)',
                    color: '#F8E16C',
                    textShadow: '0 0 6px rgba(248,225,108,0.4)',
                    minWidth: '2.75rem',
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span
                  className="font-handwritten text-xl sm:text-2xl text-left"
                  style={{ color: '#F8F8F2', letterSpacing: '0.03em' }}
                >
                  {opt}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ProjectorBoard>
  );
}
