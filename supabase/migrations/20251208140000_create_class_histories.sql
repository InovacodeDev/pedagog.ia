CREATE TABLE IF NOT EXISTS public.class_histories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    snapshot_data jsonb NOT NULL,
    description text
);

ALTER TABLE public.class_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own class histories"
    ON public.class_histories
    USING (auth.uid() = user_id);
