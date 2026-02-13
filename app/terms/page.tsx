import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Scale, FileText, Gavel, ShieldAlert, BadgeCheck, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-indigo-950 p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Gavel className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4 opacity-90">
                  <Scale className="h-6 w-6 text-indigo-300" />
                  <span className="font-semibold tracking-wide uppercase text-sm text-indigo-300">
                    Termos Legais
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display">
                  Termos de Uso e Serviço
                </h1>
                <p className="text-indigo-200 text-lg md:text-xl max-w-2xl">
                  As regras do jogo. Transparência total sobre seus direitos e deveres ao utilizar o
                  Pedagog.IA.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:font-display prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
                <div className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-indigo-600 dark:border-indigo-400 p-6 rounded-r-lg mb-12 not-prose shadow-sm">
                  <p className="text-sm text-indigo-900 dark:text-indigo-300 mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" /> Resumo Executivo
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    Ao utilizar o Pedagog.IA, você concorda que o{' '}
                    <strong>conteúdo gerado é de sua propriedade</strong>, mas a tecnologia é nossa.
                    A IA é uma ferramenta de auxílio (&quot;Copiloto&quot;) e{' '}
                    <strong>não substitui sua revisão profissional</strong>.
                  </p>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Definições e Aceitação
                </h3>
                <p className="mb-4">
                  Estes Termos de Uso (&quot;Termos&quot;) regem a relação contratual entre o{' '}
                  <strong>PEDAGOG.IA TECNOLOGIA EDUCACIONAL LTDA</strong> (&quot;Nós&quot;,
                  &quot;Plataforma&quot;) e você, usuário (&quot;Você&quot;, &quot;Professor&quot;,
                  &quot;Escola&quot;).
                </p>
                <p className="mb-6">
                  Ao criar uma conta, você declara ter lido e aceitado estes termos. Se você
                  representa uma escola, declara ter poderes legais para vinculá-la a este contrato.
                </p>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Licença de Uso
                </h3>
                <p className="mb-6">
                  Concedemos uma licença (SaaS) limitada, não exclusiva e revogável.
                </p>
                <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                  <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-100 dark:border-green-900/50">
                    <p className="font-bold text-green-800 dark:text-green-300 text-sm mb-2">
                      ✅ Permitido
                    </p>
                    <p className="text-green-700 dark:text-green-200/80 text-sm leading-relaxed">
                      Criar provas, planejar aulas, corrigir atividades escolares.
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-100 dark:border-red-900/50">
                    <p className="font-bold text-red-800 dark:text-red-300 text-sm mb-2">
                      ❌ Proibido
                    </p>
                    <p className="text-red-700 dark:text-red-200/80 text-sm leading-relaxed">
                      Revender seu login (sublocação), engenharia reversa, uso para fins ilícitos.
                    </p>
                  </div>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Propriedade Intelectual
                </h3>

                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                      <Scale className="w-5 h-5" /> Nossa Tecnologia
                    </h4>
                    <p className="text-sm text-indigo-800 dark:text-indigo-200/80 leading-relaxed">
                      O software, o código-fonte, os algoritmos de correção e a interface visual são
                      propriedade exclusiva do Pedagog.IA.
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300 mb-2">
                      <FileText className="w-5 h-5" /> Seu Conteúdo
                    </h4>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200/80 leading-relaxed">
                      <strong>Você é o dono</strong> das provas e materiais que criar. Você tem
                      liberdade total para imprimir, distribuir ou vender o material didático
                      gerado.
                    </p>
                  </div>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  Limitações da IA (Disclaimer)
                </h3>
                <p className="mb-6">
                  Utilizamos Inteligência Artificial Generativa de ponta. No entanto, a tecnologia
                  pode falhar.
                </p>
                <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg border border-amber-200 dark:border-amber-800/50 not-prose mb-8">
                  <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      Supervisão Obrigatória
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200/80 text-sm mt-1 leading-relaxed">
                      A IA pode apresentar &quot;alucinações&quot; (erros factuais com alta
                      confiança). É sua responsabilidade exclusiva revisar todo o conteúdo antes de
                      aplicá-lo em sala de aula.
                    </p>
                  </div>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    5
                  </span>
                  Responsabilidades e Indenização
                </h3>
                <p className="mb-6">
                  O serviço é fornecido &quot;como está&quot; (as is). Não nos responsabilizamos por
                  danos indiretos ou lucros cessantes. Nossa responsabilidade financeira limita-se
                  ao valor total pago por você nos últimos 12 meses.
                </p>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    6
                  </span>
                  Privacidade
                </h3>
                <p className="mb-6">
                  Tratamos seus dados conforme a <strong>LGPD</strong>. Para detalhes sobre coleta,
                  armazenamento e direitos, consulte nossa{' '}
                  <a
                    href="/privacy"
                    className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-2"
                  >
                    Política de Privacidade
                  </a>
                  .
                </p>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    7
                  </span>
                  Pagamentos e Cancelamento
                </h3>
                <ul className="space-y-3 marker:text-indigo-500 mb-8">
                  <li>
                    <strong>Assinatura:</strong> Renovação automática mensal ou anual.
                  </li>
                  <li>
                    <strong>Cancelamento:</strong> Pode ser feito a qualquer momento no painel. O
                    acesso permanece até o fim do ciclo pago.
                  </li>
                  <li>
                    <strong>Arrependimento:</strong> Reembolso total em até 7 dias após a primeira
                    compra (Art. 49 do CDC).
                  </li>
                </ul>

                <div className="mt-16 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 mb-4 shadow-sm">
                    <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Suporte Jurídico
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Questões sobre contratos corporativos ou termos específicos?
                  </p>
                  <a
                    href="mailto:legal@pedagog.ia"
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                  >
                    Fale com o Legal
                  </a>
                  <p className="text-slate-400 mt-6 text-xs font-mono">
                    Versão 2.2 • São Paulo, SP - {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
