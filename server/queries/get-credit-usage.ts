import { createClient } from '@/lib/supabase/server';

export type CreditUsageLog = {
  id: string;
  feature: string;
  model_used: string;
  input_tokens: number;
  output_tokens: number;
  cost_credits: number;
  created_at: string;
};

export async function getCreditUsage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: logs, error } = await supabase
    .from('ia_cost_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching credit usage logs:', error);
    return [];
  }

  return logs as CreditUsageLog[];
}

export async function getCreditBalance() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('credits_balance')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching credit balance:', error);
    return 0;
  }

  return (subscription as { credits_balance: number })?.credits_balance || 0;
}
