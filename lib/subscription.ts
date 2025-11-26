import { createClient } from '@/lib/supabase/server';
import { Tables } from '@/types/database';

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!subscription) {
    return false;
  }

  const sub = subscription as Tables<'subscriptions'>;

  const isValid =
    (sub.status === 'active' || sub.status === 'trialing') &&
    sub.stripe_current_period_end &&
    new Date(sub.stripe_current_period_end).getTime() + DAY_IN_MS > Date.now();

  return !!isValid;
};

export const getSubscriptionPlan = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isPro: false,
      subscription: null,
      isCanceled: false,
    };
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!subscription) {
    return {
      isPro: false,
      subscription: null,
      isCanceled: false,
    };
  }

  const sub = subscription as Tables<'subscriptions'>;

  // Check if subscription is active or trialing
  // AND the current period end is in the future
  const isPro =
    (sub.status === 'active' || sub.status === 'trialing') &&
    sub.stripe_current_period_end &&
    new Date(sub.stripe_current_period_end).getTime() + DAY_IN_MS > Date.now();

  const isCanceled = sub.status === 'canceled';

  return {
    isPro,
    subscription: sub,
    isCanceled,
  };
};
