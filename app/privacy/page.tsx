import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Shield, Lock, Eye, Database, Cookie, FileCheck, Server, Globe2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-slate-900 p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4 opacity-90">
                  <Lock className="h-6 w-6 text-emerald-400" />
                  <span className="font-semibold tracking-wide uppercase text-sm text-emerald-400">
                    Política de Privacidade Global
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display">
                  Proteção de Dados e Privacidade
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-2xl">
                  Compromisso inegociável com a segurança. Em total conformidade com a{' '}
                  <strong>LGPD (Lei 13.709/18)</strong> e <strong>GDPR</strong>.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="prose prose-slate max-w-none prose-lg prose-headings:font-display prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
                <p className="lead text-lg leading-relaxed mb-8">
                  Esta Política de Privacidade descreve de forma transparente e detalhada as
                  práticas de tratamento de dados pessoais realizadas pelo{' '}
                  <strong>PEDAGOG.IA TECNOLOGIA EDUCACIONAL LTDA</strong>.
                  <br />
                  <br />
                  Estamos comprometidos em proteger a privacidade de <strong>
                    professores
                  </strong>, <strong>gestores escolares</strong> e, crucialmente, dos{' '}
                  <strong>alunos</strong>, adotando as melhores práticas internacionais de{' '}
                  <em>Information Security</em> (InfoSec).
                </p>

                <hr className="border-slate-100 my-10" />

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Controlador e Encarregado (DPO)
                </h3>

                <p className="mb-4">
                  Para os fins da legislação aplicável, o <strong>Controlador</strong> dos seus
                  dados cadastrais (como professor ou gestor) é a <strong>Pedagog.IA</strong>.
                </p>
                <p className="mb-6">
                  Acreditamos em canais abertos. Para quaisquer dúvidas, requisições ou exercícios
                  de direitos, disponibilizamos acesso direto ao nosso escritório de privacidade e
                  ao Encarregado de Proteção de Dados (DPO):
                </p>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 not-prose mb-10">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-bold text-slate-900">Escritório de Privacidade & DPO</p>
                    <p className="text-sm text-slate-500 mb-1">
                      Responsável pela supervisão e compliance.
                    </p>
                    <a
                      href="mailto:dpo@pedagog.ia"
                      className="text-indigo-600 font-medium hover:underline flex items-center justify-center sm:justify-start gap-2"
                    >
                      dpo@pedagog.ia
                    </a>
                  </div>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Dados Coletados e Finalidade
                </h3>

                <p className="mb-6">
                  Nossa coleta de dados segue estritamente o princípio da{' '}
                  <strong>minimização</strong>. Coletamos apenas o necessário para a{' '}
                  <strong>execução do contrato</strong> (Art. 7º, V da LGPD) e{' '}
                  <strong>legítimo interesse</strong> (Art. 7º, IX da LGPD):
                </p>

                <div className="grid md:grid-cols-2 gap-6 not-prose mb-12">
                  <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-500" />
                      Dados de Cadastro
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                      <li>
                        <strong>Identificação:</strong> Nome completo, CPF (apenas para
                        faturamento).
                      </li>
                      <li>
                        <strong>Contato:</strong> E-mail corporativo ou pessoal.
                      </li>
                      <li>
                        <strong>Contexto:</strong> Escola ou Instituição vinculada.
                      </li>
                    </ul>
                  </div>
                  <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-indigo-500" />
                      Dados de Navegação
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                      <li>
                        <strong>Técnicos:</strong> Endereço IP e Tipo de navegador.
                      </li>
                      <li>
                        <strong>Segurança:</strong> Logs de acesso para auditoria.
                      </li>
                      <li>
                        <strong>Uso:</strong> Métricas de interação para melhoria de UX.
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Tratamento de Dados de Alunos
                </h3>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 my-8 not-prose rounded-r-lg">
                  <p className="font-bold text-amber-900 mb-2 uppercase text-xs tracking-wider">
                    Distinção Importante
                  </p>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Nesta relação, o Pedagog.IA atua como <strong>Operador (Processor)</strong> e
                    você (Escola/Professor) atua como <strong>Controlador (Controller)</strong>.
                  </p>
                </div>

                <p className="mb-4">
                  Ao utilizar nossas ferramentas, você garante que possui autorização legal para
                  inserir dados de alunos. Para proteção máxima, recomendamos:
                </p>
                <ul className="mb-10">
                  <li className="mb-2">
                    <strong>Anonimização na Origem:</strong> Evite utilizar nomes completos. Prefira
                    identificadores (Ex: &quot;Aluno 14B&quot;) ou apenas iniciais.
                  </li>
                  <li>
                    <strong>Dados Sensíveis:</strong> É <strong>proibido</strong> inserir dados
                    sensíveis (saúde, biometria, religião) de menores de idade na plataforma.
                  </li>
                </ul>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  Compartilhamento e Subprocessadores
                </h3>

                <p className="font-medium text-slate-900 mb-4">
                  Nós <strong>NUNCA</strong> vendemos seus dados (&quot;Selling of Data&quot;) para
                  anunciantes ou terceiros.
                </p>
                <p className="mb-6">
                  Compartilhamos dados estritamente com parceiros tecnológicos de classe mundial
                  (Subprocessadores) necessários para a operação do serviço:
                </p>

                <div className="overflow-hidden border border-slate-200 rounded-lg not-prose mb-10">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Parceiro
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Finalidade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          Cloud & Database
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">Supabase (AWS)</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          Hospedagem segura e criptografada.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">Pagamentos</td>
                        <td className="px-6 py-4 text-sm text-slate-600">Stripe</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          Processamento financeiro PCI-DSS.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          Inteligência Artificial
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">OpenAI / Google Vertex</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          Processamento sob contratos &quot;Enterprise&quot; (Zero Retention).
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    5
                  </span>
                  Seus Direitos (Art. 18 LGPD)
                </h3>

                <p className="mb-6">
                  Você tem total controle sobre seus dados. Garantimos o exercício facilitado dos
                  seguintes direitos:
                </p>

                <ul className="space-y-4 marker:text-indigo-500 mb-10">
                  <li>
                    <strong>Acesso e Confirmação:</strong> Saber se e quais dados tratamos.
                  </li>
                  <li>
                    <strong>Correção:</strong> Retificar dados incompletos, inexatos ou
                    desatualizados.
                  </li>
                  <li>
                    <strong>Anonimização/Bloqueio:</strong> Solicitar suspensão de tratamento de
                    dados desnecessários.
                  </li>
                  <li>
                    <strong>Portabilidade:</strong> Transferir seus dados para outro fornecedor (com
                    formato interoperável).
                  </li>
                  <li>
                    <strong>Eliminação:</strong> Excluir seus dados, exceto quando a lei exigir a
                    guarda.
                  </li>
                </ul>

                <h3 className="flex items-center gap-2 mt-12 mb-6">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    6
                  </span>
                  Segurança e Transferência Internacional
                </h3>

                <p className="mb-6">
                  Adotamos uma postura de <em>Defense in Depth</em> (Defesa em Profundidade).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mb-10">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      Criptografia AES-256 (Repouso)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <Globe2 className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      Transport Layer Security (TLS 1.3)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <Server className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      Backups Diários e Redundantes
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <FileCheck className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      Logs de Auditoria Imutáveis
                    </span>
                  </div>
                </div>

                <p className="mb-4">
                  Poderemos realizar transferência internacional de dados para servidores nos
                  Estados Unidos, necessária para a infraestrutura de nuvem. Tais transferências são
                  regidas por <strong>Cláusulas Contratuais Padrão (SCCs)</strong> que asseguram
                  nível de proteção compatível com a legislação brasileira.
                </p>

                <div className="mt-16 pt-8 border-t border-slate-200 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                    <Cookie className="h-6 w-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Política de Cookies</h4>
                  <p className="text-sm text-slate-500 max-w-lg mx-auto mb-6">
                    Utilizamos apenas cookies essenciais para autenticação e segurança (Sessão).
                    Cookies de análise são opcionais e agregados anonimamente.
                  </p>
                  <p className="font-mono text-xs text-slate-400">
                    Documento Atualizado: {new Date().getFullYear()} • Versão 3.1
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
