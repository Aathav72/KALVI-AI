-- ============================================================
-- KALVI AI — Fix Headmaster Sessions Visibility
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Drop the old restrictive sessions SELECT policy
DROP POLICY IF EXISTS "Teachers and Headmasters can view sessions" ON public.sessions;

-- Step 2: Create a new policy that is more permissive for headmasters
-- This allows:
--   (a) Teachers to see their own sessions
--   (b) ANY authenticated user whose profiles.role = 'headmaster' to see ALL sessions
CREATE POLICY "Teachers and Headmasters can view sessions" ON public.sessions
    FOR SELECT USING (
        auth.uid() = teacher_id
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'headmaster'
        )
    );

-- Step 3: Allow all authenticated users to see all profiles
-- (required so headmaster can load the list of teachers)
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Step 4: Ensure your headmaster account has role = 'headmaster' in profiles table.
-- Find your headmaster's email and run:
-- UPDATE public.profiles SET role = 'headmaster' WHERE email = 'your-headmaster@email.com';

-- Step 5: Verify the fix:
-- Run this as the headmaster user to confirm sessions are returned:
SELECT s.id, s.subject, s.grade, s.teacher_id, s.created_at
FROM public.sessions s
ORDER BY s.created_at DESC;

-- Step 6: Check all profiles to confirm roles are correct:
SELECT id, email, full_name, role FROM public.profiles ORDER BY role;
