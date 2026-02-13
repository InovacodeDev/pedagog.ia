'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, ChevronRight, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    id: 'ai-questions',
    title: 'Gere Questões com IA',
    description:
      'Nunca mais sofra com bloqueio criativo. Crie milhares de questões originais, de múltipla escolha, de verdadeiro ou false, de somatória, de associação, dissertativas ou até mesmo redação, em segundos.',
    icon: Brain,
    color: 'bg-indigo-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-indigo-50 dark:bg-indigo-950/20">
        <div className="relative">
          {/* Central Brain/Chip */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900/50 z-10 relative flex flex-col items-center">
            <Brain className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-2" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Banco de Questões
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Gerando...</div>
          </div>
          {/* Floating Cards */}
          <div className="absolute top-0 right-0 -translate-y-full hover:-translate-y-[120%] transition-transform duration-500 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-indigo-50 dark:border-indigo-900/30 -rotate-3 z-0">
            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-1"></div>
            <div className="w-10 h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-2/3 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-indigo-50 dark:border-indigo-900/30 rotate-3 z-20">
            <div className="flex gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="w-12 h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600"></div>
              <div className="w-10 h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-generation',
    title: 'Geração de Provas com IA',
    description:
      'Diga o tema e a série. Nossa IA cria questões inéditas e perfeitamente alinhadas ao conteúdo que você ensinou.',
    icon: Sparkles,
    color: 'bg-purple-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-purple-50 dark:bg-purple-950/20">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-purple-100 dark:border-purple-900/50 max-w-[80%] text-center">
          <Sparkles className="w-16 h-16 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-slate-900 dark:text-white">IA Geradora</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &quot;Crie uma prova sobre Revolução Francesa para o 8º ano...&quot;
          </p>
          <div className="w-full h-2 bg-purple-100 dark:bg-purple-900/50 rounded-full mt-2" />
          <div className="w-2/3 h-2 bg-purple-100 dark:bg-purple-900/50 rounded-full" />
        </div>
      </div>
    ),
  },
  /*
  {
    id: 'scan-grade',
    title: 'Correção via Câmera',
    description:
      'Esqueça as pilhas de papel. Aponte o celular para o gabarito e obtenha a nota instantaneamente.',
    icon: Scan,
    color: 'bg-indigo-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-indigo-50 dark:bg-indigo-950/20">
        <div className="relative">
          <div className="bg-slate-900 w-48 h-80 rounded-[2.5rem] border-8 border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center relative">
              <Scan className="w-12 h-12 text-indigo-400 animate-pulse" />
              <div className="absolute inset-0 border-2 border-indigo-500/50 m-8 rounded-lg" />
              <div className="absolute bottom-6 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                Detectando...
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-72 bg-white dark:bg-slate-700 rounded-lg shadow-sm -z-10 rotate-12 border border-slate-200 dark:border-slate-600">
            <div className="p-4 space-y-2">
              <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-600 rounded" />
              <div className="h-2 w-full bg-slate-50 dark:bg-slate-800/50 rounded" />
              <div className="grid grid-cols-5 gap-2 mt-8">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 bg-slate-100 dark:bg-slate-600 rounded-full border border-slate-200 dark:border-slate-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  */
  {
    id: 'bncc',
    title: 'Alinhamento BNCC',
    description:
      'Todas as questões já vêm com os códigos da BNCC. Seus relatórios e planejamentos sempre em dia.',
    icon: BookOpen,
    color: 'bg-teal-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-teal-50 dark:bg-teal-950/20">
        <div className="grid grid-cols-2 gap-4 max-w-[80%]">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-teal-100 dark:border-teal-900/50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-xs text-teal-800 dark:text-teal-200">EF09HI01</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Descrever e contextualizar os principais processos...
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-teal-100 dark:border-teal-900/50 translate-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-xs text-teal-800 dark:text-teal-200">EM13CHS102</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Identificar e analisar as relações entre sujeitos...
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesGrid() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display text-slate-900 dark:text-white">
              Poder de super-herói para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                professores
              </span>
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 md:text-lg max-w-2xl mx-auto">
              Ferramentas avançadas simplificadas para o uso diário. Porque seu tempo é o recurso
              mais valioso.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Interactive List */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                onClick={() => setActiveFeature(index)}
                className={cn(
                  'group cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 relative overflow-hidden',
                  activeFeature === index
                    ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xl dark:shadow-none scale-105 z-10'
                    : 'bg-white/50 dark:bg-slate-900/50 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-md'
                )}
              >
                <div className="flex items-start gap-4 z-10 relative">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                      activeFeature === index
                        ? `${feature.color} text-white shadow-lg`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-800'
                    )}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={cn(
                        'text-lg font-bold mb-1 transition-colors',
                        activeFeature === index
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-5 w-5 text-slate-300 dark:text-slate-600 transition-all duration-300 self-center',
                      activeFeature === index
                        ? 'text-indigo-600 dark:text-indigo-400 translate-x-1'
                        : 'opacity-0 group-hover:opacity-100'
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Dynamic Image/Illustration Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl dark:shadow-sm border border-slate-100 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/5 sticky top-24"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {FEATURES[activeFeature].illustration}

                {/* Overlay Text */}
                <div className="absolute top-6 right-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {(() => {
                      const Icon = FEATURES[activeFeature].icon;
                      return <Icon className="w-3 h-3 mr-2 text-indigo-500" />;
                    })()}
                    {FEATURES[activeFeature].title}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
