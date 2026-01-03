## 2024-05-23 - Stored XSS in Exam Blocks
**Vulnerability:** Found `dangerouslySetInnerHTML` used in `components/builder/exam-block.tsx` and `components/exams/static-block.tsx` passing un-sanitized user input (`stem`). This would allow an attacker (or compromised teacher account) to inject malicious scripts into exams that could execute when viewed by others (or even self-XSS).
**Learning:** React's `dangerouslySetInnerHTML` is named that way for a reason. Always sanitize content before passing it there, especially if it originates from user input or rich text editors.
**Prevention:** Installed `isomorphic-dompurify` and wrapped the input in `DOMPurify.sanitize()` before rendering. This strips out scripts while preserving safe HTML formatting.

## 2025-05-18 - Exposed Secrets in .env.example
**Vulnerability:** The `.env.example` file contained hardcoded secrets (Service Role Key, Encryption Key, VAPID Private Key). This file is committed to the repository, meaning these secrets were exposed to anyone with read access.
**Learning:** Never put real secrets, even "development" ones that might be reused, into committed example files. Developers might accidentally use them in production or they might be valid keys for shared development environments.
**Prevention:** Replaced all secrets in `.env.example` with obvious placeholders (e.g., `your-service-role-key`, `sk_test_...`). Added checks to ensure no secrets are committed in the future.
