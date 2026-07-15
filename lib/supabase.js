import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fake-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
