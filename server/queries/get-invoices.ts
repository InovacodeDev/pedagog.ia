'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export interface Invoice {
  id: string;
  amount: number;
  date: number;
  pdfUrl: string | null;
  status: string | null;
  type: 'subscription' | 'payment';
}

export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    console.warn('Unauthorized invoice fetch attempt', { requested: userId, actual: user?.id });
    return [];
  }

  const customerId = user.user_metadata?.stripe_customer_id;

  if (!customerId) {
    console.warn('No stripe_customer_id found for user', userId);
    return [];
  }

  try {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 5,
    });

    const chargeItems: Invoice[] = charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount / 100,
      date: charge.created * 1000,
      pdfUrl: charge.receipt_url || null,
      status: charge.status === 'succeeded' ? 'paid' : charge.status,
      type: 'payment',
    }));

    const allTransactions = chargeItems;

    return allTransactions;
  } catch (err) {
    console.error('Error fetching transactions from Stripe:', err);
    return [];
  }
}
