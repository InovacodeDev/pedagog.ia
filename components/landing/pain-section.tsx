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
    description:
      'O cansaço leva a pequenos erros de cálculo que geram reclamações, insegurança e retrabalho.',
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
    <section className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display text-slate-900 dark:text-white">
              A dura realidade da{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                correção manual
              </span>
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Você não estudou anos para virar uma máquina de somar notas propenso a erros.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PAINS.map((pain, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6, type: 'spring' }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800 shadow-md transition-colors duration-300 group"
            >
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 mb-2">
                <pain.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pain.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {pain.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
