'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { updateSchoolPeriodAction, resetClassesAction } from '@/server/actions/settings';
import { toast } from 'sonner';

interface SettingsClassesProps {
  schoolPeriod: string;
}

export function SettingsClasses({ schoolPeriod }: SettingsClassesProps) {
  const [period, setPeriod] = useState(schoolPeriod);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePeriodChange = async (value: string) => {
    setPeriod(value);
    setIsUpdating(true);
    const result = await updateSchoolPeriodAction(value);
    setIsUpdating(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleResetClasses = async () => {
    setIsResetting(true);
    const result = await resetClassesAction();
    setIsResetting(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Período Letivo</CardTitle>
          <CardDescription>
            Defina como o período letivo é dividido. Isso afeta como as notas e relatórios são
            organizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={period}
            onValueChange={handlePeriodChange}
            className="space-y-4"
            disabled={isUpdating}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bimestre" id="bimestre" />
              <Label htmlFor="bimestre">Bimestre</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="trimestre" id="trimestre" />
              <Label htmlFor="trimestre">Trimestre</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="semestre" id="semestre" />
              <Label htmlFor="semestre">Semestre</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis relacionadas ao período letivo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Zerar Turmas</Label>
            <p className="text-sm text-muted-foreground">
              Esta ação irá arquivar todas as turmas, avaliações e resultados atuais em um histórico
              e removerá as turmas ativas. Os alunos serão mantidos, mas desvinculados de qualquer
              turma. Use isso ao final do período letivo.
            </p>
          </div>

          <Button variant="destructive" disabled={isResetting} onClick={() => setShowConfirm(true)}>
            {isResetting ? 'Processando...' : 'Zerar Turmas e Arquivar'}
          </Button>

          <ConfirmDialog
            open={showConfirm}
            onOpenChange={setShowConfirm}
            title="Você tem certeza absoluta?"
            description="Esta ação não pode ser desfeita. Isso irá apagar permanentemente suas turmas e avaliações atuais da visualização principal e salvará um snapshot no histórico."
            confirmText="Sim, zerar tudo"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleResetClasses}
          />
        </CardContent>
      </Card>
    </div>
  );
}
