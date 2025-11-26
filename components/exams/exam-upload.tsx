'use client';

import * as React from 'react';
import { UploadCloud, Loader2, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { uploadExamAction } from '@/server/actions/exams';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Exam {
  id: string;
  title: string;
}

export function ExamUpload() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = React.useState<string>('none');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const supabase = createClient();

  React.useEffect(() => {
    async function fetchExams() {
      const { data } = await supabase
        .from('exams')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (data) {
        setExams(data);
      }
    }
    fetchExams();
  }, [supabase]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    } else {
      toast.error('Apenas arquivos de imagem são permitidos');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('exam_image', file);
    if (selectedExamId && selectedExamId !== 'none') {
      formData.append('exam_id', selectedExamId);
    }

    startTransition(async () => {
      try {
        const result = await uploadExamAction(formData);

        if (result.success) {
          toast.success('Prova enviada com sucesso!', {
            description: 'O processamento da IA começou.',
          });
          setFile(null);
          setSelectedExamId('none');
        } else {
          toast.error('Erro ao enviar prova', {
            description: result.error,
          });
        }
      } catch {
        toast.error('Erro inesperado', {
          description: 'Tente novamente mais tarde.',
        });
      }
    });
  };

  return (
    <Card className="p-8">
      {!file ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload de Prova</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Arraste uma imagem ou clique para selecionar
              </p>
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG ou WebP (max. 5MB)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="p-2 rounded bg-background border">
              <FileImage className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isPending}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Vincular a uma Prova Existente (Opcional)</Label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma prova..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma (Correção Genérica)</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se selecionado, usaremos o gabarito oficial desta prova para a correção.
            </p>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleUpload} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Enviar para Correção'
              )}
            </Button>
            <Button variant="outline" onClick={handleRemoveFile} disabled={isPending}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
