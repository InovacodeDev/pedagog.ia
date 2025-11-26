# TECHNICAL DESIGN DOCUMENT & ENGINEERING GUIDE: PEDAGOGI.AI
**Versão:** 2.0.0 (Async & Secure Core)
**Data:** 23 Novembro, 2025
**Autor:** O Arquiteto de Soluções Digitais
**Status:** Blueprint de Execução

---

## 1. VISÃO ARQUITETURAL E FUNDAMENTOS

### 1.1. O Sistema Operacional Cognitivo (C4 Model - Event Driven)
Não estamos construindo apenas um CRUD; estamos construindo um pipeline de processamento assíncrono de alta performance.

* **Frontend (The Head):** Next.js 15 (App Router) + React 19. Responsável pela interação, captura de imagens e feedback em tempo real.
* **Backend (The Spine):** Supabase. Atua como persistência, autenticação e gerenciador de filas de eventos.
* **Workers (The Brain):** Supabase Edge Functions (Deno). Executam a lógica pesada (OCR, LLM Reasoning) de forma assíncrona, disparados por webhooks do banco.
* **Notifications (The Nervous System):** Supabase Realtime + Web Push + Resend. Mantêm o usuário informado sem bloqueios de tela.

### 1.2. Architecture Decision Records (ADRs)

* **ADR-001: Repositório Unificado (Next.js Integrated).**
    * **Decisão:** Repositório único, sem complexidade de Monorepo (Nx/Turbo).
    * **Justificativa:** Foco em velocidade de entrega. A separação lógica (pastas) é suficiente. Facilita deploy atômico na Vercel.

* **ADR-002: React 19 & Next.js 15.**
    * **Decisão:** Adoção de recursos de ponta (`useOptimistic`, `<Activity>`, Server Actions).
    * **Justificativa:** `<Activity>` permite manter o estado da correção de prova em background enquanto o usuário navega. `useOptimistic` elimina a sensação de latência ao dar notas manualmente.

* **ADR-003: Processamento Assíncrono (Job Queue Pattern).**
    * **Decisão:** Mover OCR e Geração de Provas para **Supabase Edge Functions**.
    * **Justificativa:** Evita timeouts de 60s da Vercel. O fluxo é: `User -> Insert Job -> DB Trigger -> Edge Function -> Update DB -> Realtime Push -> User UI`.

* **ADR-004: Privacidade Shield (Encryption at Rest).**
    * **Decisão:** Uso da extensão `pgcrypto` para criptografar nomes de alunos.
    * **Justificativa:** Dados de menores são tóxicos. O banco armazena apenas `bytea` (blob criptografado). Apenas a instituição dona da chave pode descriptografar via RPC.

* **ADR-005: Ecossistema Supabase (Auth, DB, Vector, Storage).**
    * **Decisão:** Utilizar a suite completa para reduzir a superfície de DevOps.
    * **Justificativa:** Migrations, Auth e Vector Search integrados reduzem a necessidade de gerenciar múltiplos serviços AWS.

---

## 2. STACK TECNOLÓGICA

### Frontend & App
* **Framework:** Next.js 15 (App Router).
* **UI Library:** React 19 (RC/Canary).
* **Estilização:** Tailwind CSS + Shadcn/ui.
* **Offline/PWA:** `serwist` (Service Workers para cache de assets e requests).
* **State Management:** TanStack Query v5 (Data fetching) + React Context (UI State global).

### Backend & Infraestrutura
* **Database:** PostgreSQL (Supabase) com extensões `pgvector`, `pg_net` e `pgcrypto`.
* **Compute:** Supabase Edge Functions (Deno Runtime).
* **Storage:** Supabase Storage (Buckets privados para provas).
* **Auth:** Supabase Auth (Magic Link + Google).

### Serviços Externos & Mensageria
* **AI/LLM:** OpenAI (GPT-4o) ou Anthropic (Claude 3.5 Sonnet) via API.
* **Email:** Resend.
* **Push Notifications:** Web Push API (VAPID Keys).

---

## 3. MODELAGEM DE DADOS E SEGURANÇA (SCHEMA)

O coração do sistema. Foco em segurança (RLS + Criptografia) e Async (Jobs).

### 3.1. SQL Schema (PostgreSQL)

