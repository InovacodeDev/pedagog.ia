import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsProfileForm } from '@/components/settings/settings-profile-form';
import { SettingsAppearance } from '@/components/settings/settings-appearance';
import { SettingsBilling } from '@/components/settings/settings-billing';
import { User, Palette, CreditCard, Receipt, Coins } from 'lucide-react';
import { SubscriptionDetails } from '@/types/app';
import { getUserInvoices } from '@/server/queries/get-invoices';
import { InvoicesList } from '@/components/settings/invoices-list';
import { getCreditUsage, getCreditBalance } from '@/server/queries/get-credit-usage';
import { CreditUsageList } from '@/components/settings/credit-usage-list';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tab = typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'general';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, stripe_customer_id, stripe_subscription_id, stripe_current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const sub = subscription as unknown as SubscriptionDetails;
  const isPro = sub?.status === 'active' || sub?.status === 'trialing';

  let subscriptionData = null;
  if (sub) {
    subscriptionData = {
      status: sub.status || 'inactive',
      current_period_end: sub.stripe_current_period_end || '',
      cancel_at_period_end: false,
    };

    if (sub.stripe_subscription_id) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stripeSub: any = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        subscriptionData.cancel_at_period_end = stripeSub.cancel_at_period_end;
        subscriptionData.status = stripeSub.status;
        const endDate = stripeSub.cancel_at || stripeSub.current_period_end;
        if (endDate) {
          subscriptionData.current_period_end = new Date(endDate * 1000).toISOString();
        }
      } catch (error) {
        console.error('Error fetching stripe subscription:', error);
      }
    }
  }

  // Use auth metadata for user profile data
  const userData = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    email: user.email || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    school_name: user.user_metadata?.school_name || '',
    disciplines: user.user_metadata?.disciplines || [],
  };

  // Fetch invoices
  const invoices = await getUserInvoices(user.id);

  // Fetch credit usage
  const creditLogs = await getCreditUsage();
  const creditBalance = await getCreditBalance();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências, perfil e assinatura.</p>
      </div>

      <Tabs defaultValue={tab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" /> Geral
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> Aparência
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" /> Assinatura
          </TabsTrigger>
          <TabsTrigger value="credits" className="gap-2">
            <Coins className="h-4 w-4" /> Extrato de Crédito
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <Receipt className="h-4 w-4" /> Faturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsProfileForm user={userData} />
        </TabsContent>

        <TabsContent value="appearance">
          <SettingsAppearance />
        </TabsContent>

        <TabsContent value="billing">
          <SettingsBilling isPro={isPro} subscription={subscriptionData} />
        </TabsContent>

        <TabsContent value="credits">
          <CreditUsageList logs={creditLogs} balance={creditBalance} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesList invoices={invoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
