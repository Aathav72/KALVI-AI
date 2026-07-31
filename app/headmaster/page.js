"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserProfile, getAllTeachersAndSessions } from '@/lib/profile';
import Link from 'next/link';
import { 
  Users, BookOpen, GraduationCap, Clock, Search, 
  ChevronDown, ChevronUp, ExternalLink, Sparkles, Filter, 
  Award, School
} from 'lucide-react';

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

const LANG_LABELS = {
  en: 'English', hi: 'हिन्दी', ta: 'தமிழ்', te: 'తెలుగు',
  kn: 'கನ್ನಡ', ml: 'மலയാളம்', mr: 'मராठी', bn: 'বাংলা',
  gu: 'ગુજરાતી', es: 'Español', fr: 'Français', zh: '中文',
};

export default function HeadMasterDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [teachers, setTeachers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm]       = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter]     = useState('ALL');
  const [expandedTeacherId, setExpandedTeacherId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If demo user or authenticated user
      let profile = null;
      if (user) {
        profile = await getUserProfile(user);
      } else if (typeof window !== 'undefined') {
        const demoStr = localStorage.getItem('kalvi_demo_user');
        if (demoStr) {
          try { profile = JSON.parse(demoStr); } catch (e) {}
        }
      }

      // Check if user has headmaster access
      if (!profile) {
        // Allow fallback preview if visiting directly or demo login
        profile = { full_name: 'Dr. R. Ramanathan', role: 'headmaster', email: 'headmaster@school.edu' };
      }

      setUserProfile(profile);

      // Load all teachers and sessions
      const allTeachers = await getAllTeachersAndSessions();
      setTeachers(allTeachers);
      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-3">
          <p className="font-display text-3xl animate-pulse" style={{ color: '#F8E16C' }}>
            👑 Loading Head Master Portal…
          </p>
          <p className="font-handwritten text-xl" style={{ color: 'rgba(248,248,242,0.6)' }}>
            Fetching school metrics & teacher session records…
          </p>
        </div>
      </div>
    );
  }

  // Calculate high-level stats
  const totalTeachers = teachers.length;
  const totalSessions = teachers.reduce((acc, t) => acc + (t.sessions ? t.sessions.length : 0), 0);
  const uniqueSubjectsList = Array.from(new Set(teachers.map(t => t.subject).filter(Boolean)));
  const uniqueGradesList   = Array.from(new Set(teachers.map(t => t.grade).filter(Boolean)));

  // Filter teachers list
  const filteredTeachers = teachers.filter(t => {
    const nameMatch = (t.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (t.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = subjectFilter === 'ALL' || t.subject === subjectFilter;
    const gradeMatch   = gradeFilter === 'ALL' || t.grade === gradeFilter;
    return nameMatch && subjectMatch && gradeMatch;
  });

  const toggleExpand = (id) => {
    setExpandedTeacherId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fade-in">

      {/* ── Header Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded relative overflow-hidden" style={WOOD_CARD}>
        <div className="absolute inset-0 board-ruled opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-handwritten text-sm tracking-widest"
                  style={{ background: 'rgba(248,225,108,0.15)', border: '1px solid #F8E16C', color: '#F8E16C' }}>
              👑 Head Master Administration Portal
            </span>
            <span className="px-3 py-1 rounded-full font-handwritten text-sm tracking-widest hidden sm:inline-block"
                  style={{ background: 'rgba(127,214,255,0.15)', border: '1px solid #7FD6FF', color: '#7FD6FF' }}>
              🏫 Academic Year 2026–27
            </span>
          </div>

          <h1
            className="font-display text-3xl sm:text-4xl font-bold tracking-wider chalk-glow"
            style={{ color: '#F8E16C', textShadow: '0 0 14px rgba(248,225,108,0.4), 2px 2px 0 rgba(0,0,0,0.5)' }}
          >
            Welcome, {userProfile?.full_name || 'Head Master'}! 👋
          </h1>
          <p className="font-handwritten text-xl tracking-wider" style={{ color: 'rgba(248,248,242,0.75)' }}>
            Monitor teaching staff details, assigned subjects, class standards, and live classroom sessions.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="p-4 rounded text-center" style={{ background: 'rgba(23,46,36,0.8)', border: '1px solid #2E6B52' }}>
            <Award className="mx-auto mb-1" style={{ color: '#F8E16C' }} size={24} />
            <span className="font-display text-xs tracking-wider" style={{ color: 'rgba(248,248,242,0.8)' }}>
              School Copilot
            </span>
          </div>
        </div>
      </div>

      {/* ── Chalk Divider ── */}
      <div className="chalk-divider" />

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Teachers',      value: totalTeachers,            icon: <Users size={28} />,        color: '#F8E16C' },
          { label: 'School Lessons',       value: totalSessions,            icon: <Clock size={28} />,        color: '#FF9CCF' },
          { label: 'Active Subjects',      value: uniqueSubjectsList.length,icon: <BookOpen size={28} />,     color: '#7FD6FF' },
          { label: 'Standards Taught',    value: uniqueGradesList.length,  icon: <GraduationCap size={28} />,color: '#A6E22E' },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex items-center justify-between p-5 rounded transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
            style={WOOD_CARD}
          >
            <div className="absolute inset-0 board-ruled opacity-40 pointer-events-none" />
            <div className="relative z-10">
              <p className="font-handwritten text-lg tracking-wider" style={{ color: 'rgba(248,248,242,0.65)' }}>
                {stat.label}
              </p>
              <p
                className="font-display text-4xl font-bold mt-1"
                style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}55, 1px 1px 0 rgba(0,0,0,0.4)` }}
              >
                {stat.value}
              </p>
            </div>
            <div className="relative z-10 opacity-80" style={{ color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        className="p-6 rounded space-y-4 relative overflow-hidden"
        style={WOOD_CARD}
      >
        <div className="absolute inset-0 board-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} style={{ color: '#7FD6FF' }} />
            <h2 className="font-display text-xl tracking-wide" style={{ color: '#7FD6FF', textShadow: '0 0 8px rgba(127,214,255,0.3)' }}>
              Teacher & Class Filters
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,248,242,0.5)' }} />
            <input
              type="text"
              placeholder="Search teacher by name or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded font-handwritten text-lg tracking-wide"
              style={{
                background: 'rgba(23,46,36,0.9)',
                border: '1px solid #2E6B52',
                color: '#F8F8F2',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-4 pt-2">
          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <label className="font-handwritten text-base tracking-wider" style={{ color: '#FF9CCF' }}>Subject:</label>
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded font-handwritten text-base tracking-wide"
              style={{ background: 'rgba(23,46,36,0.9)', border: '1px solid #2E6B52', color: '#F8F8F2', cursor: 'pointer' }}
            >
              <option value="ALL">All Subjects</option>
              {['Science', 'Mathematics', 'History', 'Geography', 'English', 'Computer Science', 'Social Studies', 'Hindi', 'Environmental Studies'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2">
            <label className="font-handwritten text-base tracking-wider" style={{ color: '#FF9CCF' }}>Standard (Grade):</label>
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="px-3 py-1.5 rounded font-handwritten text-base tracking-wide"
              style={{ background: 'rgba(23,46,36,0.9)', border: '1px solid #2E6B52', color: '#F8F8F2', cursor: 'pointer' }}
            >
              <option value="ALL">All Standards</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={`${i+1}`}>Standard / Grade {i+1}</option>
              ))}
            </select>
          </div>

          {(searchTerm || subjectFilter !== 'ALL' || gradeFilter !== 'ALL') && (
            <button
              onClick={() => { setSearchTerm(''); setSubjectFilter('ALL'); setGradeFilter('ALL'); }}
              className="px-3 py-1 rounded font-handwritten text-sm tracking-wide transition-all"
              style={{ border: '1px solid rgba(255,156,207,0.4)', color: '#FF9CCF', background: 'transparent' }}
            >
              Reset Filters 🔄
            </button>
          )}
        </div>
      </div>

      {/* ── Teachers Directory ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <School size={22} style={{ color: '#F8E16C' }} />
            <h2 className="font-display text-2xl tracking-wider" style={{ color: '#F8E16C', textShadow: '0 0 8px rgba(248,225,108,0.3)' }}>
              Teaching Staff Roster ({filteredTeachers.length})
            </h2>
          </div>
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded text-center relative overflow-hidden" style={WOOD_CARD}>
            <p className="font-handwritten text-2xl" style={{ color: 'rgba(248,248,242,0.6)' }}>
              No teachers found matching your filters. Try clearing your search query! 🔍
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredTeachers.map(teacher => {
              const isExpanded = expandedTeacherId === teacher.id;
              const sessionCount = teacher.sessions ? teacher.sessions.length : 0;
              const latestSession = teacher.sessions && teacher.sessions.length > 0 ? teacher.sessions[0] : null;

              return (
                <div
                  key={teacher.id}
                  className="rounded transition-all duration-200 relative overflow-hidden"
                  style={WOOD_CARD}
                >
                  <div className="absolute inset-0 board-ruled opacity-30 pointer-events-none" />

                  {/* Teacher Card Header */}
                  <div className="relative z-10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Left Info: Name & Email */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-3xl" role="img" aria-label="Teacher">👩‍🏫</span>
                        <div>
                          <h3
                            className="font-display text-2xl font-bold tracking-wide"
                            style={{ color: '#F8E16C', textShadow: '0 0 6px rgba(248,225,108,0.3)' }}
                          >
                            {teacher.full_name}
                          </h3>
                          <p className="font-handwritten text-base tracking-wider" style={{ color: 'rgba(248,248,242,0.65)' }}>
                            📧 {teacher.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle Info: Subject & Standard */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="px-4 py-2 rounded" style={{ background: 'rgba(23,46,36,0.8)', border: '1px solid #2E6B52' }}>
                        <p className="font-handwritten text-xs tracking-wider" style={{ color: 'rgba(248,248,242,0.5)' }}>
                          SUBJECT
                        </p>
                        <p className="font-display text-base tracking-wider" style={{ color: '#FF9CCF' }}>
                          📖 {teacher.subject || 'General'}
                        </p>
                      </div>

                      <div className="px-4 py-2 rounded" style={{ background: 'rgba(23,46,36,0.8)', border: '1px solid #2E6B52' }}>
                        <p className="font-handwritten text-xs tracking-wider" style={{ color: 'rgba(248,248,242,0.5)' }}>
                          STANDARD / CLASS
                        </p>
                        <p className="font-display text-base tracking-wider" style={{ color: '#7FD6FF' }}>
                          🎓 Class / Grade {teacher.grade || '5'}
                        </p>
                      </div>

                      <div className="px-4 py-2 rounded" style={{ background: 'rgba(23,46,36,0.8)', border: '1px solid #2E6B52' }}>
                        <p className="font-handwritten text-xs tracking-wider" style={{ color: 'rgba(248,248,242,0.5)' }}>
                          LESSONS CONDUCTED
                        </p>
                        <p className="font-display text-base tracking-wider" style={{ color: '#A6E22E' }}>
                          ⚡ {sessionCount} Lessons
                        </p>
                      </div>
                    </div>

                    {/* Right Button: Toggle Session View */}
                    <div className="shrink-0">
                      <button
                        onClick={() => toggleExpand(teacher.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded font-display text-sm tracking-wider transition-all duration-200"
                        style={{
                          background: isExpanded
                            ? 'linear-gradient(to bottom, #7FD6FF22, #7FD6FF11)'
                            : 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
                          border: isExpanded ? '1px solid #7FD6FF' : '2px solid #3D1F0A',
                          color: '#F8F8F2',
                          boxShadow: '2px 2px 0 #3D1F0A',
                        }}
                      >
                        <span>{isExpanded ? 'Hide Sessions' : `View Sessions (${sessionCount})`}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Sessions History Drawer */}
                  {isExpanded && (
                    <div
                      className="relative z-10 p-6 border-t animate-fade-in space-y-4"
                      style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(248,248,242,0.1)' }}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-lg tracking-wider" style={{ color: '#7FD6FF' }}>
                          📜 Lesson & Session Log for {teacher.full_name}
                        </h4>
                        <span className="font-handwritten text-sm" style={{ color: 'rgba(248,248,242,0.5)' }}>
                          Showing all {sessionCount} recorded sessions
                        </span>
                      </div>

                      {sessionCount === 0 ? (
                        <p className="font-handwritten text-lg italic text-center py-4" style={{ color: 'rgba(248,248,242,0.5)' }}>
                          No sessions created by this teacher yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teacher.sessions.map(s => (
                            <div
                              key={s.id}
                              className="p-4 rounded flex flex-col justify-between gap-3 relative overflow-hidden"
                              style={{ background: 'rgba(23,46,36,0.9)', border: '1px solid #2E6B52' }}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="font-display text-sm" style={{ color: '#F8E16C' }}>
                                    📖 Grade {s.grade} · {s.subject}
                                  </span>
                                  <span className="font-handwritten text-xs" style={{ color: 'rgba(248,248,242,0.5)' }}>
                                    {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>

                                <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(248,248,242,0.85)' }}>
                                  {s.question ? (
                                    <>
                                      <strong style={{ color: '#FF9CCF' }}>Q: </strong>
                                      <span className="line-clamp-2">{s.question}</span>
                                    </>
                                  ) : (
                                    <em style={{ color: 'rgba(248,248,242,0.4)' }}>No question captured yet.</em>
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(248,248,242,0.08)' }}>
                                <span className="font-handwritten text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.3)', color: '#7FD6FF' }}>
                                  🌐 Language: {LANG_LABELS[s.language] || s.language}
                                </span>
                                <Link
                                  href={`/projector/${s.id}`}
                                  target="_blank"
                                  className="flex items-center gap-1 font-display text-xs px-2.5 py-1 rounded transition-all"
                                  style={{ border: '1px solid rgba(248,248,242,0.3)', color: '#F8F8F2' }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#F8E16C'; e.currentTarget.style.color = '#F8E16C'; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(248,248,242,0.3)'; e.currentTarget.style.color = '#F8F8F2'; }}
                                >
                                  <ExternalLink size={12} />
                                  <span>View Projector</span>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
