'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onChange,
  placeholder = 'Selecione uma data',
  className,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    setInternalDate(date);
  }, [date]);

  const handleSelect = (newDate: Date | undefined) => {
    setInternalDate(newDate);
    onChange?.(newDate);
  };

  const handleClear = () => {
    handleSelect(undefined);
  };

  const handleToday = () => {
    handleSelect(new Date());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal bg-background border-input hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors',
            !internalDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalDate ? (
            format(internalDate, 'PPP', { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-none" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="flex items-center justify-between p-3 border-t border-zinc-800 bg-[#2a2a2a] rounded-b-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-[#99c9ff] hover:text-[#99c9ff] hover:bg-zinc-800 p-0 h-auto font-medium"
            >
              Limpar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="text-[#99c9ff] hover:text-[#99c9ff] hover:bg-zinc-800 p-0 h-auto font-medium"
            >
              Hoje
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
