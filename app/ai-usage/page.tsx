import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { ShieldCheck, Server, Cpu, FileCheck, Layers, Eye, Lock } from 'lucide-react';

export default function AIUsagePage() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-indigo-600 p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Cpu className="w-80 h-80" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4 opacity-90">
                  <ShieldCheck className="h-8 w-8 text-indigo-200" />
                  <span className="font-semibold tracking-wide uppercase text-sm text-indigo-200">Compliance & Ética</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display">
                  Uso Responsável da IA
                </h1>
                <p className="text-indigo-100 text-lg md:text-xl max-w-2xl">
                  Transparência radical sobre como nossa Inteligência Artificial interage com seus dados e conteúdos.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="prose prose-slate max-w-none prose-lg prose-headings:text-slate-900 prose-headings:font-display prose-p:text-slate-600 prose-li:text-slate-600">
                
                <p className="lead text-lg leading-relaxed">
                  A Pedagog.IA adota uma política de <strong>Tolerância Zero</strong> para o uso indevido de dados. Nossa arquitetura foi desenhada sob o princípio de <em>Privacy by Design</em>, garantindo que a inovação nunca custe a segurança da sua instituição.
                </p>

                <hr className="border-slate-100 my-10" />

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Princípios Fundamentais
                </h3>

                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Dados Isolados (Siloing)</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Seus dados existem em um ambiente lógico isolado. A IA <strong>não mistura</strong> o contexto de uma escola com o de outra.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Treinamento Vedado</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Nenhum dado seu ou de seus alunos é utilizado para <strong>treinar ou &quot;ensinar&quot;</strong> os modelos de IA públicos.
                    </p>
                  </div>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Política de Dados de Entrada
                </h3>
                
                <p className="mb-6">
                  Para gerar provas, planos de aula ou corrigir atividades, o sistema fragmenta e, sempre que possível, <strong>anonimiza as informações</strong> antes de enviá-las para processamento via API.
                </p>

                <div className="my-8 border border-slate-200 rounded-xl overflow-hidden shadow-sm not-prose">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-bold text-slate-900 w-1/2">✅ O que a IA Processa</th>
                        <th className="p-4 font-bold text-slate-900 w-1/2">❌ O que a IA NUNCA Vê</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-4 text-slate-700">Tópicos Pedagógicos (ex: &quot;História do Brasil&quot;)</td>
                        <td className="p-4 text-slate-700 font-medium bg-red-50/50">Nomes Próprios (Alunos/Professores)</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-700">Nível Escolar e Dificuldade</td>
                        <td className="p-4 text-slate-700 font-medium bg-red-50/50">E-mails, CPFs ou Matrículas</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-700">Gabaritos e Respostas Escritas</td>
                        <td className="p-4 text-slate-700 font-medium bg-red-50/50">Metadados de Geolocalização</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-700">Imagens de Provas (Corte na área da resposta)</td>
                        <td className="p-4 text-slate-700 font-medium bg-red-50/50">Rostos ou Biometria Facial</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Parceiros de IA e Segurança
                </h3>
                <p className="mb-6">
                  Utilizamos provedores de LLM (Large Language Models) de classe empresarial, especificamente <strong>OpenAI Enterprise</strong> e <strong>Google Vertex AI</strong>.
                </p>
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-lg not-prose">
                  <p className="text-indigo-900 font-medium flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" /> Garantia Contratual
                  </p>
                  <p className="text-indigo-800 text-sm">
                    Nossos contratos com estes parceiros incluem cláusulas restritivas (Zero Data Retention para treinamento) que <strong>proíbem explicitamente</strong> o uso de dados enviados via API para o aprendizado de seus modelos.
                  </p>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Supervisão Humana
                </h3>
                <p>
                  A IA do Pedagog.IA é projetada como uma ferramenta de suporte à decisão (&quot;Copiloto&quot;).
                </p>
                <div className="flex items-start gap-3 bg-amber-50 p-5 rounded-lg border border-amber-100 not-prose">
                  <Eye className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                     <h4 className="font-bold text-amber-900 text-sm">Responsabilidade Final</h4>
                     <p className="text-amber-800 text-sm mt-1 leading-relaxed">
                       A validação final do conteúdo pedagógico é sempre responsabilidade do profissional de educação. Encorajamos a revisão crítica de todo material gerado para evitar vieses não intencionais ou imprecisões factuais.
                     </p>
                  </div>
                </div>

                <div className="mt-16 p-8 bg-slate-900 rounded-2xl flex flex-col md:flex-row gap-6 items-center text-white shadow-xl not-prose">
                  <div className="bg-indigo-500/20 p-4 rounded-full">
                    <Server className="h-8 w-8 text-indigo-300 flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">Infraestrutura de Classe Mundial</h4>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                      Seus dados residem em servidores com certificação <strong>SOC 2 Type II</strong>. Utilizamos criptografia de ponta a ponta: <strong>AES-256</strong> para dados em repouso e <strong>TLS 1.3</strong> para dados em trânsito.
                    </p>
                  </div>
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
