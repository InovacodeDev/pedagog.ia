-- =====================================================
-- PEDAGOGI.AI DATABASE SCHEMA
-- Version: 1.0.0 (Genesis Migration)
-- Description: Complete schema with RLS, encryption, and job queue
-- =====================================================

-- 1. ENABLE CRITICAL EXTENSIONS
-- =====================================================
create extension if not exists "vector" with schema "extensions";
create extension if not exists "pgcrypto" with schema "extensions";
create extension if not exists "pg_net" with schema "extensions";

-- 2. PROFILES TABLE (Teacher/Admin Accounts)
-- =====================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  institution_id uuid,
  role text default 'teacher' check (role in ('teacher', 'admin')),
  full_name text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. STUDENTS TABLE (PII Encrypted - LGPD/GDPR Compliant)
-- =====================================================
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  institution_id uuid not null,
  encrypted_name bytea not null, -- CRITICAL: Encrypted with pgp_sym_encrypt
  grade_level text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.students enable row level security;

-- Policy: Users can only see students from their institution
create policy "Users see own institution students"
  on public.students for select
  using (
    institution_id = (
      select institution_id from public.profiles where id = auth.uid()
    )
  );

-- 4. BACKGROUND JOBS TABLE (Async Processing Queue)
-- =====================================================
create table if not exists public.background_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_type text not null check (job_type in ('ocr_correction', 'exam_generation', 'weekly_report')),
  payload jsonb not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result jsonb,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.background_jobs enable row level security;

-- Policy: Users can see their own jobs
create policy "Users can see own jobs"
  on public.background_jobs for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own jobs
create policy "Users can create own jobs"
  on public.background_jobs for insert
  with check (auth.uid() = user_id);

-- Index for performance
create index if not exists idx_jobs_user_status on public.background_jobs(user_id, status);
create index if not exists idx_jobs_created_at on public.background_jobs(created_at desc);

-- 5. EXAM GRADES TABLE (Final Validated Scores)
-- =====================================================
create table if not exists public.exam_grades (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.background_jobs on delete cascade not null,
  student_id uuid references public.students on delete set null,
  exam_id uuid, -- Future: Link to exams table
  final_score numeric(5,2) not null check (final_score >= 0 and final_score <= 10),
  answers jsonb not null,
  verified_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.exam_grades enable row level security;

-- Policy: Users can see grades for jobs they own
create policy "Users can see own exam grades"
  on public.exam_grades for select
  using (
    job_id in (
      select id from public.background_jobs where user_id = auth.uid()
    )
  );

-- Policy: Users can insert grades for their own jobs
create policy "Users can create exam grades"
  on public.exam_grades for insert
  with check (
    job_id in (
      select id from public.background_jobs where user_id = auth.uid()
    )
  );

-- 6. STORED PROCEDURES (Encryption/Decryption RPCs)
-- =====================================================

-- RPC: Create Student with Encrypted Name
create or replace function public.create_secure_student(
  name_text text,
  grade text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  app_key text;
  new_student_id uuid;
  user_institution_id uuid;
begin
  -- Get encryption key from settings (set via ALTER DATABASE)
  app_key := current_setting('app.settings.encryption_key', true);
  
  if app_key is null or app_key = '' then
    raise exception 'Encryption key not configured';
  end if;

  -- Get user's institution
  select institution_id into user_institution_id
  from public.profiles
  where id = auth.uid();

  if user_institution_id is null then
    raise exception 'User has no institution assigned';
  end if;
  
  -- Insert encrypted student
  insert into public.students (institution_id, encrypted_name, grade_level)
  values (
    user_institution_id,
    extensions.pgp_sym_encrypt(name_text, app_key),
    grade
  )
  returning id into new_student_id;

  return new_student_id;
end;
$$;

-- RPC: Get Students with Decrypted Names
create or replace function public.get_students_decrypted(
  p_institution_id uuid
) returns table (
  id uuid,
  name text,
  grade_level text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  app_key text;
  user_institution_id uuid;
begin
  -- Security check: Ensure user belongs to the institution
  select institution_id into user_institution_id
  from public.profiles
  where id = auth.uid();

  if user_institution_id != p_institution_id then
    raise exception 'Access denied: User does not belong to this institution';
  end if;

  -- Get encryption key
  app_key := current_setting('app.settings.encryption_key', true);
  
  if app_key is null or app_key = '' then
    raise exception 'Encryption key not configured';
  end if;

  -- Return decrypted students
  return query
  select
    s.id,
    extensions.pgp_sym_decrypt(s.encrypted_name, app_key)::text as name,
    s.grade_level,
    s.created_at
  from public.students s
  where s.institution_id = p_institution_id
  order by s.created_at desc;
end;
$$;

-- 7. TRIGGER: Webhook to Edge Function on Job Creation
-- =====================================================
-- Note: Replace <project-ref> with actual Supabase project reference
-- This trigger calls the Edge Function asynchronously when a job is created

create or replace function public.notify_job_created()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Call Edge Function via pg_net (async HTTP request)
  perform extensions.pg_net.http_post(
    url := current_setting('app.settings.edge_function_url', true) || '/process-job',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
    body := jsonb_build_object('job_id', new.id::text)
  );
  
  return new;
end;
$$;

create trigger on_job_created
  after insert on public.background_jobs
  for each row
  execute function public.notify_job_created();

-- 8. HELPER: Auto-update updated_at timestamp
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.background_jobs
  for each row
  execute function public.handle_updated_at();

-- 9. INITIAL CONFIGURATION SETTINGS
-- =====================================================
-- These should be set via environment variables in production
-- For local development, set them manually:
-- ALTER DATABASE postgres SET app.settings.encryption_key = 'your-secret-key';
-- ALTER DATABASE postgres SET app.settings.edge_function_url = 'http://localhost:54321/functions/v1';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
