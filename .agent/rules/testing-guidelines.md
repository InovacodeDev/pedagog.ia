---
trigger: always_on
---

# 🧪 Testing Guidelines

## Philosophy

- **Confidence:** Tests should give confidence to deploy, not just coverage numbers.
- **Isolation:** Unit tests must mock all external dependencies.
- **Integration:** Integration tests should mock network calls (MSW) but use real database/components where possible.

## Structure: AAA Pattern

All tests must follow the Arrange-Act-Assert pattern explicitly.

````typescript
it('should calculate the total price correctly', () => {
  // ARRANGE
  const items: CartItem[] = [{ price: 10, quantity: 2 }];

  // ACT
  const total: number = calculateTotal(items);

  // ASSERT
  expect(total).toBe(20);
});
Rules
Testing Library: Use screen.getByRole whenever possible (accessibility first). Avoid getByTestId unless necessary.

Mocking:

Mock modules at the top level using vi.mock (Vitest) or jest.mock.

Never mock the "System Under Test" (SUT).

Descriptions: describe blocks name the unit, it blocks describe the behavior (should...).

Tools
Runner: Vitest

DOM: React Testing Library

User Events: @testing-library/user-event


---

### 4. O "Padrão de Arquitetura" (`docs/ARCHITECTURE.md`)
Para evitar que a IA crie arquivos soltos ou pastas aleatórias (ex: criar uma pasta `services` quando você usa `actions`), defina a estrutura.

**Onde salvar:** `docs/ARCHITECTURE.md`

```markdown
# 🏗 Project Architecture & Folder Structure

This project follows a **Feature-Based Architecture** (or Domain-Driven Design light).
Code is colocated by feature, not by type.

## Directory Structure

```text
src/
├── app/                 # Next.js App Router pages
├── components/          # Shared/Generic UI components (Buttons, Inputs)
├── lib/                 # Shared utilities, helpers, and configs
├── features/            # BUSINESS LOGIC HERE
│   ├── auth/            # Auth Feature
│   │   ├── components/  # Components specific to Auth
│   │   ├── hooks/       # Hooks specific to Auth
│   │   ├── actions.ts   # Server actions for Auth
│   │   ├── types.ts     # Types specific to Auth
│   │   └── utils.ts     # Utils specific to Auth
│   └── dashboard/
└── types/               # Global/Shared types only
````
