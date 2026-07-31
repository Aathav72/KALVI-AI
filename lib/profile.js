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

  try {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher');

    if (profilesData && profilesData.length > 0) {
      dbTeachers = profilesData;
    }

    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionsData) {
      dbSessions = sessionsData;
    }
  } catch (err) {
    console.warn('Error fetching DB teachers/sessions:', err);
  }

  const teacherMap = new Map();

  // Add actual DB teachers
  dbTeachers.forEach(t => {
    const teacherSessions = dbSessions.filter(s => s.teacher_id === t.id);
    teacherMap.set(t.id, {
      ...t,
      sessions: teacherSessions,
    });
  });

  // Attach any orphaned DB sessions to a teacher entry if teacher profile row isn't in profiles table
  dbSessions.forEach(s => {
    if (!teacherMap.has(s.teacher_id)) {
      const shortId = s.teacher_id.substring(0, 6);
      teacherMap.set(s.teacher_id, {
        id: s.teacher_id,
        full_name: `Teacher (${shortId})`,
        email: `teacher_${shortId}@school.edu`,
        role: 'teacher',
        subject: s.subject || 'General',
        grade: s.grade || '5',
        sessions: [s],
      });
    } else {
      const teacherObj = teacherMap.get(s.teacher_id);
      if (!teacherObj.sessions.some(existing => existing.id === s.id)) {
        teacherObj.sessions.push(s);
      }
    }
  });

  return Array.from(teacherMap.values());
}
