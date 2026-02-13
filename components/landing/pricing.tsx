'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Para Testar',
    price: 'Grátis',
    description: 'Ideal para conhecer a plataforma.',
    features: ['Até 15 questões', 'Gestão de Múltiplas Turmas'],
    notIncluded: ['Analytics de Turmas'],
    cta: 'Começar Grátis',
    href: '/login',
    variant: 'outline',
  },
  {
    name: 'Para o Professor',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Liberdade total para focar em ensinar.',
    features: ['Até 100 questões/mês', 'Gestão de Múltiplas Turmas', 'Analytics de Turmas'],
    notIncluded: [],
    cta: 'Assinar Agora',
    href: '/login?plan=pro',
    variant: 'default',
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display text-slate-900 dark:text-white">
            Investimento que se paga no{' '}
            <span className="text-teal-600">primeiro fim de semana</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Quanto vale o seu tempo livre?</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-start">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl bg-white dark:bg-slate-950 p-8 shadow-xl dark:shadow-2xl dark:shadow-indigo-900/20 border ${
                plan.popular
                  ? 'border-indigo-600 ring-4 ring-indigo-600/10 dark:ring-indigo-500/20 scale-105 z-10'
                  : 'border-slate-100 dark:border-slate-800 shadow-slate-200/50 dark:shadow-none'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white shadow-lg">
                  Mais Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-1 text-xl font-semibold text-slate-500">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-teal-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-center text-slate-400">
                    <X className="mr-3 h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full h-12 text-base ${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50'
                    : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                variant={plan.variant === 'outline' ? 'outline' : 'default'}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
