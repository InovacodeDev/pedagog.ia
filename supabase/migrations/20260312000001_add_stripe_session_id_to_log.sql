-- Add stripe_session_id column to ia_cost_log table
ALTER TABLE public.ia_cost_log 
ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE;

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_ia_cost_log_stripe_session_id ON public.ia_cost_log(stripe_session_id);
