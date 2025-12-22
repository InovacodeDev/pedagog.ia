'use client';

import { ExamBlock } from '@/components/builder/ExamBlock';
import { StaticBlock } from './static-block';
import { Button } from '@/components/ui/button';
import { FileDown, Pencil } from 'lucide-react';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { BuilderPDFDocument } from '@/components/builder/BuilderPDF';
import { saveAs } from 'file-saver';
// import { generateDocx } from '@/lib/docx-generator';
// import { toast } from 'sonner';

interface ExamViewerProps {
  examId: string;
  blocks: ExamBlock[];
  title: string;
}

export function ExamViewer({ examId, blocks, title }: ExamViewerProps) {
  const exportPDF = async () => {
    const blob = await pdf(<BuilderPDFDocument blocks={blocks} />).toBlob();
    saveAs(blob, `${title}.pdf`);
  };

  /*
  const exportWord = async () => {
    try {
      const blob = await generateDocx(blocks);
      saveAs(blob, `${title}.docx`);
      toast.success('Prova exportada para Word!');
    } catch (error) {
      console.error('Erro ao exportar Word:', error);
      toast.error('Erro ao exportar para Word.');
    }
  };
  */

  return (
    <div className="container mx-auto py-8 space-y-8 print:p-0 print:space-y-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold">{title}</h1>
          <p className="text-muted-foreground">Visualização da prova</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled title="Em construção">
            <FileDown className="mr-2 h-4 w-4" /> Word
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <FileDown className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button asChild>
            <Link href={`/exams/${examId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white text-black p-8 shadow-lg min-h-[29.7cm] w-[21cm] mx-auto print:shadow-none print:w-full print:min-h-0 print:p-0">
        {blocks.map((block) => (
          <StaticBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
