## 2024-05-23 - Stored XSS in Exam Blocks
**Vulnerability:** Found `dangerouslySetInnerHTML` used in `components/builder/exam-block.tsx` and `components/exams/static-block.tsx` passing un-sanitized user input (`stem`). This would allow an attacker (or compromised teacher account) to inject malicious scripts into exams that could execute when viewed by others (or even self-XSS).
**Learning:** React's `dangerouslySetInnerHTML` is named that way for a reason. Always sanitize content before passing it there, especially if it originates from user input or rich text editors.
**Prevention:** Installed `isomorphic-dompurify` and wrapped the input in `DOMPurify.sanitize()` before rendering. This strips out scripts while preserving safe HTML formatting.

## 2025-05-23 - Added Security Headers
**Vulnerability:** Missing HTTP security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
**Impact:** Application vulnerable to clickjacking, MIME sniffing, and downgrade attacks.
**Fix:** Configured `next.config.mjs` to inject these headers on all routes.
