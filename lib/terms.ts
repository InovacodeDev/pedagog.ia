export const TERM_LABELS: Record<string, string> = {
  '1_bimestre': '1º Bimestre',
  '2_bimestre': '2º Bimestre',
  '3_bimestre': '3º Bimestre',
  '4_bimestre': '4º Bimestre',
  '1_trimestre': '1º Trimestre',
  '2_trimestre': '2º Trimestre',
  '3_trimestre': '3º Trimestre',
  '1_semestre': '1º Semestre',
  '2_semestre': '2º Semestre',
};

/**
 * Translates a term key to its user-friendly label.
 * @param term Key like '1_bimestre'
 * @returns User-friendly label or the input string if no translation is found
 */
export function getTermLabel(term: string | null | undefined): string {
  if (!term) return 'Período não definido';
  return TERM_LABELS[term] || term;
}
