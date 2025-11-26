import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Helper type to ensure we have the fields we need, avoiding SDK version mismatches
type StripeSubscription = Stripe.Subscription & {
  current_period_end: number;
};
type StripeInvoice = Stripe.Invoice & {
  subscription: string | Stripe.Subscription | null;
};
import { NextResponse } from 'next/server';

function toISOString(timestamp: number | null | undefined): string | null {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log(`Processing Webhook: ${event.type}`, { id: event.id });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      // For 'stripe trigger', userId might be missing. We should log and return 200 to avoid retries if it's just a test without metadata.
      if (!userId) {
        console.warn('Webhook Warning: No userId in metadata (likely a test trigger)', session.id);
        return new NextResponse('No userId in metadata', { status: 200 });
      }

      console.log(`Processing subscription for user: ${userId}`);

      const subscriptionId = session.subscription as string;
      if (!subscriptionId) {
        console.error('Webhook Error: No subscriptionId in session');
        return new NextResponse('No subscriptionId', { status: 400 });
      }

      const subscription = (await stripe.subscriptions.retrieve(
        subscriptionId
      )) as unknown as StripeSubscription;

      let currentPeriodEnd = toISOString(subscription.current_period_end);
      if (!currentPeriodEnd) {
        console.warn('Webhook Warning: Missing current_period_end, defaulting to 30 days from now');
        // Default to 30 days from now if missing (e.g. test fixtures or specific plan types)
        currentPeriodEnd = new Date(Date.now() + 86400000 * 30).toISOString();
      }

      const { error } = await supabaseAdmin.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_current_period_end: currentPeriodEnd,
          status: subscription.status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.error('Supabase Upsert Error:', error);
        return new NextResponse('Database Error', { status: 500 });
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as StripeInvoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as unknown as StripeSubscription;
        const currentPeriodEnd = toISOString(subscription.current_period_end);

        if (currentPeriodEnd) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({
              stripe_price_id: subscription.items.data[0].price.id,
              stripe_current_period_end: currentPeriodEnd,
              status: subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('Error updating subscription (invoice):', error);
            return new NextResponse('Database Error', { status: 500 });
          }
        }
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as StripeSubscription;
      const currentPeriodEnd = toISOString(subscription.current_period_end);

      if (currentPeriodEnd) {
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_price_id: subscription.items.data[0].price.id,
            stripe_current_period_end: currentPeriodEnd,
            status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription (updated):', error);
          return new NextResponse('Database Error', { status: 500 });
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('Error canceling subscription:', error);
        return new NextResponse('Database Error', { status: 500 });
      }
    }
  } catch (err) {
    console.error('Webhook Handler Failed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
