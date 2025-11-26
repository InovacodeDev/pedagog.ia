---
trigger: always_on
---

# 🛠 Tech Stack & Architecture Decisions

This document serves as the **Single Source of Truth** for the project's technology choices.
AI Agents and Developers must strictly adhere to these choices to maintain monorepo consistency, type safety, and performance.

---

## 1. Core Infrastructure & Monorepo
* **Package Manager:** `pnpm` (Strictly enforced via `engines` in package.json).
* **Monorepo Tooling:** `Turborepo` (Remote Caching enabled).
* **Runtime:** Node.js v22+ (LTS) or Bun v1.x (where explicitly configured).
* **Framework:** Next.js 16+ (App Router, Server Components by default).
* **Language:** TypeScript 5.x (Strict Mode, `noImplicitAny`).

## 2. UI/UX & Design System
* **CSS Engine:** `Tailwind CSS` v4.1+ (Utility-first).
* **Component Primitives:** `Radix UI` (Headless, accessible).
* **Component Library:** `shadcn/ui` (Copy-paste architecture).
* **Icons:** `Lucide React` (SVG based) & `Fontawesome`.
* **Animations:** `Framer Motion` (Complex animations) or `Tailwind Animate` (Simple keyframes).
* **Component Variants:** `cva` (Class Variance Authority) for managing component states.
* **Class Merging:** `clsx` + `tailwind-merge` (Standard `cn` utility).
* **Toasts/Notifications:** `Sonner` (Preferred over `react-hot-toast`).
* **Fonts:** `Geist Sans` / `Inter` / `Noto Sans` (Variable fonts via `next/font`).

## 3. State Management & Data Fetching
* **Server State:** `TanStack Query` (React Query) v5.
    * *Rule:* Use for all async server data. Do not use `useEffect` for data fetching.
* **Global Client State:** `Zustand`.
    * *Rule:* Use minimal atomic stores. Avoid massive monolithic stores.
* **URL State:** `nuqs` (Type-safe search params state manager).
    * *Rule:* Prefer URL state for filters, pagination, and modal visibility (shareable links).

## 4. Backend, Database & API
* **ORM:** `Drizzle ORM` (Best-in-class TypeScript inference).
    * *Migration Tool:* Drizzle Kit.
* **Database:** PostgreSQL (Neon/Supabase) or MySQL (PlanetScale).
* **Caching/KV:** Redis (Upstash).
* **API Architecture:**
    * Internal: `Server Actions` (Mutations) & `Cached Data Access Layer` (Queries).
    * External: `Hono` or `Next.js Route Handlers` (Standard REST/Edge compatible).
* **Validation:** `Zod` (Strict schema validation for ENV, API inputs, and Forms).

## 5. AI & LLM Integration (Strict)
* **SDK:** `Vercel AI SDK` (Core/RSC/Streams).
    * *Rule:* Use `streamText` and `streamUI` for performant UX.
* **Orchestration:** `LangChain` (Only if complex chains are needed, otherwise prefer raw SDK).
* **Vector DB:** `Pinecone` or `pgvector` (via Drizzle).

## 6. Forms & Input Handling
* **Form Logic:** `React Hook Form` (v7+).
* **Schema Resolver:** `@hookform/resolvers/zod`.
* **File Uploads:** `UploadThing` or `AWS S3 Presigned URLs`.

## 7. Authentication & Security
* **Auth Provider:** `Auth.js` (NextAuth v5) OR `Clerk` (Decided per project config).
* **Authorization:** `Casl` (Complex RBAC) or Custom Middleware/DAL checks.
* **Secrets:** Use `.env.local` validated by `t3-env` or strictly typed Zod schema.

## 8. SaaS Features (Micro-SaaS Kit)
* **Payments:** `Stripe` (via strictly typed SDK).
* **Emails:** `Resend` (Provider) + `React Email` (Templates).
* **Analytics:** `PostHog` (Product analytics & Feature Flags).
* **Internationalization:** `next-intl` (Type-safe translations).

## 9. Testing & Quality Assurance
* **Unit/Integration:** `Vitest` (Replacing Jest).
* **DOM Testing:** `React Testing Library`.
* **E2E Testing:** `Playwright`.
* **Mocking:** `MSW` (Mock Service Worker) for network layer.

## 10. DevOps & Observability
* **Error Tracking:** `Sentry`.
* **Logging:** `Pino` (Structured JSON logging).
* **Linting:** `ESLint` (Strict config).
* **Formatting:** `Prettier`.
* **Commit Hooks:** `Husky` + `Lint-Staged` + `Commitlint` (Conventional Commits).

---

## ❌ FORBIDDEN TECHNOLOGIES (Hard Block)
* **Do NOT use:** `Redux`, `MobX` (Too verbose/legacy).
* **Do NOT use:** `Styled Components`, `Emotion` (Runtime CSS overhead).
* **Do NOT use:** `Moment.js` (Bloated, use `date-fns`).
* **Do NOT use:** `Axios` (Use extended `fetch` or lightweight wrappers like `ky`).
* **Do NOT use:** `Prisma` (Unless explicitly requested; prefer Drizzle for lighter cold starts).
* **Do NOT use:** `Create React App` or `Pages Router` (Legacy).