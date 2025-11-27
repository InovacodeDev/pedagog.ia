alter table "public"."questions" add column if not exists "explanation" text;
alter table "public"."questions" add column if not exists "discipline" text;
alter table "public"."questions" add column if not exists "subject" text;
alter table "public"."questions" add column if not exists "options" jsonb;
