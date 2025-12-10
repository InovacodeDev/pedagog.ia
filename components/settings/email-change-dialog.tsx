'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmailChangeDialogProps {
  currentEmail: string;
}

type Step = 'start' | 'verify_current' | 'input_new' | 'verify_new';

export function EmailChangeDialog({ currentEmail }: EmailChangeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('start');
  const [isLoading, setIsLoading] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const supabase = createClient();
  const router = useRouter();

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setStep('start');
      setOtp('');
      setNewEmail('');
      setIsLoading(false);
    }
  }, [open]);

  async function onSendCurrentOtp() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: currentEmail,
        options: {
          shouldCreateUser: false,
        },
      });
      if (error) throw error;

      setStep('verify_current');
      toast.success('Código enviado para seu email atual.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar código.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyCurrentOtp() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: currentEmail,
        token: otp,
        type: 'email',
      });
      if (error) throw error;

      setStep('input_new');
      setOtp(''); // Clear OTP for next step
      toast.success('Email atual verificado Com sucesso.');
    } catch (error) {
      console.error(error);
      toast.error('Código inválido.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onSendNewOtp() {
    if (!newEmail || newEmail === currentEmail) {
      toast.error('Informe um novo email válido e diferente do atual.');
      return;
    }

    setIsLoading(true);
    try {
      // Trigger email change flow
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (error) throw error;

      setStep('verify_new');
      toast.success(`Código enviado para ${newEmail}`);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao iniciar troca de email.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyNewOtp() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: otp,
        type: 'email_change',
      });
      if (error) throw error;

      toast.success('Email alterado com sucesso!');
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Código inválido ou erro na confirmação.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          Alterar Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Email de Acesso</DialogTitle>
          <DialogDescription>
            Sua conta é acessada via email. Para mudar, precisamos confirmar sua identidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* STEP 0: START */}
          {step === 'start' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>1. Validar email atual ({currentEmail})</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    2
                  </div>
                  <span>Informar novo email</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    3
                  </div>
                  <span>Validar novo email</span>
                </div>
              </div>
              <Button onClick={onSendCurrentOtp} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Processo
              </Button>
            </div>
          )}

          {/* STEP 1: VERIFY CURRENT */}
          {step === 'verify_current' && (
            <div className="space-y-4 flex flex-col items-center">
              <div className="text-center space-y-2">
                <Label>Digite o código enviado para {currentEmail}</Label>
                <div className="flex justify-center mt-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button
                onClick={onVerifyCurrentOtp}
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar Identidade
              </Button>
            </div>
          )}

          {/* STEP 2: INPUT NEW EMAIL */}
          {step === 'input_new' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Novo Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="novo@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={onSendNewOtp} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Enviar Código de Confirmação
              </Button>
            </div>
          )}

          {/* STEP 3: VERIFY NEW */}
          {step === 'verify_new' && (
            <div className="space-y-4 flex flex-col items-center">
              <div className="text-center space-y-2">
                <Label>Digite o código enviado para {newEmail}</Label>
                <div className="flex justify-center mt-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button
                onClick={onVerifyNewOtp}
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Troca de Email
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
