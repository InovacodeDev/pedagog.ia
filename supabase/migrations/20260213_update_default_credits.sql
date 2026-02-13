-- Update default value for credits_balance
ALTER TABLE public.subscriptions 
ALTER COLUMN credits_balance SET DEFAULT 15;

-- Optional: Reset existing free users to 15 if they have 30 (from previous default)
-- This is a business decision, but safe to do if we want to enforce the new limit strictly.
-- Commented out to avoid messing with existing users unless explicitly requested, 
-- but the request implies "Basic plan will have 15 initial credits".
-- UPDATE public.subscriptions 
-- SET credits_balance = 15 
-- WHERE credits_balance = 30 AND stripe_subscription_id IS NULL;
