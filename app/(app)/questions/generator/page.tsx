import { GeneratorForm } from '@/components/questions/generator-form';
import { getSubscriptionPlan } from '@/lib/subscription';

export const maxDuration = 60; // Configuração para a página esperar até 60s pelo AI (Limite Pro da Vercel)

export default async function GeneratorPage() {
  const { isPro } = await getSubscriptionPlan();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Gerador de Questões</h1>
        <p className="text-muted-foreground">
          Crie questões personalizadas com Inteligência Artificial alinhadas à BNCC.
        </p>
      </div>

      <GeneratorForm isPro={!!isPro} />
    </div>
  );
}
