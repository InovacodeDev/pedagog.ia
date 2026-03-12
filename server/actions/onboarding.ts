'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function initializeUserAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Não autenticado' };
  }

  // Verifica se a assinatura já existe
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, credits_balance')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingSub) {
    // Conta já inicializada
    return { success: true, message: 'Conta já configurada' };
  }

  try {
    // 1. Cria o cliente no Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    const customerId = customer.id;

    // 2. Salva no auth metadata para acesso rápido
    await supabase.auth.updateUser({
      data: { stripe_customer_id: customerId },
    });

    // 3. Cria a assinatura com 15 créditos iniciais gratuitos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from('subscriptions') as any).insert({
      user_id: user.id,
      stripe_customer_id: customerId,
      credits_balance: 15,
      status: 'free',
    });

    if (insertError) {
      console.error('Erro ao inserir assinatura inicial:', insertError);
      return { success: false, message: 'Erro ao configurar conta' };
    }

    return { success: true, message: 'Conta configurada com sucesso' };
  } catch (error) {
    console.error('Erro no onboarding:', error);
    return { success: false, message: 'Erro ao criar cliente Stripe' };
  }
}
