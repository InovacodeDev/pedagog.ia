-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Create function to reset free tier credits
create or replace function public.renew_free_tier_credits()
returns void
language plpgsql
security definer
as $$
begin
  -- Update users without active/trialing subscriptions to have 15 credits
  -- This runs daily and checks if it's the monthly anniversary of their signup
  -- For months with fewer days, we cap the day at 28 to ensure it runs
  update public.subscriptions
  set credits_balance = 15
  where 
    (status is null or (status != 'active' and status != 'trialing'))
    and (
      extract(day from created_at) = extract(day from current_date)
      or 
      (extract(day from current_date) = 28 and extract(day from created_at) > 28)
    );
end;
$$;

-- Schedule the cron job to run daily at midnight
select cron.schedule(
  'renew_free_tier_credits_job',
  '0 0 * * *', -- Run at 00:00 every day
  'select public.renew_free_tier_credits();'
);
