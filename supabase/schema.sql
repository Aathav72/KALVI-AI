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

-- Allow teachers to view their own sessions
CREATE POLICY "Teachers can view their own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = teacher_id);

-- Allow teachers to insert their own sessions
CREATE POLICY "Teachers can insert their own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Allow teachers to update their own sessions
CREATE POLICY "Teachers can update their own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = teacher_id);

-- Enable Realtime for the projector view
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
