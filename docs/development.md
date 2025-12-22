# DEVELOPMENT_GUIDE.MD: O GRIMÓRIO DE EXECUÇÃO DO PEDAGOGI.AI

**Versão do Grimório:** 1.0.0 (Genesis)
**Status:** Aprovado para Materialização
**Arquitetura:** Event-Driven / Async-First
**Stack:** Next.js 15, React 19, Supabase (DB/Auth/Edge), Deno, OpenAI.

---

## PARTE I: A VISÃO E OS PRINCÍPIOS (O "PORQUÊ")

### 1. Introdução: O Propósito do Projeto

Estamos construindo o **Sistema Operacional Cognitivo** para professores. A Pedagogi.ai resolve a crise de ineficiência operacional na educação básica. O objetivo não é apenas criar software, mas eliminar a latência entre a aplicação de uma prova e o feedback pedagógico, devolvendo o tempo livre ao professor através da automação do ciclo "Planejar-Criar-Corrigir".

### 2. Princípios Norteadores

A execução técnica deve obedecer estritamente aos seguintes dogmas, derivados do TDD e PRD:

- **Princípio de Produto (Speed as a Feature):** A interface deve ser "Otimista". O professor nunca espera o servidor. Usamos `useOptimistic` e processamento em background para latência percebida zero.
- **Princípio de Engenharia (Async & Event-Driven):** Não bloqueamos a thread principal. OCR e LLM são tarefas pesadas delegadas para **Edge Functions** via filas no banco de dados.
- **Princípio de Segurança (Privacy Shield):** Dados de alunos (PII) são tóxicos. Nomes de alunos são criptografados em repouso (`pgcrypto`) e só descriptografados no momento da leitura autorizada.

### 3. Métricas de Sucesso (OKRs Técnicos)

1.  **Performance:** OCR processando e retornando status em < 4 segundos (meta técnica).
2.  **Estabilidade:** 99.9% de uptime no webhook de ingestão de jobs.
3.  **Qualidade:** LTV:CAC > 3:1 (dependente da retenção gerada pela UX fluida).

---

## PARTE II: O ALICERCE (SETUP E FUNDAÇÕES)

Estas tarefas preparam o solo sagrado onde o código habitará.

### TAREFA-SETUP-001: Inicialização do Repositório e Ambiente

- **Fonte:** TDD Seção 2 & 6 (Stack & DevOps)
- **Comando:**
  ```bash
  npx create-next-app@latest pedagogi-platform --typescript --tailwind --eslint
  # Selecionar: App Router? Yes. Src directory? No. Import alias? @/*
  cd pedagogi-platform
  pnpm install
  ```
- **Configuração de Dependências Core:**
  ```bash
  pnpm add @supabase/supabase-js @tanstack/react-query lucide-react clsx tailwind-merge sonner next-themes
  pnpm add -D prettier prettier-plugin-tailwindcss husky lint-staged
  ```
- **Configuração de Tooling:**
  - Inicializar `git`.
  - Configurar `.prettierrc` para garantir consistência de estilo.
  - Configurar `husky` para rodar lint antes de cada commit.

### TAREFA-SETUP-002: Implementação do Design System (M3 Expressivo)

- **Fonte:** UI/UX Doc (Parte 2: Implementação Técnica)
- **Ação:** Substituir o conteúdo de `tailwind.config.ts` e `app/globals.css` pelos tokens exatos fornecidos no documento de UI/UX.
- **Configuração de Fontes:**
  - Em `app/layout.tsx`, injetar `Inter` e `Space_Grotesk` via `next/font/google` conforme especificado.
- **Instalação do Shadcn:**
  ```bash
  npx shadcn-ui@latest init
  # Style: Default. Base Color: Slate. CSS Variables: Yes.
  ```
- **Critério de Aceite:** A aplicação roda com as fontes corretas e as variáveis CSS de cores (`--primary`, `--secondary`) refletem os valores HSL do documento de UI/UX.

### TAREFA-IAC-001: Provisionamento de Dados e Segurança (Supabase)

- **Fonte:** TDD Seção 3 (Modelagem de Dados)
- **Ação:** Rodar as seguintes queries SQL no Supabase Dashboard (SQL Editor) para habilitar a criptografia e vetores.
  ```sql
  -- Extensões
  create extension if not exists "vector";
  create extension if not exists "pgcrypto";
  create extension if not exists "pg_net";
  ```

