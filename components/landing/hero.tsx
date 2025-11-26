'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, ScanLine } from 'lucide-react';

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
                Cansado de corrigir provas no{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
                  fim de semana?
                </span>
              </h1>
              <p className="max-w-[600px] text-slate-600 md:text-xl leading-relaxed">
                A Inteligência Artificial que transforma pilhas de papel em notas no diário. Foque
                em ensinar, nós cuidamos da burocracia.
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
            className="relative mx-auto w-full max-w-[400px] lg:max-w-none"
          >
            <div className="relative aspect-[9/16] max-w-[300px] mx-auto bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
              {/* Screen Content */}
              <div className="absolute inset-0 bg-slate-50 flex flex-col">
                <div className="h-8 bg-slate-100 w-full flex items-center justify-center">
                  <div className="h-4 w-24 bg-slate-900 rounded-full opacity-10" />
                </div>
                <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
                  <motion.div
                    animate={{
                      y: [-100, 100],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: 'linear',
                    }}
                    className="absolute w-full h-1 bg-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.5)] z-10"
                  />
                  <div className="w-full h-64 bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4 relative overflow-hidden">
                    <div className="space-y-2 opacity-30">
                      <div className="h-2 w-3/4 bg-slate-900 rounded" />
                      <div className="h-2 w-1/2 bg-slate-900 rounded" />
                      <div className="h-2 w-full bg-slate-900 rounded" />
                      <div className="h-2 w-5/6 bg-slate-900 rounded" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ScanLine className="h-12 w-12 text-teal-500" />
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="h-12 bg-indigo-600 rounded-xl w-full flex items-center justify-center text-white font-medium">
                      Corrigir Prova
                    </div>
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
