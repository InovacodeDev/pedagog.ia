import { Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ModelSelectorProps {
  value: 'fast' | 'quality';
  onValueChange: (value: 'fast' | 'quality') => void;
  className?: string;
}

export function ModelSelector({ value, onValueChange, className }: ModelSelectorProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label>Modelo de IA</Label>
      <RadioGroup
        defaultValue={value}
        onValueChange={(v) => onValueChange(v as 'fast' | 'quality')}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem value="fast" id="fast" className="peer sr-only" />
          <Label
            htmlFor="fast"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Zap className="mb-3 h-6 w-6 text-yellow-500" />
            <div className="text-center">
              <div className="font-semibold">Rápida (Flash)</div>
              <div className="text-xs text-muted-foreground">1x Custo</div>
            </div>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="quality" id="quality" className="peer sr-only" />
          <Label
            htmlFor="quality"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Sparkles className="mb-3 h-6 w-6 text-purple-500" />
            <div className="text-center">
              <div className="font-semibold">Qualidade (Pro)</div>
              <div className="text-xs text-muted-foreground">2x Custo</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