---

## PARTE III: A ARQUITETURA E OS SERVIÇOS CENTRAIS

### TAREFA-BE-001: Implementação do Schema de Banco de Dados (Core)

- **Fonte:** TDD Seção 3.1
- **Descrição Técnica:**
  Criar as tabelas fundamentais. Note o uso de `bytea` para nomes de alunos (criptografia).
  1.  **Profiles:** Extensão da tabela `auth.users`.
  2.  **Students:** Tabela sensível com `encrypted_name`.
  3.  **Background_Jobs:** A fila de processamento para o padrão Event-Driven.
- **Script SQL Obrigatório:**
  Utilizar _exatamente_ o SQL fornecido no TDD, Seção 3.1.
- **Critério de Aceite:** Tabelas criadas. RLS (Row Level Security) habilitado. Trigger `on_job_created` configurado para chamar a Edge Function (mesmo que a função ainda não exista, o trigger deve estar pronto).

### TAREFA-BE-002: Orquestração de Edge Functions (The Brain)

- **Fonte:** TDD Seção 4
- **Ação:** Configurar o ambiente Deno local e criar a função processadora.
  ```bash
  npx supabase functions new process-job
  ```
- **Implementação:**
  Copiar o código TypeScript da Seção 4 do TDD para `supabase/functions/process-job/index.ts`.
  - **Atenção:** Assegurar que as variáveis de ambiente `OPENAI_API_KEY` (ou Anthropic) e `RESEND_API_KEY` estejam configuradas no painel do Supabase.
- **DoD:** Deploy da função realizado (`npx supabase functions deploy process-job`) e URL do webhook configurada no Trigger do banco de dados.

### TAREFA-FE-001: Cliente Supabase & Contexto de Auth

- **Fonte:** TDD Seção 6 (Estrutura)
- **Ação:**
  1.  Criar `lib/supabase/client.ts` (Browser Client).
  2.  Criar `lib/supabase/server.ts` (Server Client para Server Components).
  3.  Criar `lib/supabase/middleware.ts` (Para proteção de rotas).
- **DoD:** O fluxo de Login com Google ou Magic Link redireciona corretamente para `/dashboard` e cria/verifica a entrada na tabela `public.profiles`.

---

## PARTE IV: A CONSTRUÇÃO (ÉPICOS DE FEATURES)

### ÉPICO 1: O MOTOR DE CORREÇÃO "SCAN-TO-GRADE" (CORE)

**Visão:** O professor fotografa, a UI reage instantaneamente, a IA processa em background e notifica.

#### **TAREFA-CORE-001: Componente de Upload Otimista**

- **História:** "Como professor, quero enviar a foto da prova e continuar trabalhando sem esperar o upload terminar."
- **Requisitos:** UI/UX Seção 1 (Fluxo Crítico), TDD Seção 5.2.
- **Descrição Técnica:**
  - Criar componente `ExamUpload.tsx`.
  - Utilizar o hook `useOptimistic` do React 19 para adicionar o item à lista de "Provas Sendo Processadas" instantaneamente ao selecionar o arquivo.
  - Implementar Server Action `uploadExamAction` que:
    1.  Faz upload da imagem para o Supabase Storage (Bucket: `exams`).
    2.  Insere um registro na tabela `background_jobs` com `status: 'pending'` e `type: 'ocr_correction'`.
- **DoD:** O arquivo aparece na lista com status "Enviando..." imediatamente. O registro é criado no DB.

#### **TAREFA-CORE-002: Monitoramento Realtime (Feedback)**

- **História:** "Quero saber quando a correção terminou."
- **Requisitos:** TDD Seção 5.1.
- **Descrição Técnica:**
  - Criar hook `useJobMonitor(jobId)`.
  - Utilizar `supabase.channel` para escutar `UPDATE` na tabela `background_jobs`.
  - Quando o status mudar para `completed`, disparar um Toast (Sonner) "Correção Concluída!".
- **DoD:** Ao alterar manualmente o status no banco de dados para 'completed', o frontend deve exibir o toast sem recarregar a página.

#### **TAREFA-CORE-003: Integração de Visão Computacional (IA)**

