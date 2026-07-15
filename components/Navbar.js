"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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
          href={user ? "/dashboard" : "/"}
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
              Digital Classroom Board
            </span>
          </div>
        </Link>

        {/* Right Side */}
        {user && (
          <div className="flex items-center gap-4">
            <span
              className="font-handwritten text-sm tracking-wider hidden sm:block"
              style={{ color: 'rgba(248,248,242,0.6)' }}
            >
              ✏️ {user.email}
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
