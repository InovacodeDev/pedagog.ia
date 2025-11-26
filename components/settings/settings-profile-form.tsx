'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Email inválido.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface SettingsProfileFormProps {
  user: {
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export function SettingsProfileForm({ user }: SettingsProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    },
    mode: 'onChange',
  });

  function onSubmit(data: ProfileFormValues) {
    toast.success('Perfil atualizado com sucesso!');
    console.log(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Gerencie suas informações pessoais.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-6 w-6 text-white" />
              </div>
            </div>
            <Button variant="outline" size="sm">
              Alterar Foto
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} disabled readOnly />
                    </FormControl>
                    <FormDescription>O email não pode ser alterado diretamente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
