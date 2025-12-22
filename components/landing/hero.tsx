'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Brain, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800">
                <Sparkles className="mr-2 h-3.5 w-3.5 text-indigo-600" />
                Nova IA 2.0 Disponível
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-display text-slate-900 leading-tight">
                Recupere 10 horas da sua semana <br className="hidden xl:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
                  com IA Pedagógica
                </span>
              </h1>
              <p className="max-w-2xl text-slate-600 md:text-xl leading-relaxed">
                A única plataforma que gera, aplica e corrige avaliações alinhadas à BNCC em
                segundos. Qualidade pedagógica com agilidade tecnológica.
              </p>
            </div>

            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 h-14 px-8 text-lg hover:scale-105 transition-transform duration-200"
              >
                <Link href="/login">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
              >
                <Link href="#como-funciona">Ver Demonstração</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Teste Grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end"
          >
            {/* Abstract Composition / Placeholder for AI Image */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="relative w-96 h-96 md:w-[28rem] md:h-[28rem]"
            >
              {/* Glowing Background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-teal-500/30 blur-[60px] rounded-full" />

              {/* Central Brain Logic */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl">
                  <Brain className="w-24 h-24 text-indigo-600" />
                  <div className="absolute -top-4 -right-4 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    IA Ativa
                  </div>
                </div>
              </div>

              {/* Floating Elements (Papers/Tasks) */}
              <motion.div
                animate={{ y: [10, -10, 10], x: [5, 0, 5] }}
                transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
                className="absolute top-10 right-10 md:top-0 md:right-10 bg-white p-4 rounded-xl shadow-lg border border-slate-100"
              >
                <FileText className="w-8 h-8 text-teal-500" />
                <div className="h-2 w-12 bg-slate-100 rounded mt-2" />
              </motion.div>

              <motion.div
                animate={{ y: [-10, 10, -10], x: [-5, 0, -5] }}
                transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                className="absolute bottom-10 left-10 md:bottom-20 md:left-0 bg-white p-4 rounded-xl shadow-lg border border-slate-100"
              >
                <Sparkles className="w-8 h-8 text-amber-500" />
                <div className="h-2 w-12 bg-slate-100 rounded mt-2" />
              </motion.div>

              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-indigo-100/50 rounded-full opacity-50"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
