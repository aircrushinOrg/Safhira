# Security Plan

## Project System Overview

Safhira is a digital platform for STI education and support. It provides clear information pages (e.g., `/stis`), interactive maps/visualizations, and an anonymous chat/community experience designed to foster safe, stigma‑aware engagement.

Based on the current stack and repository structure, the architecture consists of:

- Client‑side: Next.js App Router (React) providing the user interface.
- Server‑side: Next.js (Node.js) server components and API routes handling business logic, chat endpoints, and data access.
- Database: PostgreSQL with Drizzle ORM for schema, migrations, and queries.
- AI tone-tuning service: `/api/tone-tune` orchestrates tone adjustments via an external LLM provider.
- Third-party APIs: Geographic/topology data (TopoJSON/OpenStreetMap sources), optional analytics, and partnered health/clinic datasets.
- Hosting: Vercel for deployment, edge/network, and environment variable management.

## System Security Overview

Each component requires specific security considerations:

### Client‑side (Next.js/React)

- Maintain a strict Content Security Policy (CSP) and sanitize all user inputs to prevent XSS; escape all untrusted content before rendering.
- Enforce safe navigation and framing: `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`; enable HSTS.
- Validate any client-side processed media (if introduced later): file type, size, resolution; use safe preview mechanisms to avoid embedded XSS.
- Use modern cookie attributes for any session tokens: `Secure`, `HttpOnly`, `SameSite=Lax` (or `Strict` where possible).
- Limit third-party scripts; prefer SRI and trusted origins only.
- Provide inline privacy messaging when users opt into location sharing; ensure UI clearly indicates what is stored and for how long.
- Keep dependencies updated; address high/critical advisories promptly.

### Server‑side (Next.js API routes / Node.js)

- Validate and sanitize all inputs at the API boundary (zod/valibot or similar), including chat messages and map/query parameters.
- Enforce rate limiting and abuse detection on chat and high-traffic endpoints; add captcha or proof-of-work for suspicious traffic.
- Apply output encoding for any user-generated content (UGC); block HTML where not required.
- Implement CSRF protections for state-changing endpoints; prefer SameSite cookies and CSRF tokens when needed.
- Use structured logging (no PII) and centralized error handling; avoid leaking stack traces to clients.
- Filter and truncate prompts/responses for `/api/tone-tune`; attach safe-system prompts, disclaimers, and profanity/medical-claim filters before returning output.
- Isolate file handling (if added later) outside web root; randomize names; verify MIME/extension; scan content server-side.
- Guard against SSRF by validating outbound URLs if any proxying is introduced.

### Database (PostgreSQL + Drizzle ORM)

- Use parameterized queries through Drizzle; avoid dynamic SQL; validate inputs before persistence.
- Enforce least-privilege DB roles; separate migration user from runtime user; rotate credentials.
- Encrypt at rest (via managed Postgres provider) and ensure TLS in transit (`sslmode=require`).
- Hash any credentials with Argon2/bcrypt if authentication is introduced; never store plaintext secrets.
- Add constraints and indexes for integrity; use migrations under `db/migrations/` with review before `db:migrate`/`db:push`.
- Store provenance metadata (source URL, reviewer, last-verified timestamp) for STI content and clinic resources to support audits.
- Implement data retention policies for chat logs and analytics; purge or anonymize routinely.

### Third‑party APIs and Services

- Keep API keys and secrets server-side only (Vercel env vars); never expose secrets in client bundles.
- Sanitize and validate all responses from third parties before rendering; treat external content as untrusted.
- Apply quotas/rate limits and monitor usage to detect abuse or key leakage.
- For the tone-tuning LLM, enforce content filters, include disclaimers, and review vendor SOC2/ISO controls; rotate keys and monitor token usage.

### Hosting (Vercel)

- Manage secrets via Vercel environment variables and encrypted project settings; avoid committing secrets.
- Restrict preview deployments’ access to production data; use separate databases/credentials per environment.
- Configure security headers at the framework level (CSP, HSTS, `Referrer‑Policy`, `X‑Content‑Type‑Options`, `Permissions‑Policy`).
- Backups and restore: ensure the Postgres provider has automated backups and a tested restore path.

## Security Awareness

### Authentication and Authorization

- Require authentication for moderator/admin tools; enforce role-based access control (RBAC) for content review and configuration.
- Apply multi-factor authentication for admin accounts (SSO/MFA via provider where possible).
- Use secure session handling (short-lived tokens; refresh rotation); implement lockout/backoff for repeated failed logins.
- Keep end-user chat participation anonymous by default; avoid collecting identifying data unless strictly necessary and consented.
- Provide moderator dashboards with limited, redacted views of chat logs; log access for audit.

### Data Protection

