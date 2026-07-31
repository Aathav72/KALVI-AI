-- ============================================================
-- KALVI AI — Profiles Table Migration
-- Run this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Unknown',
    role TEXT NOT NULL DEFAULT 'teacher', -- 'teacher' or 'headmaster'
    subject TEXT DEFAULT '',
    grade TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (in case of re-run)
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Step 4: Recreate RLS policies
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 5: Backfill profiles for any existing auth users who signed up
-- but don't have a profiles row yet.
INSERT INTO public.profiles (id, email, full_name, role, subject, grade, created_at)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Unknown') AS full_name,
    COALESCE(u.raw_user_meta_data->>'role', 'teacher') AS role,
    COALESCE(u.raw_user_meta_data->>'subject', '') AS subject,
    COALESCE(u.raw_user_meta_data->>'grade', '') AS grade,
    u.created_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Done! Verify with:
SELECT * FROM public.profiles ORDER BY created_at DESC;
