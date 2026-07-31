"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/profile';
import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    let userProf = null;

    if (session?.user) {
      userProf = await getUserProfile(session.user);
    } else if (typeof window !== 'undefined') {
      const demoStr = localStorage.getItem('kalvi_demo_user');
      if (demoStr) {
        try { userProf = JSON.parse(demoStr); } catch (e) {}
      }
    }
    setProfile(userProf);
  };

  useEffect(() => {
    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const prof = await getUserProfile(session.user);
        setProfile(prof);
      } else {
        loadProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kalvi_demo_user');
    }
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/');
  };

  const isHeadMaster = profile?.role === 'headmaster';
  const homeLink     = profile ? (isHeadMaster ? '/headmaster' : '/dashboard') : '/';

  return (
    <nav
      className="sticky top-0 z-50 shadow-xl"
      style={{
        background: 'linear-gradient(to bottom, #6B4423, #8B5A2B, #6B4423)',
        borderBottom: '3px solid #3D1F0A',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      {/* Top wood grain highlight */}
      <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }} />

      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Brand Logo */}
        <Link
          href={homeLink}
          className="flex items-center gap-3 group"
          id="navbar-brand"
        >
          <span className="text-3xl" role="img" aria-label="Classroom">📚</span>
          <div className="flex flex-col leading-none">
            <span
              className="font-display text-2xl font-bold tracking-wider transition-all duration-300 group-hover:text-chalk-yellow"
              style={{
                color: '#F8E16C',
                textShadow: '0 0 6px rgba(248,225,108,0.5), 1px 1px 0 rgba(0,0,0,0.5)',
                letterSpacing: '0.06em',
              }}
            >
              KalviAI
            </span>
            <span
              className="font-handwritten text-xs tracking-widest"
              style={{ color: 'rgba(248,248,242,0.65)', fontSize: '0.65rem' }}
            >
              {isHeadMaster ? '👑 Head Master Portal' : 'Digital Classroom Board'}
            </span>
          </div>
        </Link>

        {/* Right Side */}
        {profile && (
          <div className="flex items-center gap-4">
            
            {/* Quick Link to Head Master Portal if logged in as Head Master */}
            {isHeadMaster ? (
              <Link
                href="/headmaster"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-display text-xs tracking-wider transition-all"
                style={{ background: 'rgba(248,225,108,0.2)', border: '1px solid #F8E16C', color: '#F8E16C' }}
              >
                <span>👑 Head Master Portal</span>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-display text-xs tracking-wider transition-all"
                style={{ background: 'rgba(127,214,255,0.15)', border: '1px solid #7FD6FF', color: '#7FD6FF' }}
              >
                <span>🖊️ Teacher Dashboard</span>
              </Link>
            )}

            <span
              className="font-handwritten text-sm tracking-wider hidden md:block"
              style={{ color: 'rgba(248,248,242,0.75)' }}
            >
              {isHeadMaster ? '👑' : '✏️'} {profile.full_name || profile.email}
            </span>

            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded font-display text-sm tracking-wider transition-all duration-200"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.35))',
                border: '1px solid rgba(248,248,242,0.2)',
                color: '#F8F8F2',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(248,225,108,0.5)';
                e.currentTarget.style.color = '#F8E16C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(248,248,242,0.2)';
                e.currentTarget.style.color = '#F8F8F2';
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom wood grain shadow line */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3), transparent)' }} />
    </nav>
  );
}
