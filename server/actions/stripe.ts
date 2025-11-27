'use server';
import { Tables } from '@/types/database';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function createCheckoutSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check metadata for customer ID
  let customerId = user.user_metadata?.stripe_customer_id;

  if (!customerId) {
    // Fallback: Check DB (in case metadata is out of sync or not set yet)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const sub = subscription as unknown as Tables<'subscriptions'> | null;
    customerId = sub?.stripe_customer_id;
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;

    // 1. Save to Auth Metadata (Fast Access)
    await supabase.auth.updateUser({
      data: { stripe_customer_id: customerId },
    });

    // 2. Save to DB (Legacy/Webhook support)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('subscriptions') as any).upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
      },
      { onConflict: 'user_id' }
    );
  }

  const origin =
    (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_PRO,
        quantity: 1,
      },
    ],
    success_url: `${origin}/settings?success=true`,
    cancel_url: `${origin}/settings?canceled=true`,
    metadata: {
      userId: user.id,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return { url: session.url };
}

export async function createPortalSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const sub = subscription as unknown as Tables<'subscriptions'> | null;

  if (!sub?.stripe_customer_id) {
    throw new Error('No subscription found');
  }

  const origin =
    (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/settings`,
  });

  return { url: session.url };
}
