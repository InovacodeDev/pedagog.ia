'use client';

import { motion } from 'framer-motion';

const SCHOOLS = [
  'Escola Futuro',
  'Colégio Inovação',
  'Instituto Saber',
  'Educação Viva',
  'Escola Criativa',
  'Colégio Avançar',
];

export function SocialProof() {
  return (
    <section className="py-10 border-y border-slate-100 bg-slate-50/50">
      <div className="container mx-auto px-4 md:px-6 mb-8 text-center">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Junte-se a professores inovadores de
        </p>
      </div>
      <div className="relative flex overflow-hidden group">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 20,
              ease: 'linear',
            },
          }}
        >
          {[...SCHOOLS, ...SCHOOLS, ...SCHOOLS].map((school, i) => (
            <div key={i} className="text-xl font-bold text-slate-300 flex items-center gap-2">
              <div className="h-8 w-8 bg-slate-200 rounded-full" />
              {school}
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 to-transparent" />
      </div>
    </section>
  );
}
