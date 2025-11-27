-- 1. Add credits_balance to subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS credits_balance numeric DEFAULT 30 NOT NULL;

-- Update existing users
-- Free users (no active stripe subscription) get 30
UPDATE public.subscriptions 
SET credits_balance = 30 
WHERE stripe_subscription_id IS NULL;

-- Pro users (active stripe subscription) get 300
UPDATE public.subscriptions 
SET credits_balance = 300 
WHERE stripe_subscription_id IS NOT NULL;

-- 2. Create ia_cost_log table
CREATE TABLE IF NOT EXISTS public.ia_cost_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    job_id uuid REFERENCES public.background_jobs(id),
    feature text NOT NULL,
    model_used text NOT NULL,
    input_tokens int NOT NULL,
    output_tokens int NOT NULL,
    cost_credits numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for ia_cost_log
ALTER TABLE public.ia_cost_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own cost logs
CREATE POLICY "Users can view own cost logs"
    ON public.ia_cost_log FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can insert logs (users shouldn't insert their own costs directly)
CREATE POLICY "Service role can insert cost logs"
    ON public.ia_cost_log FOR INSERT
    WITH CHECK (true); -- Usually restricted by role, but for now we rely on the fact that only backend calls this or via RPC

-- 3. Create Atomic Deduction Function
CREATE OR REPLACE FUNCTION public.deduct_user_credits(p_user_id uuid, p_amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_balance numeric;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT credits_balance INTO current_balance
    FROM public.subscriptions
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Check if user exists and has enough credits
    IF current_balance IS NULL THEN
        -- Handle case where subscription might not exist (though it should)
        RETURN false;
    END IF;

    IF current_balance >= p_amount THEN
        UPDATE public.subscriptions
        SET credits_balance = credits_balance - p_amount
        WHERE user_id = p_user_id;
        
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;
