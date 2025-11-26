'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 'step-1',
    title: 'Fotografe',
    description: 'Use seu celular para tirar uma foto das provas dos alunos.',
    icon: Camera,
    color: 'bg-indigo-500',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'step-2',
    title: 'A IA Corrige',
    description: 'Nossa inteligência artificial analisa as respostas e atribui notas.',
    icon: BrainCircuit,
    color: 'bg-teal-500',
    image:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'step-3',
    title: 'Valide e Exporte',
    description: 'Revise se necessário e exporte as notas direto para o diário.',
    icon: CheckCircle2,
    color: 'bg-slate-900',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display text-slate-900">
            Como funciona
          </h2>
          <p className="mt-4 text-slate-600">
            Simples como tirar uma foto. Poderoso como um assistente pessoal.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Steps List */}
          <div className="space-y-6">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={cn(
                  'cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2',
                  activeStep === index
                    ? 'bg-slate-50 border-indigo-600 shadow-md'
                    : 'bg-white border-transparent hover:bg-slate-50'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-colors',
                      activeStep === index ? step.color : 'bg-slate-200 text-slate-500'
                    )}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        'text-xl font-bold mb-2',
                        activeStep === index ? 'text-slate-900' : 'text-slate-500'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Image Display */}
          <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeStep}
                src={STEPS[activeStep].image}
                alt={STEPS[activeStep].title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="font-bold text-lg">Passo {activeStep + 1}</p>
                <p className="text-slate-200">{STEPS[activeStep].title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
