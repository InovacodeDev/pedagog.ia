'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen, BarChart3, Scan } from 'lucide-react';

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-display text-slate-900">
            Tudo o que você precisa para <span className="text-indigo-600">ganhar tempo</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2 h-auto md:h-[600px]">
          {/* Card 1: Large Scan-to-Grade */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 mb-4">
                <Scan className="mr-2 h-4 w-4" />
                Destaque
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Scan-to-Grade Instantâneo</h3>
              <p className="text-slate-600 max-w-md">
                Aponte a câmera para a prova e veja a mágica acontecer. Nossa IA identifica
                questões, caligrafia e atribui notas em segundos.
              </p>
            </div>

            {/* Visual Placeholder for Scan */}
            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-gradient-to-tl from-indigo-50 to-slate-50 rounded-tl-3xl border-t border-l border-slate-100 p-6 transition-transform group-hover:scale-105 duration-500">
              <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-indigo-900/10" />
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: LGPD */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col justify-center"
          >
            <ShieldCheck className="h-10 w-10 text-teal-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Privacidade LGPD</h3>
            <p className="text-sm text-slate-600 mt-2">
              Seus dados e dos alunos protegidos com criptografia de ponta a ponta.
            </p>
          </motion.div>

          {/* Card 3: BNCC */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col justify-center"
          >
            <BookOpen className="h-10 w-10 text-indigo-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Alinhamento BNCC</h3>
            <p className="text-sm text-slate-600 mt-2">
              Relatórios automáticos de competências e habilidades trabalhadas.
            </p>
          </motion.div>

          {/* Card 4: Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 rounded-3xl bg-slate-900 p-6 shadow-lg flex flex-col justify-center text-white"
          >
            <BarChart3 className="h-10 w-10 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold">Analytics de Turma</h3>
            <p className="text-sm text-slate-400 mt-2">
              Identifique dificuldades coletivas antes que virem notas baixas.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
