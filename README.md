# 🎓 Pedagogi.ai

![Status](https://img.shields.io/badge/status-beta-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

**O Sistema Operacional Cognitivo para Professores**

Pedagogi.ai transforma fotos de provas em notas no diário de classe, automaticamente. Correção em segundos, privacidade blindada, e planejamento baseado na BNCC.

---

## ✨ Features

- 📸 **Scan-to-Grade**: Fotografe a prova, receba a nota corrigida pela IA
- 🔒 **Privacy Shield**: Dados de alunos criptografados com `pgcrypto` (LGPD compliant)
- ⚡ **Async-First**: Processamento em background via Supabase Edge Functions
- 🔄 **Real-time Updates**: Notificações instantâneas via Supabase Realtime
- 📱 **PWA Ready**: Funciona offline para escolas com Wi-Fi instável
- 🎯 **BNCC Planning**: (Roadmap) Geração de provas baseada na Base Nacional Comum Curricular

---

## 🛠 Tech Stack

| Layer             | Technology                                            |
| ----------------- | ----------------------------------------------------- |
| **Frontend**      | Next.js 15 (App Router), React 19, Tailwind CSS       |
| **UI Components** | Shadcn/UI, Radix UI                                   |
| **Backend**       | Supabase (PostgreSQL, Auth, Storage, Realtime)        |
| **Compute**       | Supabase Edge Functions (Deno)                        |
| **AI**            | OpenAI GPT-4 Vision / Anthropic Claude (Mock for MVP) |
| **State**         | TanStack Query, Zustand                               |
| **Validation**    | Zod                                                   |
| **Testing**       | Vitest, React Testing Library                         |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ (LTS)
- **pnpm** 9+
- **Docker** (for local Supabase)
- **Supabase CLI** (install: `npm i -g supabase`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/pedagog_ai.git
cd pedagog_ai

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start local Supabase (Docker required)
npx supabase start

# 5. Run database migrations
npx supabase db reset

# 6. (Optional) Seed test data
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql

# 7. Start the development server (Runs on port 9901)
pnpm dev
```

Open [http://localhost:9901](http://localhost:9901) 🎉

### 🔑 Environment Variables

Create a `.env.local` file with the following keys:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:9901

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Web Push (VAPID Keys)
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:support@pedagogi.ai

# Auth
NEXTAUTH_SECRET=your_generated_secret # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:9901
```

### 💳 Stripe Webhook Setup

To test Stripe webhooks locally:

1. Install Stripe CLI
2. Login: `stripe login`
3. Listen to events forwarding to port 9901:

```bash
stripe listen --forward-to localhost:9901/api/webhooks/stripe
```

4. Copy the `whsec_...` secret to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

---

## 📁 Project Structure

```
pedagog_ai/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Public auth pages
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── globals.css          # Design system CSS variables
│   └── layout.tsx           # Root layout with fonts
├── components/              # React components
│   ├── ui/                  # Shadcn/UI components
│   └── landing/             # Landing page sections
├── hooks/                   # Custom React hooks
│   └── use-job-monitor.ts   # Real-time job status hook
├── lib/                     # Utilities
│   ├── supabase/            # Supabase clients
│   └── utils.ts             # Helper functions
├── server/                  # Server-side logic
│   └── actions/             # Server Actions
│       ├── exams.ts         # Exam upload logic
│       └── students.ts      # Student CRUD (encrypted)
├── supabase/
│   ├── functions/           # Edge Functions (Deno)
│   │   └── process-job/     # Async job processor
│   ├── migrations/          # Database schema
│   └── seed.sql             # Test data
├── types/                   # TypeScript definitions
│   └── database.ts          # Supabase types
└── docs/                    # Documentation
    ├── tdd.md               # Technical Design Doc
    ├── ui_ux.md             # Design System Spec
    └── SETUP.md             # Detailed setup guide
```

---

## 🔐 Security & Privacy

### Encryption at Rest

Student names are **never stored in plain text**. We use PostgreSQL's `pgcrypto` extension:

1. **Client** sends plain text name to Server Action
2. **Server Action** calls RPC `create_secure_student`
3. **Database** encrypts with `pgp_sym_encrypt` before storage
4. **Decryption** only happens server-side via `get_students_decrypted` RPC

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access:

- Their own jobs (`background_jobs`)
- Students from their institution (`students`)
- Their own profile (`profiles`)

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Type check
pnpm type-check

# Lint
pnpm lint
```

---

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)**: Detailed installation and configuration
- **[Technical Design](docs/tdd.md)**: Architecture and database schema
- **[UI/UX Spec](docs/ui_ux.md)**: Design system and component guidelines

---

## 🚢 Deployment

### Vercel (Frontend)

```bash
# Deploy to Vercel
vercel --prod
```

### Supabase (Backend)

```bash
# Deploy database migrations
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy process-job
```

---

## 🛣 Roadmap

- [x] Core OCR pipeline (Mock)
- [x] Student encryption (Privacy Shield)
- [x] Real-time job monitoring
- [ ] OpenAI GPT-4 Vision integration
- [ ] BNCC-based exam generation
- [ ] Web Push notifications
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) first.

---

## 💬 Support

- **Email**: support@pedagogi.ai
- **Discord**: [Join our community](https://discord.gg/pedagogi)
- **Issues**: [GitHub Issues](https://github.com/your-org/pedagog_ai/issues)

---

**Built with ❤️ for teachers who deserve their weekends back.**
