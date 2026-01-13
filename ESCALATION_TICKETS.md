**Title:** [JULES-ESCALATION] UI/UX: Arbitrary Tailwind Values
**Location:** Multiple files (see below)
**Reason:** The codebase contains numerous arbitrary Tailwind values (e.g., `w-[350px]`, `h-[50vh]`, `text-[10px]`) which violate the "No magic numbers" rule. However, replacing them all requires a careful design review to ensure visual regressions do not occur, especially for complex layouts like `ExamEditor.tsx` (A4 paper simulation) and `Sidebar`.
**Suggestion:**
1.  Review `tailwind.config.ts` to ensure adequate spacing/sizing tokens exist.
2.  Refactor `w-[350px]` to `w-80` or `w-96` (closest matches).
3.  Refactor `text-[10px]` to `text-[0.625rem]` or add a `text-xxs` utility.
4.  For print layouts (`21cm`), consider keeping them or moving to a dedicated "print" class utility.
**Affected Files (Sample):**
- `login/page.tsx`
- `app/(app)/classes/classes-list.tsx`
- `components/landing/features-grid.tsx`
- `components/questions/question-card.tsx`
- `components/builder/ExamEditor.tsx`
