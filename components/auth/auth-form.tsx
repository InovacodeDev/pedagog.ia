'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState<'email' | 'otp'>('email');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(60);
  const supabase = createClient();
  const router = useRouter();

  React.useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  async function onSendOtp(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setStep('otp');
      setTimeLeft(60);
      toast.success('Código enviado!', {
        description: 'Verifique seu email para pegar o código de acesso.',
      });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onResendOtp() {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setTimeLeft(60);
      toast.success('Código reenviado!', {
        description: 'Verifique seu email para pegar o novo código.',
      });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao reenviar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      // First try to verify as signup (new user)
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      // If signup verification fails, try as magiclink (existing user login)
      if (error) {
        const { error: magicLinkError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'magiclink',
        });

        if (magicLinkError) {
          throw magicLinkError;
        }
      }

      toast.success('Login realizado com sucesso!');
      router.refresh();
      router.push('/home');
    } catch (error) {
      console.error(error);
      toast.error('Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === 'email' ? 'Entrar no Pedagog.IA' : 'Confirme seu email'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 'email'
            ? 'Digite seu email para receber um código de acesso'
            : `Enviamos um código de 6 dígitos para ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'email' ? (
          <form onSubmit={onSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="professor@escola.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Enviar Código de Acesso
            </Button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-4 flex flex-col items-center">
            <div className="space-y-2 flex justify-center w-full">
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
            <Button className="w-full" type="submit" disabled={isLoading || otp.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar e Entrar
            </Button>
            <Button
              variant="link"
              type="button"
              className="w-full text-xs text-muted-foreground"
              onClick={onResendOtp}
              disabled={isLoading || timeLeft > 0}
            >
              {timeLeft > 0 ? `Reenviar código em ${timeLeft}s` : 'Reenviar código'}
            </Button>
            <Button
              variant="link"
              type="button"
              className="text-sm text-muted-foreground"
              onClick={() => {
                setStep('email');
                setOtp('');
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Voltar e corrigir email
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground text-center px-8">
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="underline hover:text-primary">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="underline hover:text-primary">
            Política de Privacidade
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
