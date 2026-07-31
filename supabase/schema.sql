-- Create a table for profiles (Teachers & Head Masters)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher', -- 'teacher' or 'headmaster'
    subject TEXT DEFAULT '',
    grade TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create a table for sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    language TEXT NOT NULL,
    question TEXT DEFAULT '',
    ai_answer TEXT DEFAULT '',
    examples JSONB DEFAULT '[]',
    tips JSONB DEFAULT '[]',
    summary TEXT DEFAULT '',
    quiz JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow teachers to view their own sessions or Head Masters to view all sessions
CREATE POLICY "Teachers and Headmasters can view sessions" ON public.sessions
    FOR SELECT USING (
        auth.uid() = teacher_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'headmaster'
        )
    );

-- Allow teachers to insert their own sessions
CREATE POLICY "Teachers can insert their own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Allow teachers to update their own sessions
CREATE POLICY "Teachers can update their own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = teacher_id);

-- Enable Realtime for the projector view
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
