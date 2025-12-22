'use client';

import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClassItem } from '@/server/actions/classes';

interface ClassMultiSelectProps {
  classes: ClassItem[];
  selectedClassIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function ClassMultiSelect({
  classes,
  selectedClassIds,
  onChange,
  disabled,
}: ClassMultiSelectProps) {
  const handleSelect = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      onChange(selectedClassIds.filter((id) => id !== classId));
    } else {
      onChange([...selectedClassIds, classId]);
    }
  };

  const selectedLabels = classes.filter((c) => selectedClassIds.includes(c.id)).map((c) => c.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" disabled={disabled}>
          <span className="truncate">
            {selectedLabels.length > 0
              ? `${selectedLabels.length} turma(s) selecionada(s)`
              : 'Selecionar Turmas'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Minhas Turmas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {classes.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">Nenhuma turma encontrada.</div>
        ) : (
          classes.map((cls) => (
            <DropdownMenuCheckboxItem
              key={cls.id}
              checked={selectedClassIds.includes(cls.id)}
              onCheckedChange={() => handleSelect(cls.id)}
            >
              {cls.name}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
