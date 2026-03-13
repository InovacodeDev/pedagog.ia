'use server';

import { createClient } from '@/lib/supabase/server';
import { getSubscriptionPlan } from '@/lib/subscription';
import { UserProperties } from '@/lib/analytics-events';

export async function getUserAnalyticsProfile(): Promise<{
  userId: string | null;
  properties?: UserProperties;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { userId: null };
    }

    const [
      { count: classesCount },
      { count: examsCount },
      subscriptionData,
    ] = await Promise.all([
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('exams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      getSubscriptionPlan(),
    ]);

    const plan_type = subscriptionData.isPro ? 'pro' : 'free';
    const credits_balance = subscriptionData.subscription?.credits_balance ?? 0;

    return {
      userId: user.id,
      properties: {
        plan_type,
        classes_count: classesCount ?? 0,
        exams_count: examsCount ?? 0,
        credits_balance,
      },
    };
  } catch (error) {
    console.error('Failed to load user analytics profile:', error);
    return { userId: null };
  }
}
