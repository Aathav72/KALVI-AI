import { supabase } from './supabase';

// Sample Seed Data for Demo Head Master mode or when database is empty
export const SAMPLE_TEACHERS = [
  {
    id: 't-101',
    full_name: 'Dr. Anitha Sharma',
    email: 'anitha.sharma@school.edu',
    role: 'teacher',
    subject: 'Science',
    grade: '5',
    created_at: '2026-07-15T09:00:00Z',
    sessions: [
      {
        id: 's-101',
        grade: '5',
        subject: 'Science',
        language: 'en',
        question: 'How does photosynthesis turn sunlight into food for plants?',
        created_at: '2026-07-31T09:30:00Z',
        ai_answer: 'Photosynthesis is the process where green plants use sunlight, carbon dioxide, and water to synthesize food (glucose) and release oxygen into the air.',
      },
      {
        id: 's-102',
        grade: '5',
        subject: 'Science',
        language: 'hi',
        question: 'जल चक्र क्या है? (What is the water cycle?)',
        created_at: '2026-07-30T11:15:00Z',
        ai_answer: 'जल चक्र वह निरंतर प्रक्रिया है जिसके द्वारा जल महासागरों, वायुमंडल और भूमि के बीच स्थानांतरित होता है।',
      }
    ]
  },
  {
    id: 't-102',
    full_name: 'Prof. Rajesh Kumar',
    email: 'rajesh.kumar@school.edu',
    role: 'teacher',
    subject: 'Mathematics',
    grade: '10',
    created_at: '2026-07-10T08:30:00Z',
    sessions: [
      {
        id: 's-201',
        grade: '10',
        subject: 'Mathematics',
        language: 'en',
        question: 'State and prove the Pythagorean Theorem for a right-angled triangle.',
        created_at: '2026-07-31T14:20:00Z',
        ai_answer: 'In a right-angled triangle, the square of the length of the hypotenuse is equal to the sum of the squares of the lengths of the other two sides: a² + b² = c².',
      },
      {
        id: 's-202',
        grade: '10',
        subject: 'Mathematics',
        language: 'ta',
        question: 'இருபடிச் சமன்பாடுகளின் மூலங்களைக் காணும் முறை (Solving quadratic equations)',
        created_at: '2026-07-29T10:00:00Z',
        ai_answer: 'இருபடி வாய்பாட்டைப் பயன்படுத்தி x = [-b ± √(b² - 4ac)] / 2a மூலம் மூலங்களைக் காணலாம்.',
      }
    ]
  },
  {
    id: 't-103',
    full_name: 'Mrs. Priya Sundaram',
    email: 'priya.sundaram@school.edu',
    role: 'teacher',
    subject: 'English',
    grade: '8',
    created_at: '2026-07-18T10:00:00Z',
    sessions: [
      {
        id: 's-301',
        grade: '8',
        subject: 'English',
        language: 'en',
        question: 'What is the difference between active and passive voice with examples?',
        created_at: '2026-07-31T08:45:00Z',
        ai_answer: 'Active voice focuses on the performer of the action (The teacher wrote the lesson), while passive voice focuses on the recipient of the action (The lesson was written by the teacher).',
      }
    ]
  },
  {
    id: 't-104',
    full_name: 'Mr. Senthil Nathan',
    email: 'senthil.nathan@school.edu',
    role: 'teacher',
    subject: 'History',
    grade: '7',
    created_at: '2026-07-20T12:00:00Z',
    sessions: [
      {
        id: 's-401',
        grade: '7',
        subject: 'History',
        language: 'en',
        question: 'Explain the architecture and legacy of the Chola Empire Dynasty.',
        created_at: '2026-07-30T15:10:00Z',
        ai_answer: 'The Chola Dynasty is renowned for magnificent Dravidian temple architecture, such as the Brihadisvara Temple in Thanjavur, and expanding naval empire trade.',
      }
    ]
  }
];

export async function getUserProfile(user) {
  if (!user) return null;

  // Check local demo mode first
  if (typeof window !== 'undefined') {
    const demoUserStr = localStorage.getItem('kalvi_demo_user');
    if (demoUserStr) {
      try {
        const demoUser = JSON.parse(demoUserStr);
        if (demoUser.id === user.id || demoUser.email === user.email) {
          return demoUser;
        }
      } catch (e) {
        console.error('Failed to parse demo user', e);
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
    localStorage.setItem('kalvi_demo_user', JSON.stringify(fullProfile));
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

  // Combine DB teachers with fallback sample teachers to guarantee a rich experience
  const teacherMap = new Map();

  // Add sample teachers
  SAMPLE_TEACHERS.forEach(t => {
    teacherMap.set(t.email, { ...t, sessions: [...t.sessions] });
  });

  // Merge/Add actual DB teachers
  dbTeachers.forEach(t => {
    const teacherSessions = dbSessions.filter(s => s.teacher_id === t.id);
    if (teacherMap.has(t.email)) {
      const existing = teacherMap.get(t.email);
      teacherMap.set(t.email, {
        ...existing,
        ...t,
        sessions: [...teacherSessions, ...existing.sessions],
      });
    } else {
      teacherMap.set(t.email, {
        ...t,
        sessions: teacherSessions,
      });
    }
  });

  // Attach any orphaned DB sessions to a default teacher entry if teacher profile isn't found
  dbSessions.forEach(s => {
    let found = false;
    teacherMap.forEach(t => {
      if (t.id === s.teacher_id) found = true;
    });
    if (!found) {
      const defaultTeacherKey = `teacher_${s.teacher_id.substring(0, 6)}`;
      if (!teacherMap.has(defaultTeacherKey)) {
        teacherMap.set(defaultTeacherKey, {
          id: s.teacher_id,
          full_name: `Teacher (${s.teacher_id.substring(0, 6)})`,
          email: `teacher_${s.teacher_id.substring(0, 6)}@school.edu`,
          role: 'teacher',
          subject: s.subject || 'General',
          grade: s.grade || '5',
          sessions: [s],
        });
      } else {
        teacherMap.get(defaultTeacherKey).sessions.push(s);
      }
    }
  });

  return Array.from(teacherMap.values());
}
