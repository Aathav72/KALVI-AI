


DROP POLICY IF EXISTS "Teachers and Headmasters can view sessions" ON public.sessions;


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


DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');


SELECT s.id, s.subject, s.grade, s.teacher_id, s.created_at
FROM public.sessions s
ORDER BY s.created_at DESC;

SELECT id, email, full_name, role FROM public.profiles ORDER BY role;
