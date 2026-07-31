import { supabase } from './supabase';

export async function getUserProfile(user) {
  if (!user) return null;

  // Check saved local profile
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('kalvi_user_profile');
    if (userStr) {
      try {
        const savedUser = JSON.parse(userStr);
        if (savedUser.id === user.id || savedUser.email === user.email) {
          return savedUser;
        }
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }
  }

  // Try fetching from Supabase profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Profiles table check error:', err);
  }

  // Fallback metadata from auth user
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: metadata.full_name || user.email?.split('@')[0] || 'User',
    role: metadata.role || 'teacher',
    subject: metadata.subject || 'General',
    grade: metadata.grade || '5',
    created_at: user.created_at || new Date().toISOString(),
  };
}

export async function saveUserProfile(user, profileData) {
  if (!user) return null;

  // Check if profile already exists in Supabase first
  try {
    const { data: existingProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!fetchErr && existingProfile) {
      // Profile already saved — store in localStorage and return it (don't overwrite)
      if (typeof window !== 'undefined') {
        localStorage.setItem('kalvi_user_profile', JSON.stringify(existingProfile));
      }
      return existingProfile;
    }
  } catch (err) {
    console.warn('Could not check existing profile:', err);
  }

  const fullProfile = {
    id: user.id,
    email: user.email,
    full_name: profileData.full_name || user.email?.split('@')[0] || 'User',
    role: profileData.role || 'teacher',
    subject: profileData.subject || '',
    grade: profileData.grade || '',
    created_at: new Date().toISOString(),
  };

  // Save to localStorage for client consistency
  if (typeof window !== 'undefined') {
    localStorage.setItem('kalvi_user_profile', JSON.stringify(fullProfile));
  }

  // Save to Supabase profiles table
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(fullProfile);

    if (error) console.warn('Could not upsert profile into Supabase:', error.message);
  } catch (err) {
    console.warn('Error saving user profile:', err);
  }

  return fullProfile;
}

export async function getAllTeachersAndSessions() {
  let dbTeachers = [];
  let dbSessions = [];

  // Fetch all teacher profiles
  try {
    const { data: profilesData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher');

    if (profileErr) {
      console.warn('Error fetching teacher profiles:', profileErr.message);
    } else if (profilesData) {
      dbTeachers = profilesData;
    }
  } catch (err) {
    console.warn('Exception fetching teacher profiles:', err);
  }

  // Fetch all sessions (RLS allows headmasters to see all)
  try {
    const { data: sessionsData, error: sessionErr } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionErr) {
      console.warn('Error fetching sessions (possible RLS issue):', sessionErr.message);
    } else if (sessionsData) {
      dbSessions = sessionsData;
    }
  } catch (err) {
    console.warn('Exception fetching sessions:', err);
  }

  const teacherMap = new Map();

  // Add actual DB teachers, derive subject/grade from sessions if profile fields are empty
  dbTeachers.forEach(t => {
    const teacherSessions = dbSessions.filter(s => s.teacher_id === t.id);

    // Derive subject & grade from sessions when profile fields are blank
    const derivedSubject = (t.subject && t.subject.trim())
      ? t.subject
      : (teacherSessions[0]?.subject || '');
    const derivedGrade = (t.grade && t.grade.trim())
      ? t.grade
      : (teacherSessions[0]?.grade || '');

    // Collect all unique subjects and grades taught
    const allSubjects = [...new Set(teacherSessions.map(s => s.subject).filter(Boolean))];
    const allGrades   = [...new Set(teacherSessions.map(s => s.grade).filter(Boolean))];

    teacherMap.set(t.id, {
      ...t,
      subject: derivedSubject,
      grade: derivedGrade,
      all_subjects: allSubjects.length > 0 ? allSubjects : (derivedSubject ? [derivedSubject] : []),
      all_grades: allGrades.length > 0 ? allGrades : (derivedGrade ? [derivedGrade] : []),
      sessions: teacherSessions,
    });
  });

  // Attach any orphaned sessions (teacher has sessions but no profile row)
  dbSessions.forEach(s => {
    if (!teacherMap.has(s.teacher_id)) {
      if (teacherMap.has(s.teacher_id + '_orphan')) {
        const obj = teacherMap.get(s.teacher_id + '_orphan');
        if (!obj.sessions.some(e => e.id === s.id)) {
          obj.sessions.push(s);
          if (s.subject && !obj.all_subjects.includes(s.subject)) obj.all_subjects.push(s.subject);
          if (s.grade && !obj.all_grades.includes(s.grade)) obj.all_grades.push(s.grade);
        }
      } else {
        const shortId = s.teacher_id?.substring(0, 6) || 'unkwn';
        teacherMap.set(s.teacher_id, {
          id: s.teacher_id,
          full_name: `Teacher (${shortId})`,
          email: `teacher_${shortId}@school.edu`,
          role: 'teacher',
          subject: s.subject || '',
          grade: s.grade || '',
          all_subjects: s.subject ? [s.subject] : [],
          all_grades: s.grade ? [s.grade] : [],
          sessions: [s],
        });
      }
    } else {
      const teacherObj = teacherMap.get(s.teacher_id);
      if (!teacherObj.sessions.some(existing => existing.id === s.id)) {
        teacherObj.sessions.push(s);
        if (s.subject && !teacherObj.all_subjects.includes(s.subject)) teacherObj.all_subjects.push(s.subject);
        if (s.grade && !teacherObj.all_grades.includes(s.grade)) teacherObj.all_grades.push(s.grade);
      }
    }
  });

  return Array.from(teacherMap.values());
}

