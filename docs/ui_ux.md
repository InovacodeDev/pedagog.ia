# MASTER DESIGN & IMPLEMENTATION SPEC: PEDAGOGI.AI

**Versão:** 2.0 (Production Ready)
**Data:** 23 Novembro, 2025
**Autor:** O Mestre de UI/UX Expressivo
**Status:** Aprovado para Desenvolvimento
**Referências:**,

---

## PARTE 1: ESPECIFICAÇÃO DE DESIGN (UI/UX)

### 1. Visão e Fluxo

O objetivo não é apenas "corrigir provas", é **"devolver os fins de semana do professor"**. A interface deve eliminar a fricção de entrada de dados, transformando o professor de um "data entry clerk" em um gestor de aprendizado.

**Fluxo Crítico: "Scan-to-Grade" (Foto para Nota)**

1.  **Captura:** Professor fotografa a prova.
2.  **Processamento Otimista:** A interface reage instantaneamente (Latência Zero percebida), usando `useOptimistic` enquanto a Edge Function processa.
3.  **Human-in-the-Loop:** O professor valida a nota sugerida em uma interface tipo "Tinder" (Rápida e focada).

### 2. Fundamentos do Design System (M3 Expressivo)

#### 2.1 Cores Semânticas

- **Primary (Indigo Acadêmico):** Autoridade e Tecnologia.
- **Secondary (Teal Crescimento):** Sucesso e Notas Altas.
- **Tertiary (Coral):** Dicas da IA e Atenção.
- **Surface (Slate):** Limpeza visual para evitar fadiga cognitiva.

#### 2.2 Tipografia

- **Display:** `Space Grotesk` (Personalidade Tech).
- **UI/Body:** `Inter` (Legibilidade densa para OCR).

#### 2.3 Motion Tokens

- **Slide Up Fade:** Usado em listas para entrada suave.
- **Pulse AI:** Usado para indicar que a "Inteligência" está trabalhando nos bastidores.

### 3. Especificação de Componentes Chave

#### **A. ExamTaskCard (Lista de Tarefas)**

- **Estados:**
  - _Processing:_ Exibe animação `pulse` e barra de progresso indeterminada.
  - _Action Required:_ Borda `Warning` (Amarelo/Laranja) se o OCR tiver baixa confiança.
  - _Success:_ Ícone `CheckCircle` em `Secondary` (Teal).
- **Interação:** Clique abre o `ValidationDeck`.

#### **B. ValidationDeck (Validação)**

- **Layout:** Split-view (Imagem Original no topo/esquerda vs. Texto Reconhecido no fundo/direita).
- **Ação:** Atalhos de teclado (`Enter` para confirmar, `Setas` para navegar) para velocidade máxima no Desktop.

---

## PARTE 2: IMPLEMENTAÇÃO TÉCNICA (CODE READY)

Copie e cole os arquivos abaixo para configurar a fundação do Design System no projeto Next.js 15.

### 1. `app/globals.css` (CSS Variables & Tokens)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* --- PALETA BASE (LIGHT MODE) --- */
    /* Background: Slate-50 / Foreground: Slate-900 */
    --background: 210 40% 98%;
    --foreground: 222 47% 11%;

    /* PRIMARY: Indigo-600 */
    --primary: 249 72% 60%;
    --primary-foreground: 210 40% 98%;

    /* SECONDARY: Teal-600 */
    --secondary: 175 84% 32%;
    --secondary-foreground: 210 40% 98%;

    /* TERTIARY: Coral/Orange */
    --tertiary: 14 85% 65%;
    --tertiary-foreground: 222 47% 11%;

    /* ERROR: Red-600 */
    --destructive: 0 72% 51%;
    --destructive-foreground: 210 40% 98%;

    /* SURFACE CONTAINERS */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* BORDERS & INPUTS */
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 249 72% 60%;

    /* SHAPE SYSTEM (M3) */
    --radius: 0.75rem; /* 12dp (Corner-M) */
  }

  .dark {
    /* --- PALETA BASE (DARK MODE) --- */
    /* Background: Slate-950 */
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;

    /* PRIMARY: Indigo-300 (Pastel para contraste escuro) */
    --primary: 226 71% 82%;
    --primary-foreground: 222 47% 11%;

    /* SECONDARY: Teal-300 */
    --secondary: 166 79% 64%;
    --secondary-foreground: 222 47% 11%;

    /* TERTIARY: Coral Suave */
    --tertiary: 14 85% 75%;
    --tertiary-foreground: 222 47% 11%;

    /* ERROR: Red-400 */
    --destructive: 0 62% 71%;
    --destructive-foreground: 222 47% 11%;

    /* SURFACES */
    --card: 217 33% 17%;
    --card-foreground: 210 40% 98%;
    --popover: 217 33% 17%;
    --popover-foreground: 210 40% 98%;

    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 224 71% 82%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
  }
}
```

### 2. `tailwind.config.ts` (Theme Config)

```typescript
import type { Config } from 'tailwindcss';
const { fontFamily } = require('tailwindcss/defaultTheme');

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-space)', ...fontFamily.sans],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-up': 'slide-up-fade 0.4s cubic-bezier(0.2, 0, 0, 1)',
        'pulse-ai': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
```

### 3. `app/layout.tsx` (Font Injection)

```tsx
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
});

export const metadata = {
  title: 'Pedagogi.ai | Sistema Operacional Cognitivo',
  description: 'Correção de provas e planejamento automatizado para professores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          spaceGrotesk.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
```

---

**Nota Final de Engenharia:**
Esta configuração suporta integralmente a biblioteca **Shadcn/ui** recomendada no TDD. Ao adicionar componentes (`npx shadcn-ui@latest add button`), eles herdarão automaticamente os tokens `primary`, `radius`, e `font-sans` definidos acima, garantindo consistência imediata com o Design System.
