'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { GeneratorForm } from '@/components/questions/generator-form';
import { GeneratedQuestion } from '@/types/questions';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GeneratorDrawerProps {
  onAddQuestions: (questions: GeneratedQuestion[]) => void;
  isPro?: boolean;
}

export function GeneratorDrawer({ onAddQuestions, isPro = false }: GeneratorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = (questions: GeneratedQuestion[]) => {
    onAddQuestions(questions);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Wand2 className="mr-2 h-4 w-4" /> Gerador com IA
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[400px] sm:w-[600px] flex flex-col h-full overflow-hidden"
        side="left"
      >
        <SheetHeader>
          <SheetTitle>Gerador de Questões com IA</SheetTitle>
          <SheetDescription>Gere questões automaticamente e adicione à sua prova.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden -mx-6 px-6 py-4">
          <ScrollArea className="h-full pr-4">
            <GeneratorForm isPro={isPro} onImport={handleImport} />
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
