# Deployment Guide

## Prerequisites

- Supabase Project
- Vercel Account

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

## PWA

The project is configured as a PWA using `@serwist/next`.

- Manifest: `public/manifest.json`
- Service Worker: `app/sw.ts`

## CI/CD

GitHub Actions is configured in `.github/workflows/ci.yml`.
It runs:

- Linting
- Type Checking
- Tests (Vitest)

## Testing

Run unit tests with:

```bash
pnpm test
```

## Production Build

```bash
pnpm build
```
