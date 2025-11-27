-- =====================================================
-- PEDAGOGI.AI SEED DATA (DEV ONLY)
-- ⚠️  WARNING: DO NOT RUN IN PRODUCTION
-- =====================================================
-- This script populates the local Supabase instance with test data
-- for immediate testing of the ValidationDeck and StudentList features.

-- Set the encryption key for this session
set app.settings.encryption_key = 'dev-secret-key-2024';

-- 1. CREATE TEST USER IN AUTH SCHEMA
-- =====================================================
-- Note: In production, users are created via Supabase Auth API
-- For local testing, we insert directly into auth.users

do $$
declare
  test_user_id uuid := '550e8400-e29b-41d4-a716-446655440000';
  test_institution_id uuid := '660e8400-e29b-41d4-a716-446655440000';
begin
  -- Insert test user (if not exists)
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) values (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teacher@demo.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Professor Demo"}'::jsonb,
    false,
    '',
    '',
    ''
  ) on conflict (id) do nothing;

  -- 2. CREATE PROFILE (REMOVED - Table Dropped)
  -- =====================================================
  -- insert into public.profiles (
  --   id,
  --   institution_id,
  --   role,
  --   full_name
  -- ) values (
  --   test_user_id,
  --   test_institution_id,
  --   'teacher',
  --   'Professor Demo'
  -- ) on conflict (id) do nothing;

  -- 3. CREATE ENCRYPTED STUDENTS
  -- =====================================================
  insert into public.students (institution_id, encrypted_name, grade_level)
  values
    (test_institution_id, extensions.pgp_sym_encrypt('Enzo Gabriel Silva', 'dev-secret-key-2024'), '6º Ano'),
    (test_institution_id, extensions.pgp_sym_encrypt('Valentina Oliveira', 'dev-secret-key-2024'), '6º Ano'),
    (test_institution_id, extensions.pgp_sym_encrypt('João Miguel Santos', 'dev-secret-key-2024'), '7º Ano'),
    (test_institution_id, extensions.pgp_sym_encrypt('Maria Eduarda Costa', 'dev-secret-key-2024'), '7º Ano'),
    (test_institution_id, extensions.pgp_sym_encrypt('Pedro Henrique Lima', 'dev-secret-key-2024'), '8º Ano')
  on conflict do nothing;

  -- 4. CREATE COMPLETED BACKGROUND JOB (For Testing ValidationDeck)
  -- =====================================================
  -- insert into public.background_jobs (
  --   id,
  --   user_id,
  --   job_type,
  --   payload,
  --   status,
  --   result,
  --   created_at,
  --   updated_at
  -- ) values (
  --   '770e8400-e29b-41d4-a716-446655440000',
  --   test_user_id,
  --   'ocr_correction',
  --   jsonb_build_object(
  --     'image_url', 'https://placehold.co/800x1200/indigo/white?text=Prova+Matematica',
  --     'exam_id', gen_random_uuid()
  --   ),
  --   'completed',
  --   jsonb_build_object(
  --     'total_questions', 10,
  --     'confidence', 0.92,
  --     'answers', jsonb_build_array(
  --       jsonb_build_object('question', 1, 'score', 1.0, 'correct', true, 'confidence', 0.95),
  --       jsonb_build_object('question', 2, 'score', 0.5, 'correct', false, 'confidence', 0.88),
  --       jsonb_build_object('question', 3, 'score', 1.0, 'correct', true, 'confidence', 0.97),
  --       jsonb_build_object('question', 4, 'score', 1.0, 'correct', true, 'confidence', 0.91),
  --       jsonb_build_object('question', 5, 'score', 0.0, 'correct', false, 'confidence', 0.85),
  --       jsonb_build_object('question', 6, 'score', 1.0, 'correct', true, 'confidence', 0.93),
  --       jsonb_build_object('question', 7, 'score', 1.0, 'correct', true, 'confidence', 0.96),
  --       jsonb_build_object('question', 8, 'score', 0.5, 'correct', false, 'confidence', 0.79),
  --       jsonb_build_object('question', 9, 'score', 1.0, 'correct', true, 'confidence', 0.94),
  --       jsonb_build_object('question', 10, 'score', 1.0, 'correct', true, 'confidence', 0.98)
  --     ),
  --     'suggested_score', 8.5
  --   ),
  --   now() - interval '5 minutes',
  --   now() - interval '2 minutes'
  -- ) on conflict (id) do nothing;

  -- 5. CREATE PENDING JOB (For Testing Job Monitor)
  -- =====================================================
  -- insert into public.background_jobs (
  --   user_id,
  --   job_type,
  --   payload,
  --   status
  -- ) values (
  --   test_user_id,
  --   'ocr_correction',
  --   jsonb_build_object(
  --     'image_url', 'https://placehold.co/800x1200/teal/white?text=Prova+Portugues'
  --   ),
  --   'pending'
  -- ) on conflict do nothing;

end $$;

-- =====================================================
-- VERIFICATION QUERIES (Run these to verify seed data)
-- =====================================================

-- Check profiles
-- SELECT * FROM public.profiles;

-- Check students (encrypted)
-- SELECT id, grade_level, created_at FROM public.students;

-- Check decrypted students (using RPC)
-- SELECT * FROM public.get_students_decrypted('660e8400-e29b-41d4-a716-446655440000');

-- Check jobs
-- SELECT id, job_type, status, created_at FROM public.background_jobs;

-- =====================================================
-- END OF SEED SCRIPT
-- =====================================================