- Enforce TLS for all traffic; prefer HTTPS only with HSTS.
- Practice data minimization: do not store sensitive PII or exact location unless opted-in and needed for a feature.
- Strip metadata (e.g., EXIF) from any images/files if uploads are introduced; inform users and require consent where applicable.
- Provide user controls to delete or anonymize submissions; define clear retention limits for chat and analytics data.
- Define and document retention periods for AI prompts/responses and ensure automatic deletion after tuning completes.

### API Security

- Store all third-party credentials securely; rotate regularly and scope permissions narrowly.
- Validate parameters to/from external services; enforce schemas and reject unexpected fields.
- Rate limit public endpoints and implement per-IP/requester quotas; add WAF rules for abusive patterns.
- Log API activity (without PII) and alert on spikes, error anomalies, or unusual geographies.
- Monitor AI provider latency/errors and fallback gracefully to curated templates when unavailable.

### Network Security

- Use a Web Application Firewall (WAF) and CDN protections for DDoS and L7 threats.
- Maintain strict CORS: allow only trusted origins and required methods/headers.
- Run dependency and container (if applicable) vulnerability scans regularly; patch promptly.
- Pin minimal network egress; deny unknown outbound calls from server functions where possible.
- Segment LLM egress endpoints and restrict environment variables so only the tone-tuning function can reach the provider.

## Ethical, Legal, Security and Privacy Issues

### Data Privacy Compliance

- Clearly communicate how chat messages and interactions are used, stored, and retained; present a concise privacy summary in-product.
- Obtain consent for any public display of contributions; default to anonymized display.
- Support data subject requests (export/delete) and respect regional regulations (e.g., GDPR/PDPA equivalents) where applicable.
- Do not repurpose user data (e.g., for training) without explicit consent.
- Explicitly cover AI assistance in the privacy notice, including provider name, data handling, and opt-out choices.

### Ethical Considerations

- Include prominent disclaimers that content is educational and not medical advice; guide users to licensed providers for diagnosis/treatment.
- Moderate UGC for misinformation, harassment, or stigma; apply stigma-aware language policies and escalation paths.
- Ensure accessibility (WCAG) for critical flows, including information pages and chat.
- Evaluate AI outputs for bias and stigmatizing language; maintain a feedback loop so moderators can flag problematic generations.

### Legal Compliance

- Keep Terms of Use and Privacy Policy current with chat/UGC and any AI processing.
- Verify licenses and attribution for geographic/topology data and any external datasets.
- Review age-appropriate access and content safeguards; restrict features if required by local law.
- Document cross-border data flows if AI providers host outside the primary jurisdiction and ensure contractual safeguards.

## Risk Analysis

| Risk | Description | Likelihood (1‑5) | Impact (1‑5) | Score | Mitigation |
|---|---|---:|---:|---:|---|
| Cross-Site Scripting (Chat/UGC) | Unescaped user content injects scripts | 3 | 4 | 12 | Strict CSP, output encoding, input sanitization, block HTML |
| PII Leakage in Chat/AI Logs | Sensitive info inadvertently stored or exposed | 3 | 5 | 15 | PII redaction, short retention windows, encryption at rest |
| Prompt Injection/LLM Abuse | Model coerced to disclose or perform unsafe actions | 3 | 4 | 12 | Input/output filters, system prompt hardening, rate limits, monitoring |
| Location Privacy Exposure | Shared region/location data linked to users | 2 | 4 | 8 | Coarse-grained storage, explicit consent, easy opt-outs |
| SQL Injection/ORM Misuse | Unsafe dynamic queries bypass protections | 2 | 5 | 10 | Parameterized queries via Drizzle, schema validation, code review |
| Data Breach via API Endpoints | Exploit in API or auth flows | 2 | 5 | 10 | WAF rules, rigorous validation, least privilege, security headers |
| DoS/Abuse of Chat/API | Excessive requests degrade service | 3 | 4 | 12 | Rate limiting, IP reputation, adaptive throttling, caching |
| Secrets Exposure | Keys leaked in client or repo | 2 | 5 | 10 | Server-side env vars, secret scanning, rotation, no client embeds |

## Risk Mitigation Strategies

### Technical Controls

- Follow OWASP ASVS/Top‑10 practices for input validation, output encoding, authentication, and session management.
- Enforce strict CSP, security headers, and rate limits across public endpoints.
- Use schema validation at API boundaries; reject unknown fields (fail‑closed).
- Apply automated dependency scanning and weekly updates for high/critical issues.
- Implement privacy‑first logging, redact PII, and set retention/rotation.
- Add e2e smoke checks for `/`, `/stis`, map pages, and chat to detect regressions.

### Administrative Controls

- Maintain a security policy, incident response runbook, and on‑call escalation path; test with tabletop exercises.
- Require code review for migrations and security‑sensitive changes; adopt a release checklist.
- Provide moderator training and clear guidelines for handling sensitive content and user reports.
- Conduct periodic configuration and access reviews (Vercel, database, analytics, third‑party services).

This security overview provides a framework for protecting Safhira’s users and data, supporting confidentiality, integrity, and availability while maintaining trust and compliance as the platform evolves.
