"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Clock, ExternalLink, BookOpen, Languages, Sparkles } from 'lucide-react';

const LANG_LABELS = {
  en: 'English', hi: 'हिन्दी', ta: 'தமிழ்', te: 'తెలుగు',
  kn: 'ಕನ್ನಡ', ml: 'മലയാളം', mr: 'मराठी', bn: 'বাংলা',
  gu: 'ગુજરાતી', es: 'Español', fr: 'Français', zh: '中文',
};

const WOOD_CARD = {
  background: '#172E24',
  border: '6px solid #8B5A2B',
  borderTopColor: '#A0703A',
  borderLeftColor: '#A0703A',
  borderBottomColor: '#5E3A1A',
  borderRightColor: '#5E3A1A',
  boxShadow: 'inset 0 0 16px rgba(0,0,0,0.4), 0 0 0 1px #3D1F0A, 0 8px 24px rgba(0,0,0,0.5)',
  borderRadius: '4px',
};

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setSessions(data || []);
      setLoading(false);
    };
    fetchSessions();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center min-h-[80vh]">
        <p className="font-display text-2xl animate-pulse" style={{ color: 'rgba(248,248,242,0.5)' }}>
          Loading dashboard…
        </p>
      </div>
    );
  }

  const totalSessions   = sessions.length;
  const uniqueSubjects  = new Set(sessions.map(s => s.subject)).size;
  const uniqueLanguages = new Set(sessions.map(s => s.language)).size;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="font-display text-3xl sm:text-4xl font-bold tracking-wider chalk-glow"
            style={{ color: '#F8E16C', textShadow: '0 0 12px rgba(248,225,108,0.4), 2px 2px 0 rgba(0,0,0,0.5)' }}
          >
            🖊️ Teacher Dashboard
          </h1>
          <p className="font-handwritten text-xl mt-1 tracking-wider" style={{ color: 'rgba(248,248,242,0.6)' }}>
            Welcome back! Ready to start a new lesson? 👋
          </p>
        </div>

        <Link
          href="/session/new"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded font-display text-base tracking-wider transition-all duration-200 hover:-translate-y-0.5"
          id="new-session-btn"
          style={{
            background: 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
            border: '2px solid #3D1F0A',
            color: '#F8F8F2',
            boxShadow: '3px 3px 0 #3D1F0A, inset 0 1px 0 rgba(255,255,255,0.12)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          <Plus size={18} />
          <span>Start New Session</span>
        </Link>
      </div>

      {/* ── Chalk Divider ── */}
      <div className="chalk-divider" />

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Lessons', value: totalSessions,   icon: <Sparkles size={28} />, color: '#F8E16C' },
          { label: 'Subjects',      value: uniqueSubjects,  icon: <BookOpen  size={28} />, color: '#FF9CCF' },
          { label: 'Languages',     value: uniqueLanguages, icon: <Languages size={28} />, color: '#7FD6FF' },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex items-center justify-between p-5 rounded transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
            style={WOOD_CARD}
          >
            <div className="absolute inset-0 board-ruled opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <p className="font-handwritten text-lg tracking-wider" style={{ color: 'rgba(248,248,242,0.6)' }}>
                {stat.label}
              </p>
              <p
                className="font-display text-4xl font-bold mt-1"
                style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}55, 1px 1px 0 rgba(0,0,0,0.4)` }}
              >
                {stat.value}
              </p>
            </div>
            <div className="relative z-10 opacity-70" style={{ color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Session History ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Clock size={20} style={{ color: '#7FD6FF' }} />
          <h2
            className="font-display text-xl tracking-wide"
            style={{ color: '#7FD6FF', textShadow: '0 0 8px rgba(127,214,255,0.3)' }}
          >
            Session History
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-5 p-12 rounded text-center relative overflow-hidden"
            style={WOOD_CARD}
          >
            <div className="absolute inset-0 board-grid opacity-40 pointer-events-none" />
            <p className="font-handwritten text-2xl relative z-10" style={{ color: 'rgba(248,248,242,0.55)' }}>
              No sessions yet. Start teaching to build your history!
            </p>
            <Link
              href="/session/new"
              className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded font-display tracking-wider transition-all duration-200"
              style={{
                background: 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
                border: '2px solid #3D1F0A',
                color: '#F8F8F2',
                boxShadow: '3px 3px 0 #3D1F0A',
                textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              <Plus size={16} />
              <span>Start Session</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <div
                key={session.id}
                className="flex flex-col justify-between rounded transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                style={WOOD_CARD}
              >
                <div className="absolute inset-0 board-ruled opacity-40 pointer-events-none" />

                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className="font-display text-base tracking-wider"
                      style={{ color: '#F8E16C', textShadow: '0 0 6px rgba(248,225,108,0.3)' }}
                    >
                      📖 Grade {session.grade} · {session.subject}
                    </span>
                    <span className="font-handwritten text-xs shrink-0" style={{ color: 'rgba(248,248,242,0.45)' }}>
                      {new Date(session.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed font-body" style={{ color: 'rgba(248,248,242,0.75)' }}>
                    {session.question ? (
                      <>
                        <strong style={{ color: '#FF9CCF' }}>Q: </strong>
                        <span className="line-clamp-3">{session.question}</span>
                      </>
                    ) : (
                      <em style={{ color: 'rgba(248,248,242,0.35)' }}>No question captured yet.</em>
                    )}
                  </p>
                </div>

                <div
                  className="relative z-10 flex items-center justify-between gap-2 px-5 py-3 mt-auto"
                  style={{ borderTop: '1px solid rgba(248,248,242,0.08)' }}
                >
                  <span
                    className="px-2.5 py-0.5 rounded font-handwritten text-base tracking-wider"
                    style={{ background: 'rgba(23,46,36,0.7)', border: '1px solid #2E6B52', color: '#FF9CCF' }}
                  >
                    {LANG_LABELS[session.language] || session.language}
                  </span>
                  <Link
                    href={`/projector/${session.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-display text-xs tracking-wider transition-all duration-200"
                    style={{
                      border: '1px solid rgba(248,248,242,0.25)',
                      color: '#F8F8F2',
                      background: 'rgba(0,0,0,0.2)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F8E16C'; e.currentTarget.style.color = '#F8E16C'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(248,248,242,0.25)'; e.currentTarget.style.color = '#F8F8F2'; }}
                  >
                    <ExternalLink size={13} />
                    <span>Projector</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
