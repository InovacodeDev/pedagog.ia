'use client';

import { motion } from 'framer-motion';
import { Brain, Calculator, Clock } from 'lucide-react';

const PAINS = [
  {
    icon: Brain,
    title: 'Fadiga Mental',
    description:
      'Horas repetitivas de correção drenam sua energia criativa para planejar aulas incríveis.',
  },
  {
    icon: Calculator,
    title: 'Erros de Soma',
    description: 'O cansaço leva a pequenos erros de cálculo que geram reclamações e retrabalho.',
  },
  {
    icon: Clock,
    title: 'Tempo Perdido',
    description:
      'Fins de semana sacrificados que poderiam ser usados com a família ou descansando.',
  },
];

export function PainSection() {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display">
            A realidade da correção manual
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Você não estudou anos para virar uma máquina de somar notas.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PAINS.map((pain, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-slate-800/50 border border-slate-700"
            >
              <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
                <pain.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">{pain.title}</h3>
              <p className="text-slate-400 leading-relaxed">{pain.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
