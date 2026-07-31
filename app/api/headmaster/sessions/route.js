import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Use service role key if available (bypasses RLS completely)
    // Falls back to anon key which will still work if the profile row is correctly set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Prefer service role key (no RLS), fall back to anon key
    const adminSupabase = createClient(supabaseUrl, serviceKey || anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Fetch all teacher profiles
    const { data: profilesData, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher');

    if (profileErr) {
      console.error('[headmaster/sessions] profiles error:', profileErr.message);
    }

    // Fetch ALL sessions regardless of teacher_id
    const { data: sessionsData, error: sessionErr } = await adminSupabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionErr) {
      console.error('[headmaster/sessions] sessions error:', sessionErr.message);
    }

    return NextResponse.json({
      profiles: profilesData || [],
      sessions: sessionsData || [],
    });
  } catch (error) {
    console.error('[headmaster/sessions] unexpected error:', error);
    return NextResponse.json({ error: 'Failed to fetch data', profiles: [], sessions: [] }, { status: 500 });
  }
}
