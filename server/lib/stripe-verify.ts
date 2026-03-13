import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Verifies a Stripe Checkout Session and processes the payment/subscription
 * if it hasn't been processed yet. This ensures real-time updates for the user
 * while maintaining idempotency with the webhook.
 */
export async function verifyAndProcessStripeSession(sessionId: string, userId: string): Promise<void> {
  const supabase = createAdminClient();

  // 1. Check if session already processed in ia_cost_log
  const { data: existingLog, error: checkError } = await supabase
    .from('ia_cost_log')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking existing session log:', checkError);
    throw new Error('Database verification failed');
  }

  if (existingLog) {
    console.log(`Session ${sessionId} already processed, skipping.`);
    return;
  }

  // 2. Retrieve session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    console.log(`Session ${sessionId} not paid yet (status: ${session.payment_status})`);
    return;
  }

  // Security check: Ensure userId matches session metadata
  if (session.metadata?.userId !== userId) {
    console.error(`Security Warning: Session ${sessionId} userId mismatch. Expected ${userId}, got ${session.metadata?.userId}`);
    throw new Error('Unauthorized session verification');
  }

  // 3. Process based on session type
  if (session.metadata?.type === 'top_up') {
    await processTopUp(sessionId, userId, session);
  } else if (session.mode === 'subscription') {
    await processSubscription(sessionId, userId, session);
  }
}

async function processTopUp(sessionId: string, userId: string, session: Stripe.Checkout.Session): Promise<void> {
  const supabase = createAdminClient();
  const creditAmount = parseInt(session.metadata?.credit_amount || '0', 10);

  if (creditAmount <= 0) return;

  console.log(`Processing real-time top-up for user ${userId}: ${creditAmount} credits`);

  // Add credits atomically
  const { error: rpcError } = await supabase.rpc('deduct_user_credits', {
    p_user_id: userId,
    p_amount: -creditAmount,
  });

  if (rpcError) {
    console.error('Error adding credits in real-time:', rpcError);
    throw new Error('Failed to update credits');
  }

  // Log transaction with session ID for idempotency
  await supabase.from('ia_cost_log').insert({
    user_id: userId,
    feature: 'credit_purchase',
    model_used: 'stripe_topup',
    input_tokens: 0,
    output_tokens: 0,
    cost_credits: -creditAmount,
    stripe_session_id: sessionId,
  });
}

function toISOString(timestamp: number | null | undefined): string {
  if (!timestamp) return new Date().toISOString(); // Fallback to now
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

// Helper type to ensure we have the fields we need, avoiding SDK version mismatches
type StripeSubscription = Stripe.Subscription & {
  current_period_end: number;
};

async function processSubscription(sessionId: string, userId: string, session: Stripe.Checkout.Session): Promise<void> {
  const supabase = createAdminClient();
  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    throw new Error('No subscription ID found in session');
  }

  console.log(`Processing real-time subscription for user ${userId}`);

  const response = await stripe.subscriptions.retrieve(subscriptionId);
  
  if ('deleted' in response) {
    throw new Error('Subscription was deleted');
  }

  const subscription = response as unknown as StripeSubscription;
  const currentPeriodEnd = toISOString(subscription.current_period_end);
  const priceId = subscription.items.data[0].price.id;

  // 1. Update/Upsert Subscription
  const { error: upsertError } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: priceId,
      stripe_current_period_end: currentPeriodEnd,
      status: subscription.status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertError) {
    console.error('Error upserting subscription in real-time:', upsertError);
    throw new Error('Failed to update subscription');
  }

  // 2. Add initial credits if active
  if (subscription.status === 'active') {
    const MONTHLY_CREDITS = 100;
    
    const { error: rpcError } = await supabase.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: -MONTHLY_CREDITS,
    });

    if (rpcError) {
        console.error('Error adding subscription credits in real-time:', rpcError);
        // We don't throw here to avoid failing the whole process if credits fail after sub update
    }

    // 3. Log with session ID
    await supabase.from('ia_cost_log').insert({
      user_id: userId,
      feature: 'subscription_activated',
      model_used: 'plan_pro',
      input_tokens: 0,
      output_tokens: 0,
      cost_credits: -MONTHLY_CREDITS,
      stripe_session_id: sessionId,
    });
  }
}