```sql
-- 1. Habilitar Extensões Críticas
create extension if not exists "vector";
create extension if not exists "pgcrypto";

-- 2. Tabela de Perfis (Professores)
create table public.profiles (
  id uuid references auth.users not null primary key,
  institution_id uuid, -- Link para a escola
  role text default 'teacher', -- 'teacher', 'admin'
  full_name text,
  created_at timestamptz default now()
);

-- 3. Tabela de Alunos (PII Encrypted - LGPD Friendly)
create table public.students (
  id uuid default gen_random_uuid() primary key,
  institution_id uuid not null, -- Apenas a escola dona vê
  encrypted_name bytea not null, -- DADOS CRIPTOGRAFADOS
  grade_level text not null, 
  created_at timestamptz default now()
);

-- 4. Fila de Trabalhos Assíncronos (Job Queue)
create table public.background_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  job_type text not null, -- 'ocr_correction', 'exam_generation'
  payload jsonb not null, -- { "image_url": "...", "exam_id": "..." }
  status text default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  result jsonb, -- Resultado da IA
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Configuração de Webhook (Trigger para Edge Function)
-- Sempre que um job entra, avisa a Edge Function
create trigger on_job_created
after insert on public.background_jobs
for each row
execute function supabase_functions.http_request(
  'https://<project-ref>.supabase.co/functions/v1/process-job',
  'POST',
  '{"Content-type":"application/json"}',
  '{"job_id":"' || new.id || '"}'
);

-- 6. Row Level Security (Segurança)
alter table public.background_jobs enable row level security;
create policy "Users can see own jobs" on public.background_jobs
  for select using (auth.uid() = user_id);
```

### 3.2. Funções de Criptografia (Stored Procedures)

O frontend nunca envia o binário criptografado, ele envia o texto plano para uma RPC segura.

```sql
-- Inserir Aluno (Criptografa no Server)
create or replace function create_secure_student(
  name_text text,
  grade text
) returns uuid language plpgsql security definer as $$
declare
  app_key text;
begin
  -- Recupera chave do Vault/Env
  app_key := current_setting('app.settings.encryption_key', true);
  
  insert into public.students (institution_id, encrypted_name, grade_level)
  values (
    (select institution_id from profiles where id = auth.uid()),
    pgp_sym_encrypt(name_text, app_key), -- Criptografia Simétrica
    grade
  );
end;
$$;
```

---

## 4. EDGE FUNCTION LOGIC (O CÉREBRO ASSÍNCRONO)

Caminho: `supabase/functions/process-job/index.ts`

```typescript
import { createClient } from '[https://esm.sh/@supabase/supabase-js@2](https://esm.sh/@supabase/supabase-js@2)'
import { Resend } from '[https://esm.sh/resend@3](https://esm.sh/resend@3)'
import webpush from '[https://esm.sh/web-push@3](https://esm.sh/web-push@3)'

Deno.serve(async (req) => {
  const { job_id } = await req.json()
  
  // 1. Setup Seguro
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!, 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

  // 2. Buscar Job e Atualizar Status
  const { data: job } = await supabase
    .from('background_jobs')
    .select('*')
    .eq('id', job_id)
    .single()
    
  await supabase.from('background_jobs').update({ status: 'processing' }).eq('id', job_id)

  try {
    let outputData;

    // 3. Roteamento de Estratégia
    if (job.job_type === 'ocr_correction') {
      // Chama OpenAI Vision ou Anthropic
      outputData = await runVisionPipeline(job.payload.image_url)
    } 
    else if (job.job_type === 'exam_generation') {
      // Gera prova baseada em BNCC (Vetores) + LLM
      outputData = await runExamGenerator(job.payload)
    }

    // 4. Finalizar Job
    await supabase.from('background_jobs').update({
      status: 'completed',
      result: outputData,
      updated_at: new Date().toISOString()
    }).eq('id', job_id)

    // 5. Notificar Usuário (Push Notification)
    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('data')
      .eq('user_id', job.user_id)
      .single()

    if (sub) {
      await webpush.sendNotification(sub.data, JSON.stringify({
        title: 'Pedagogi.ai',
        body: 'Sua correção foi concluída com sucesso! 🎉'
      }))
    }

    // 6. Enviar Email (Se necessário - ex: Relatório consolidado)
    if (job.job_type === 'weekly_report') {
       await resend.emails.send({
         from: 'Pedagogi AI <bot@pedagogi.ai>',
         to: ['user@email.com'],
         subject: 'Relatório Disponível',
         html: '<p>Seus dados estão prontos.</p>'
       })
    }

  } catch (error) {
    await supabase.from('background_jobs').update({
      status: 'failed',
      error_message: error.message
    }).eq('id', job_id)
  }

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
})
```

