'use client';

import { DataUnavailable } from '@/components/ui/data-unavailable';

export function ClassGradesList() {
  return (
    <div className="py-8">
      <DataUnavailable
        title="Notas da Turma"
        message="O módulo de notas e desempenho está em desenvolvimento. Em breve você poderá visualizar o progresso dos alunos aqui."
      />
    </div>
  );
}
