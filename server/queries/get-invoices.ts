'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export interface Invoice {
  id: string;
  amount: number;
  date: number;
  pdfUrl: string | null;
  status: string | null;
}

export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  const supabase = await createClient();

  // 1. Get User & Metadata (Faster than DB query)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    // Basic security check: ensure we are fetching for the logged-in user
    console.warn('Unauthorized invoice fetch attempt', { requested: userId, actual: user?.id });
    return [];
  }

  const customerId = user.user_metadata?.stripe_customer_id;

  if (!customerId) {
    console.warn('No stripe_customer_id found in metadata for user', userId);
    return [];
  }

  try {
    // 2. List invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
      status: 'paid',
    });

    // 3. Map to simplified object
    return invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100,
      date: invoice.created * 1000,
      pdfUrl: invoice.hosted_invoice_url || null,
      status: invoice.status,
    }));
  } catch (err) {
    console.error('Error fetching invoices from Stripe:', err);
    return [];
  }
}