---

## 5. FRONTEND & UX (REACT 19)

### 5.1. Hook de Status em Tempo Real

Não bloquear a tela. Usar Realtime para atualizar a UI quando a Edge Function terminar.

```typescript
// hooks/use-job-monitor.ts
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useJobMonitor(jobId: string | null) {
  const [status, setStatus] = useState('pending')
  const supabase = createClient()

  useEffect(() => {
    if (!jobId) return

    const channel = supabase
      .channel(`job-${jobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'background_jobs',
        filter: `id=eq.${jobId}`
      }, (payload) => {
        const newStatus = payload.new.status
        setStatus(newStatus)
        
        if (newStatus === 'completed') {
          toast.success("Processamento concluído!")
        } else if (newStatus === 'failed') {
          toast.error("Erro no processamento.")
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [jobId])

  return status
}
```

### 5.2. Componente de Upload com Activity (React 19)

```tsx
// components/exam-upload.tsx
import { useOptimistic, startTransition } from 'react'
import { uploadExamAction } from '@/server/actions/exams'

export function ExamUpload() {
  // UI Otimista enquanto o upload acontece
  const [optimisticUploads, addOptimisticUpload] = useOptimistic(
    [],
    (state, newUpload) => [...state, newUpload]
  )

  async function handleFile(formData: FormData) {
    const fileId = crypto.randomUUID()
    
    // Feedback imediato
    startTransition(() => {
      addOptimisticUpload({ id: fileId, status: 'uploading' })
    })

    // Server Action (Upload + Insert Job)
    const result = await uploadExamAction(formData)
    
    if (result.success) {
      // O hook useJobMonitor cuidará do resto via Realtime
    }
  }

  return (
    <div>
      {/* Lista Otimista */}
      {optimisticUploads.map(u => <div key={u.id}>Enviando...</div>)}
      
      <form action={handleFile}>
        <input type="file" name="exam_image" />
        <button type="submit">Corrigir Prova</button>
      </form>
    </div>
  )
}
```

---

## 6. ESTRUTURA DE DIRETÓRIOS (BLUEPRINT)

```text
/
├── app/
│   ├── (auth)/             # Login, Register (Layout Clean)
│   ├── (dashboard)/        # Layout com Sidebar e UserState
│   │   ├── exams/          # Page: Listagem de Provas
│   │   ├── students/       # Page: Alunos (Decryption on fetch)
│   │   └── layout.tsx      # Notification Listener Global
│   ├── api/                # Webhooks Externos (Stripe)
│   └── sw.ts               # Service Worker (Serwist - Offline)
├── components/
│   ├── ui/                 # Shadcn Components
│   └── realtime/           # JobStatusIndicator.tsx
├── lib/
│   ├── supabase/           # Client/Server Connectors
│   └── crypto.ts           # Helpers (não chaves!)
├── server/
│   ├── actions/            # Mutations (Upload, Create Student)
│   └── queries/            # Data Fetching (Get Exams)
├── supabase/
│   ├── functions/          # Deno Edge Functions
│   │   └── process-job/    # The Brain
│   ├── migrations/         # SQL History
│   └── seed.sql            # Dados iniciais
├── public/
└── next.config.mjs
```

---

## 7. DEVOPS & ONBOARDING

### 7.1. Setup Local

```bash
# 1. Clone & Install
git clone git@github.com:pedagogi/platform.git
pnpm install

# 2. Supabase Start (Docker required)
npx supabase start

# 3. Deploy Edge Functions (Local development)
npx supabase functions serve process-job --no-verify-jwt

# 4. Generate VAPID Keys (For Push)
npx web-push generate-vapid-keys
# Adicione as chaves no .env.local
```

### 7.2. Pipeline de Deploy (GitHub Actions)
1.  **Check:** Biome Lint + Type Check.
2.  **Test:** Vitest Unit Tests.
3.  **Deploy App:** Vercel (Auto).
4.  **Deploy DB/Functions:** `supabase db push` e `supabase functions deploy` (apenas na `main`).

---

## 8. COMANDO FINAL

**Engenheiros:** O foco é a experiência do usuário. O professor não espera; ele é notificado. Os dados do aluno não são expostos; eles são blindados. Usem este blueprint para construir não apenas um software, mas uma infraestrutura confiável para a educação.
