import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsProfileForm } from '@/components/settings/settings-profile-form';
import { SettingsAppearance } from '@/components/settings/settings-appearance';
import { SettingsBilling } from '@/components/settings/settings-billing';
import { User, Palette, CreditCard } from 'lucide-react';

export default async function SettingsPage() {
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
    .select('status, stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Mock user profile data since we might not have a separate profile table yet
  // or we just use auth metadata
  const userData = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    email: user.email || '',
    avatar_url: user.user_metadata?.avatar_url || '',
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências, perfil e assinatura.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
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
        </TabsList>

        <TabsContent value="general">
          <SettingsProfileForm user={userData} />
        </TabsContent>

        <TabsContent value="appearance">
          <SettingsAppearance />
        </TabsContent>

        <TabsContent value="billing">
          <SettingsBilling isPro={isPro} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
