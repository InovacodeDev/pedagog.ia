

export const metadata = {
  title: 'Minhas Turmas | Pedagog.IA',
  description: 'Gerencie suas turmas e alunos.',
};

export default async function ClassesPage() {
  return (
    <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h1 className="text-3xl font-display font-bold">Turmas (Em Breve)</h1>
      <p className="text-muted-foreground max-w-md">
        A gestão de turmas e visualização de analytics estão em desenvolvimento e serão liberadas em breve.
      </p>
    </div>
  );
}
