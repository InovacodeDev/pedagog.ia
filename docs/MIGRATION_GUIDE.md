# 🚀 Next.js 15 + React 19 + Tailwind v4 Migration Guide

## 1. Next.js 15: Async Request APIs

In Next.js 15, `params`, `searchParams`, `cookies()`, and `headers()` are now **Promises**. You must `await` them before access.

### ❌ Old Way (Next.js 14)

```tsx
// app/blog/[slug]/page.tsx
export default function Page({ params }: { params: { slug: string } }) {
  return <div>Slug: {params.slug}</div>;
}
```

### ✅ New Way (Next.js 15)

```tsx
// app/blog/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // MUST AWAIT
  return <div>Slug: {slug}</div>;
}
```

## 2. React 19: Actions & Compiler

### React Compiler

Enabled in `next.config.ts`:

```ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
};
```

### Server Actions

Use `useActionState` instead of `useFormState`.

```tsx
'use client';
import { useActionState } from 'react';
import { createStudentAction } from '@/server/actions/students';

export function CreateStudentForm() {
  const [state, formAction, isPending] = useActionState(createStudentAction, null);

  return <form action={formAction}>{/* ... */}</form>;
}
```

## 3. Tailwind CSS v4

Configuration is now **CSS-first**. `tailwind.config.ts` has been deleted.
Theme tokens are defined in `app/globals.css` using the `@theme` block.

### Example `@theme` usage:

```css
@theme {
  --color-primary: hsl(var(--primary));
  --animate-slide-up: slide-up-fade 0.4s cubic-bezier(0.2, 0, 0, 1);
}
```

## 4. Troubleshooting

If you see dependency warnings about `react@19` peer dependencies, `pnpm.overrides` in `package.json` handles this by forcing React 19 resolution.

```json
"pnpm": {
  "overrides": {
    "react": "19.0.0-rc-...",
    "react-dom": "19.0.0-rc-..."
  }
}
```
