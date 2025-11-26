import { getJobForValidation } from '@/server/actions/validation';
import { ValidationDeck } from '@/components/validation/validation-deck';
import { notFound } from 'next/navigation';

export default async function ValidateExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const job = await getJobForValidation(id);
    return <ValidationDeck job={job} />;
  } catch {
    notFound();
  }
}
