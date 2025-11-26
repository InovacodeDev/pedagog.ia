'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  stem: string;
  type: string;
  style: string;
  bncc: string;
  usage_count: number;
  created_at: string;
}

interface QuestionsTableProps {
  initialQuestions: Question[];
}

export function QuestionsTable({ initialQuestions }: QuestionsTableProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [showUnusedOnly, setShowUnusedOnly] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStyle, setFilterStyle] = useState<string>('all');

  const filteredQuestions = questions.filter((q) => {
    if (showUnusedOnly && q.usage_count > 0) return false;
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (filterStyle !== 'all' && q.style !== filterStyle) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return;
    // Call server action here
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success('Questão excluída com sucesso!');
  };

  const handleAddToExam = () => {
    toast.info('Funcionalidade de adicionar à prova em breve!');
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      multiple_choice: 'Múltipla Escolha',
      true_false: 'V/F',
      essay: 'Dissertativa',
      summation: 'Somatória',
      redaction: 'Redação',
      association: 'Associação',
    };
    return map[type] || type;
  };

  const getStyleLabel = (style: string) => {
    const map: Record<string, string> = {
      enem: 'ENEM',
      high_school: 'Ensino Médio',
      entrance_exam: 'Vestibular',
      civil_service: 'Concurso',
    };
    return map[style] || style;
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center bg-card p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Switch id="unused-mode" checked={showUnusedOnly} onCheckedChange={setShowUnusedOnly} />
          <Label htmlFor="unused-mode">Apenas Nunca Usadas</Label>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
              <SelectItem value="true_false">V/F</SelectItem>
              <SelectItem value="essay">Dissertativa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStyle} onValueChange={setFilterStyle}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estilos</SelectItem>
              <SelectItem value="enem">ENEM</SelectItem>
              <SelectItem value="high_school">Ensino Médio</SelectItem>
              <SelectItem value="entrance_exam">Vestibular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Enunciado</TableHead>
              <TableHead>Tipo / Estilo</TableHead>
              <TableHead>BNCC</TableHead>
              <TableHead>Popularidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma questão encontrada com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <p className="line-clamp-2 font-medium" title={q.stem}>
                      {q.stem}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {getTypeLabel(q.type)}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getStyleLabel(q.style)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{q.bncc || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    {q.usage_count === 0 ? (
                      <Badge className="bg-green-600 hover:bg-green-700">Nunca Usada</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200 bg-orange-50"
                      >
                        Usada {q.usage_count}x
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToExam()}
                        title="Adicionar à Prova"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      {q.usage_count === 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(q.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
