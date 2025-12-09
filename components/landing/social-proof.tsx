'use client';



export function SocialProof({ stats }: { stats: { exams: number; questions: number; corrections: number } }) {
  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-slate-900 font-display">
              +{stats.exams.toLocaleString()}
            </h3>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Provas Geradas
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-slate-900 font-display">
              +{stats.questions.toLocaleString()}
            </h3>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Questões Criadas
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-slate-900 font-display">
              +{stats.corrections.toLocaleString()}
            </h3>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Correções Realizadas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
