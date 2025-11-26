'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function SettingsAppearance() {
  const { setTheme, theme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência do aplicativo. Alterne automaticamente entre dia e noite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          onValueChange={setTheme}
          defaultValue={theme}
          className="grid max-w-md grid-cols-3 gap-8 pt-2"
        >
          {/* Light Mode */}
          <div className="space-y-2">
            <Label className="[&:has([data-state=checked])>div]:border-primary">
              <RadioGroupItem value="light" className="sr-only" />
              <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer transition-all">
                <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                  <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                </div>
              </div>
              <span className="block w-full p-2 text-center font-normal">Claro</span>
            </Label>
          </div>

          {/* Dark Mode */}
          <div className="space-y-2">
            <Label className="[&:has([data-state=checked])>div]:border-primary">
              <RadioGroupItem value="dark" className="sr-only" />
              <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                </div>
              </div>
              <span className="block w-full p-2 text-center font-normal">Escuro</span>
            </Label>
          </div>

          {/* System Mode */}
          <div className="space-y-2">
            <Label className="[&:has([data-state=checked])>div]:border-primary">
              <RadioGroupItem value="system" className="sr-only" />
              <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                <div className="flex items-center space-x-2 rounded-sm bg-slate-950 p-2">
                  <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm w-1/2">
                    <div className="h-2 w-[20px] rounded-lg bg-slate-400" />
                    <div className="h-2 w-[40px] rounded-lg bg-slate-400" />
                  </div>
                  <div className="space-y-2 rounded-md bg-white p-2 shadow-sm w-1/2">
                    <div className="h-2 w-[20px] rounded-lg bg-[#ecedef]" />
                    <div className="h-2 w-[40px] rounded-lg bg-[#ecedef]" />
                  </div>
                </div>
              </div>
              <span className="block w-full p-2 text-center font-normal">Sistema</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
