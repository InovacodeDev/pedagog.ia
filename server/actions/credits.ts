'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function buyCreditsAction(amount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Minimum amount check (Stripe requires ~R$ 2.50 minimum usually, but let's assume the UI handles minimums or we set a safe minimum here)
  // For now, implementing strictly as requested.

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Créditos Pedagogi.ai',
            description: 'Créditos para uso de IA',
          },
          unit_amount: 100, // 100 cents = R$ 1.00
        },
        quantity: amount,
      },
    ],
    metadata: {
      userId: user.id,
      type: 'top_up',
      credit_amount: amount.toString(),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=invoices&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=invoices&canceled=true`,
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return { url: session.url };
}
