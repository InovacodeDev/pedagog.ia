# PROJECT CONSTITUTION & CODING STANDARDS

> **Single Source of Truth** for AI Agents (Jules) regarding Code Style, Security, and UI/UX.

## 1. TECH STACK & ARCHITECTURE

- **Framework:** Next.js (App Router preferred)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + shadcn/ui (Radix Primitives)
- **State:**
  - **Server:** TanStack Query (React Query) v5
  - **Client:** React Context / Zustand (Avoid Redux unless legacy)
- **Forms:** React Hook Form + Zod (Validation)
- **API Architecture:** Server Actions (Mutations) & Cached Data Access Layer (Queries)
- **AI:** GoogleGenerativeAI
- **Architecture:** Modular/Atomic.
  - `@/components/ui`: Base primitive components (Buttons, Inputs).
  - `@/features`: Domain-specific modules (Auth, Dashboard).
  - `@/lib`: Utilities and helpers.

## 2. DESIGN SYSTEM & TOKENS (UI/UX)

**Strict Rule:** No magic numbers. Use Tailwind classes or CSS variables.

### Color Palette (Tailwind Mapping)

- **Primary Action:** `bg-primary` / `text-primary-foreground` (Do not use raw hex codes like `#3b82f6`)
- **Destructive/Error:** `bg-destructive` / `text-destructive-foreground`
- **Muted/Subtle:** `text-muted-foreground`
- **Borders:** `border-input` or `border-border`

### Spacing & Sizing

- **Base Unit:** 4px (0.25rem).
- **Margins/Paddings:** Use `p-4` (16px), `m-8` (32px). Avoid `m-[13px]`.
- **Border Radius:** Use `rounded-md` (default) or `rounded-full`.

### Typography

- **Headings:** `text-2xl font-bold tracking-tight` (H1/H2).
- **Body:** `text-sm` or `text-base`.
- **Micro-copy:** `text-xs text-muted-foreground`.

## 3. SECURITY & COMPLIANCE (LGPD/GDPR/SOC2)

**Zero Tolerance** for sensitive data exposure.

### PII (Personally Identifiable Information) Patterns

Flag and block any string matching these patterns outside of `.env` or mocked tests:

- **CPF/CNPJ:** `\d{3}\.\d{3}\.\d{3}-\d{2}`
- **Email:** (Real emails in code are forbidden). Use `user@example.com` for tests.
- **Credit Cards:** Sequences of 16 digits.
- **Phone Numbers:** `(\d{2}) \d{4,5}-\d{4}`

### Allowed Environment Variables

Only these keys are allowed to be accessed via `process.env`:

- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`
- `JWT_SECRET`
- `STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY`

## 4. CODE HYGIENE & CONVENTIONS

### Strict TypeScript Rules

- **No `any`:** Use `unknown` with type narrowing if necessary.
- **Explicit Returns:** All functions must have explicit return types.
- **Immutability:** Usage of `const` is mandatory; `let` only if strictly necessary.
- **Interfaces vs Types:** Use `Interface` for objects and `Type` for unions/primitives.

### Naming

- **Components:** `PascalCase` (e.g., `UserProfile.tsx`)
- **Functions/Hooks:** `camelCase` (e.g., `useAuth`, `fetchUserData`)
- **Booleans:** Must start with `is`, `has`, `should` (e.g., `isEnabled`).
- **Constants:** `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`)

### Structure

- **Exports:** Use Named Exports (`export const Button = ...`) over Default Exports to facilitate refactoring.
- **Imports:** Use absolute imports (`@/components/...`) instead of relative (`../../../components`).

### Error Handling

- All Async/Await calls must be wrapped in `try/catch`.
- Errors must be logged to the monitoring service (e.g., Sentry) AND displayed to the user via Toast/Alert (generic message).

## 5. TESTING

- **Pattern:** Follow AAA (Arrange-Act-Assert).
- **Confidence:** Tests should provide confidence to deploy, not just coverage numbers.
- **Mocking:** Mock all external dependencies in unit tests.
