'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scan, BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    id: 'ai-generation',
    title: 'Geração de Provas com IA',
    description:
      'Diga o tema e a série. Nossa IA cria questões inéditas e perfeitamente alinhadas ao conteúdo que você ensinou.',
    icon: Sparkles,
    color: 'bg-purple-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-purple-100 max-w-[80%] text-center">
          <Sparkles className="w-16 h-16 text-purple-600" />
          <h3 className="font-bold text-slate-900">IA Geradora</h3>
          <p className="text-xs text-slate-500">
            &quot;Crie uma prova sobre Revolução Francesa para o 8º ano...&quot;
          </p>
          <div className="w-full h-2 bg-purple-100 rounded-full mt-2" />
          <div className="w-2/3 h-2 bg-purple-100 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 'scan-grade',
    title: 'Correção via Câmera',
    description:
      'Esqueça as pilhas de papel. Aponte o celular para o gabarito e obtenha a nota instantaneamente.',
    icon: Scan,
    color: 'bg-indigo-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-indigo-50">
        <div className="relative">
          {/* Phone Mockup */}
          <div className="bg-slate-900 w-48 h-80 rounded-[2.5rem] border-8 border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center relative">
              <Scan className="w-12 h-12 text-indigo-400 animate-pulse" />
              <div className="absolute inset-0 border-2 border-indigo-500/50 m-8 rounded-lg" />
              <div className="absolute bottom-6 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                Detectando...
              </div>
            </div>
          </div>
          {/* Paper behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-72 bg-white rounded-lg shadow-sm -z-10 rotate-12 border border-slate-200">
            <div className="p-4 space-y-2">
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
              <div className="h-2 w-full bg-slate-50 rounded" />
              <div className="grid grid-cols-5 gap-2 mt-8">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 bg-slate-100 rounded-full border border-slate-200"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'bncc',
    title: 'Alinhamento BNCC',
    description:
      'Todas as questões já vêm com os códigos da BNCC. Seus relatórios e planejamentos sempre em dia.',
    icon: BookOpen,
    color: 'bg-teal-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-teal-50">
        <div className="grid grid-cols-2 gap-4 max-w-[80%]">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-teal-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-xs text-teal-800">EF09HI01</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              Descrever e contextualizar os principais processos...
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-teal-100 translate-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-xs text-teal-800">EM13CHS102</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
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
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display text-slate-900">
              Poder de super-herói para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                professores
              </span>
            </h2>
            <p className="mt-4 text-slate-600 md:text-lg max-w-2xl mx-auto">
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
                    ? 'bg-white border-indigo-600 shadow-xl scale-105 z-10'
                    : 'bg-white/50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-md'
                )}
              >
                <div className="flex items-start gap-4 z-10 relative">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                      activeFeature === index
                        ? `${feature.color} text-white shadow-lg`
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    )}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={cn(
                        'text-lg font-bold mb-1 transition-colors',
                        activeFeature === index ? 'text-slate-900' : 'text-slate-600'
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-5 w-5 text-slate-300 transition-all duration-300 self-center',
                      activeFeature === index
                        ? 'text-indigo-600 translate-x-1'
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
            className="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-100 ring-1 ring-slate-900/5 sticky top-24"
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
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white shadow-sm border border-slate-100 text-slate-600">
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