- **História:** "O sistema deve ler minhas anotações e o gabarito."
- **Requisitos:** TDD Seção 4, PRD Fase 1.
- **Descrição Técnica:**
  - Na Edge Function `process-job`:
  - Implementar lógica `runVisionPipeline` que chama a API da OpenAI (GPT-4o) ou Claude 3.5 Sonnet.
  - Prompt do Sistema: "Você é um assistente de correção ótica. Analise a imagem enviada. Identifique as respostas manuscritas e compare com o gabarito fornecido no payload JSON. Retorne um JSON estrito com { student_name, answers: [], score }."
- **DoD:** A função recebe o Job, processa a imagem e grava o resultado JSON na coluna `result` da tabela `background_jobs`.

#### **TAREFA-CORE-004: Interface de Validação (Human-in-the-loop)**

- **História:** "Quero conferir se a IA leu certo antes de fechar a nota."
- **Requisitos:** UI/UX Componente B (ValidationDeck).
- **Descrição Técnica:**
  - Criar página `/exams/[id]/validate`.
  - Layout Split-View: Imagem original (zoomable) à esquerda, inputs do formulário preenchidos pela IA à direita.
  - Implementar atalhos de teclado: `Enter` para aceitar, `Setas` para navegar entre questões.
- **DoD:** O professor pode editar uma nota errada pela IA e salvar o resultado final na tabela de notas (a ser criada).

---

### ÉPICO 2: GESTÃO DE TURMAS E DADOS SENSÍVEIS (PRIVACIDADE)

**Visão:** Gerenciar alunos em conformidade com LGPD, usando criptografia no banco.

#### **TAREFA-SEC-001: RPC de Criação de Aluno Seguro**

- **História:** "Como sistema, preciso salvar nomes de alunos sem expô-los em texto plano no DB."
- **Requisitos:** TDD Seção 3.2, ADR-004.
- **Descrição Técnica:**
  - Criar função PostgreSQL `create_secure_student` (conforme código no TDD).
  - Esta função deve usar `pgp_sym_encrypt` com uma chave armazenada em Vault ou Variável de Ambiente do Supabase.
- **DoD:** Ao inserir um aluno via RPC, o campo `encrypted_name` no banco deve ser uma string binária ilegível.

#### **TAREFA-SEC-002: Listagem de Alunos (Decryption on the Fly)**

- **História:** "Como professor, quero ver a lista de chamada."
- **Requisitos:** PRD Fase 2.
- **Descrição Técnica:**
  - Criar função RPC `get_students_decrypted` que recebe a chave da instituição e retorna os nomes em texto plano.
  - **Segurança:** Esta função só deve ser executável por usuários com `role` verificado na mesma `institution_id`.
- **DoD:** O frontend exibe os nomes corretamente, mas um `SELECT * FROM students` direto no banco mostra apenas lixo criptografado.

---

## PARTE V: POLIMENTO E LANÇAMENTO (DEPLOY)

### TAREFA-DEPLOY-001: Pipeline de CI/CD

- **Fonte:** PM Prompt Parte II / TDD Seção 7.2
- **Ação:**
  - Configurar GitHub Actions para rodar `pnpm build` e `pnpm test` (Vitest) em cada PR.
  - Conectar repositório à Vercel.
  - Configurar variáveis de ambiente de Produção na Vercel e Supabase.

### TAREFA-DEPLOY-002: PWA & Offline Support

- **Fonte:** TDD Seção 2 & 6 (`sw.ts`).
- **Ação:**
  - Configurar `serwist` ou `next-pwa`.
  - Garantir que o manifesto `manifest.json` esteja presente com ícones e cores do tema.
  - Cachear rotas estáticas e assets de UI.
- **DoD:** O Lighthouse reporta "Installable" e a aplicação carrega o shell básico sem internet.

### TAREFA-DEPLOY-003: Auditoria Final (O Selo do Mago)

- **Ação:**
  1.  Verificar se todas as chaves de API estão rodadas.
  2.  Rodar testes de carga no endpoint da Edge Function.
  3.  Verificar acessibilidade (Aria labels) nos inputs de correção.

---

**COMANDO FINAL PARA A EQUIPE:**
Este grimório contém a essência da Pedagogi.ai. A estrutura é sólida, a segurança é paranoica por design e a experiência do usuário é obcecada por velocidade. Não desviem do caminho. Cada linha de código deve servir para economizar segundos da vida do professor. **Executem.**
