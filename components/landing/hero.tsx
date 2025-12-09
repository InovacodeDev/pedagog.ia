'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-display text-slate-900">
                Gere e Corrija provas em{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
                  poucos minutos
                </span>
              </h1>
              <p className="max-w-[600px] text-slate-600 md:text-xl leading-relaxed">
                A Inteligência Artificial que cria avaliações alinhadas à BNCC e corrige automaticamente. Foque em ensinar, nós cuidamos da burocracia.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 h-12 px-8 text-lg animate-pulse-ai"
              >
                <Link href="/login">
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-slate-200"
                  />
                ))}
              </div>
              <p>Junte-se a +2.000 professores</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
          >
             <div className="relative rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="mx-auto text-xs font-medium text-slate-500">pedagog.ai/dashboard</div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Generated Exam Card */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Prova de História - 2º Bimestre</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Pronta para impressão</span>
                     </div>
                     <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                           <p className="text-sm text-slate-700 font-medium">1. (BNCC EF09HI01) Descreva os principais impactos...</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                           <p className="text-sm text-slate-700 font-medium">2. Analise o mapa abaixo e identifique as rotas...</p>
                        </div>
                     </div>
                  </div>

                  {/* Correction Stats */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="text-sm text-indigo-600 font-medium mb-1">Média da Turma</div>
                        <div className="text-2xl font-bold text-indigo-900">7.8</div>
                     </div>
                     <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                        <div className="text-sm text-teal-600 font-medium mb-1">Correções Hoje</div>
                        <div className="text-2xl font-bold text-teal-900">32</div>
                     </div>
                  </div>
                </div>
             </div>
             
            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
