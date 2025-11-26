-- Create subscriptions table
create table if not exists public.subscriptions (
  user_id uuid references auth.users not null primary key,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  stripe_current_period_end timestamptz,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Create policies
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role has full access"
  on public.subscriptions for all
  using (true)
  with check (true);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute procedure public.handle_updated_at();
