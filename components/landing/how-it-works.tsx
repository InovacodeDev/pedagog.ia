'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, BrainCircuit, CheckCircle2, FileJson, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 'step-1',
    title: 'Fotografe',
    description: 'Use seu celular para tirar uma foto das provas dos alunos.',
    icon: Camera,
    color: 'bg-indigo-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-indigo-50/50">
        <Camera className="w-24 h-24 text-indigo-400 opacity-20 mb-4" />
        <p className="text-indigo-900/60 font-semibold px-8 text-center">
          Ilustração Isométrica: Professor fotografando prova com app mobile
        </p>
      </div>
    ),
  },
  {
    id: 'step-2',
    title: 'A IA Corrige',
    description: 'Nossa inteligência artificial analisa as respostas e atribui notas.',
    icon: BrainCircuit,
    color: 'bg-teal-500',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-teal-50/50">
        <BrainCircuit className="w-24 h-24 text-teal-400 opacity-20 mb-4" />
        <p className="text-teal-900/60 font-semibold px-8 text-center">
          Ilustração Isométrica: Robô/IA digitalizando e corrigindo papel
        </p>
      </div>
    ),
  },
  {
    id: 'step-3',
    title: 'Valide e Exporte',
    description: 'Revise se necessário e exporte as notas direto para o diário.',
    icon: CheckCircle2,
    color: 'bg-emerald-600',
    illustration: (
      <div className="flex flex-col items-center justify-center h-full w-full bg-emerald-50/50">
        <div className="flex gap-4 opacity-20 mb-4">
          <FileSpreadsheet className="w-16 h-16 text-emerald-700" />
          <FileJson className="w-16 h-16 text-emerald-700" />
        </div>
        <p className="text-emerald-900/60 font-semibold px-8 text-center">
          Ilustração Isométrica: Exportação de dados para nuvem
        </p>
      </div>
    ),
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 bg-white dark:bg-slate-950" id="como-funciona">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display text-slate-900 dark:text-white">
            Como funciona
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Simples como tirar uma foto. Poderoso como um assistente pessoal.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-stretch">
          {/* Steps List */}
          <div className="relative space-y-8 py-4">
            {/* Connecting Line */}
            <div className="absolute left-[30px] top-12 bottom-12 w-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block" />

            {STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                onClick={() => setActiveStep(index)}
                className={cn(
                  'group cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 relative z-10',
                  activeStep === index
                    ? 'bg-slate-50 dark:bg-slate-800 border-indigo-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 z-10 relative',
                      activeStep === index
                        ? `${step.color} scale-110 shadow-lg`
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                    )}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        'text-xl font-bold mb-2',
                        activeStep === index
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-300'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Image Display */}
          <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700 sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 h-full w-full"
              >
                {STEPS[activeStep].illustration}

                {/* Overlay Text */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900/10 to-transparent p-6 md:p-8">
                  <div className="inline-block bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {STEPS[activeStep].title}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
