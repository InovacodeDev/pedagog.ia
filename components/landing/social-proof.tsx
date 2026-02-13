'use client';

import { motion } from 'framer-motion';
import { type LandingStats } from '@/server/queries/get-landing-stats';
import { ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';

export function SocialProof({ stats }: { stats: LandingStats }) {
  // Check if any stats meet the threshold
  const hasAnyStats = stats.showTeacherCount || stats.showExamCount || stats.showQuestionCount;

  if (!hasAnyStats) {
    // SCENARIO B: Qualitative Trust (Thresholds NOT Met)
    return (
      <section className="py-12 border-y border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 uppercase tracking-widest">
            Alinhado com padrões educacionais e segurança
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            {/* Qualitative Trust Signals */}
            <div className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-slate-200">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              <span>BNCC</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-slate-200">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <span>Ensino Moderno</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SCENARIO A: Quantitative Proof (Thresholds Met)
  return (
    <section className="py-16 border-y border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-24 text-center">
          {stats.showTeacherCount && (
            <StatItem label="Professores Inovadores" value={stats.teacherCountFormatted} />
          )}
          {stats.showQuestionCount && (
            <StatItem label="Questões Geradas" value={stats.questionCountFormatted} />
          )}
          {stats.showExamCount && (
            <StatItem label="Avaliações Criadas" value={stats.examCountFormatted} />
          )}
        </div>
      </div>
    </section>
  );
}

function StatItem({ label, value }: { label: string; value: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-2 min-w-[200px]"
    >
      <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 font-display tracking-tight">
        {value}
      </h3>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}
