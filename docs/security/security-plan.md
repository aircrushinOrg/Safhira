# Security Plan

## Project System Overview

Safhira is a Next.js (App Router) platform that delivers STI education, practice simulations, and resource discovery. Core user journeys span:

- Landing, prevalence, and stigma-breaking content on `/`.
- Detailed STI explainers and related resources under `/stis` with data served by Drizzle-backed server actions.
- Provider discovery experiences powered by server actions in `app/actions/provider-actions.ts`, `/api/geocode`, and `/api/calculate-distances` for location lookup and routing.
- An AI-assisted learning toolkit at `/tools` that orchestrates simulation sessions through `/api/ai-scenarios/session`, `/api/ai-scenarios/session/[sessionId]/turns`, and `/api/ai-scenarios/session/[sessionId]/final-report`.
- A tone rewrite service exposed via `/api/tone-tune`.
- A Dify-embedded chat experience on `/chat` for stigma-aware Q&A.
- Gamified quizzes and leaderboard flows (`/quiz`, `/api/leaderboard`, `/api/leaderboard/submit`, `app/actions/leaderboard-actions.ts`).
- The Living Well newsletter funnel at `/living-well-with-sti`, handled by `app/living-well-with-sti/actions.ts` with outbound mail delivered through Resend.

Supporting components include PostgreSQL (Drizzle ORM) for persistence, external APIs (OpenAI, Dify, Google Maps Distance Matrix, OpenStreetMap Nominatim, Resend), and Vercel-managed hosting and environment configuration.

## System Security Overview

### Client & UI Surfaces

- Enforce a strict Content Security Policy tuned for Next.js, Dify iframe embeds, and map tiles; block unexpected script origins.
- Sanitize and escape user-generated text rendered from AI responses, chat summaries, leaderboards, and feedback modules.
- Present clear consent and safety notices before loading the Dify iframe and before collecting location coordinates.
- Apply modern cookie attributes (`Secure`, `HttpOnly`, `SameSite`) to any future session tokens; prefer stateless storage for anonymous features.
- Use feature flags to disable `/tools` in production or restrict to privileged operators.
- Provide fallbacks when third-party services (Dify, OpenAI, Google) are unavailable to avoid leaking error information to end users.

### Server APIs & Actions

- Validate payloads for `/api/ai-scenarios/*`, `/api/tone-tune`, `/api/geocode`, `/api/calculate-distances`, `/api/leaderboard*`, and server actions (`sti-actions`, `provider-actions`, `leaderboard-actions`, `newsletter`); reject oversized or malformed bodies.
- Redact or hash sensitive fields (emails, coordinates, AI transcripts) before logging; log metadata only.
- Apply per-IP and per-session rate limits to AI simulations, tone tuning, leaderboard submissions, and geocode/distance lookups; trigger captcha or challenge flows when thresholds trip.
- Bound outbound requests to approved origins (OpenAI, Dify, Google APIs, Nominatim, Resend) to prevent SSRF.
- Attach safety disclaimers and topic filters to AI-generated output; enforce vocabulary checks for self-harm, medical directives, or PII prior to persist/return.
- Implement replay/duplication guards on `/api/leaderboard/submit` to mitigate score inflation.

### Database (PostgreSQL + Drizzle)

- Use least-privilege roles: a migration user for `db/migrations/` and a runtime user with limited grants.
- Enforce TLS (`sslmode=require`) and provider-level encryption at rest.
- Store provenance metadata, verification timestamps, and reviewer IDs for STI and provider records to support audits.
- Apply retention policies: purge or anonymize `aiScenarioTurns`/`aiScenarioResponses` after defined windows, restrict newsletter data storage to hashed identifiers, and avoid storing precise user coordinates.
- Run migrations through code review; require `pnpm db:generate`/`db:push` verification before release.

### External Services & Integrations

- Keep OpenAI, Dify, Google Maps, Nominatim, and Resend credentials in Vercel environment variables; rotate regularly and scope usage per environment.
- Monitor API usage (latency, token spend, quota) and alert on anomalies that suggest key leakage or abuse.
- Negotiate and document retention SLAs with Dify for embedded chat transcripts; backstop with feature toggles if vendor terms change.
- Cache and validate all third-party responses before rendering; treat them as untrusted input.

### Hosting & Deployment (Vercel)

- Separate environments (preview, staging, production) with distinct credentials and databases; gate production deployments behind approval.
- Configure global security headers (`CSP`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- Maintain restoration drills for the managed Postgres instance; document RTO/RPO expectations.
- Enable Vercel audit logging and SSO/MFA for all project members.

## Security Awareness

### Authentication & Authorization

- Require authentication with role-based access control for moderation consoles, `/tools`, and any internal dashboards.
- Enforce MFA/SSO for administrators; rotate access regularly and remove unused accounts.
- Keep end-user chat and quiz participation anonymous unless users explicitly opt in to identification (e.g., newsletter signup).
- Log moderator access to transcripts, provider records, and leaderboard reports for auditability.

### Data Protection

- Mandate HTTPS everywhere with HSTS and redirect HTTP to HTTPS.
- Practice minimization: round incoming coordinates, avoid storing raw AI prompts beyond operational need, and hash newsletter emails.
- Provide user-facing controls (or service desk processes) for deleting AI sessions, leaderboard entries, and newsletter subscriptions.
- Document data flow diagrams for AI requests to clarify which vendors receive which payloads.

### API Security

- Use schema validation libraries (zod/valibot) to enforce strict contracts on JSON bodies, search params, and server action inputs.
- Rate limit and throttle high-cost endpoints (`/api/ai-scenarios/*`, `/api/tone-tune`, `/api/geocode`, `/api/calculate-distances`); include abuse alerts.
- Instrument centralized logging with unique request IDs; redact PII prior to persistence.
- Provide fallback responses when upstream vendors fail, including user-safe messaging and incident paging.

### Network Security

- Apply WAF/CDN protections for DDoS and L7 anomalies; block abusive IP ranges discovered through monitoring.
- Restrict CORS to first-party domains and limit allowed methods/headers.
- Limit outbound network egress from server functions to approved IP ranges/domains.
- Run routine vulnerability scans on dependencies and infrastructure; remediate critical findings promptly.

## Ethical, Legal, Security & Privacy Issues

### Data Privacy Compliance

- Publish transparent notices describing how AI simulations, chat transcripts, location lookups, leaderboard submissions, and newsletters are collected and retained.
- Honour access/delete requests promptly; maintain documented procedures for PDPA/GDPR-style obligations.
- Limit cross-border transfers by selecting regional data centres where feasible and documenting vendor jurisdictions.
- Provide opt-out mechanisms for analytics, AI usage, and location sharing; default to least data necessary.

### Ethical Considerations

- Keep prominent disclaimers that all AI output and chat responses are educational, not medical advice; provide links to licensed providers.
- Continuously review AI outputs for bias or stigmatizing language; empower moderators to flag and retrain prompt templates.
- Ensure accessibility compliance (WCAG) across `/`, `/stis`, `/quiz`, and `/chat` experiences, including AI transcripts.
- Offer clear reporting paths for harassment or misinformation encountered in chat or community surfaces.

### Legal Compliance

- Refresh Terms of Use and Privacy Policy when new data flows (AI coaching, location services, newsletters) launch.
- Verify licensing/attribution requirements for map tiles, TopoJSON, and third-party datasets.
- Evaluate age gating or parental consent needs when targeting minors; disable higher-risk features if regulations demand.
- Maintain contracts or DPAs with AI/chat vendors specifying retention, breach notification, and subprocessor transparency.

## Risk Analysis

| Risk | Description | Likelihood (1-5) | Impact (1-5) | Score | Mitigation |
|---|---|---:|---:|---:|---|
| AI Transcript Exposure | Sensitive data persisted in `aiScenarioTurns`/`aiScenarioResponses` or leaked via `/api/ai-scenarios/*` | 3 | 5 | 15 | PII redaction, retention limits, access controls, consent tooling |
| Dify Embed Compromise | Third-party iframe harvests or mishandles chat data | 3 | 4 | 12 | Explicit consent, feature flagging, vendor SLAs, network isolation |
| Location Privacy Leakage | Precise coordinates logged via `/api/geocode` or `/api/calculate-distances` | 2 | 4 | 8 | Coordinate rounding, log scrubbing, rate limits, opt-outs |
| Prompt Injection & LLM Abuse | Malicious prompts in `/api/ai-scenarios/*` or `/api/tone-tune` cause unsafe output | 3 | 4 | 12 | Input filtering, system prompt hardening, monitoring, human review |
| Leaderboard & Quiz Abuse | `/api/leaderboard/submit` spam inflates scores or injects offensive nicknames | 3 | 3 | 9 | Rate limiting, profanity filters, anti-replay tokens, moderation |
| Newsletter Consent Drift | Emails handled by Resend without proper opt-in/out tracking | 2 | 4 | 8 | Double opt-in, hashed storage, unsubscribe logging, vendor review |
| API Exhaustion / DoS | High traffic overwhelms AI/location endpoints | 3 | 4 | 12 | Throttling, caching, circuit breakers, autoscaling |
| Secrets Exposure | Leakage of OpenAI/Google/Resend keys via repo or client bundle | 2 | 5 | 10 | Server-side env vars, secret scanning, rotation, review gates |

## Risk Mitigation Strategies

### Technical Controls

- Enforce CSP, security headers, and strict escaping for all dynamic output.
- Implement schema validation plus rate limiting at every public endpoint and server action.
- Automate dependency scanning and patching; review security advisories weekly.
- Instrument structured logging and tracing for `/api/ai-scenarios/*`, `/api/tone-tune`, `/api/geocode`, `/api/calculate-distances`, and `/api/leaderboard*` with alert thresholds.
- Deploy smoke tests that exercise `/`, `/stis`, provider search, `/quiz`, `/chat`, and `/tools` before production releases.
- Maintain automated backups and perform periodic restore drills for PostgreSQL.

### Administrative Controls

- Keep an incident response playbook covering AI hallucinations, location/privacy breaches, and vendor outages; rehearse via tabletop exercises.
- Require security review for migrations, AI prompt changes, and third-party integrations before launch.
- Train moderators and support staff on handling sensitive disclosures, escalation paths, and privacy commitments.
- Conduct quarterly access reviews across Vercel, database roles, AI provider dashboards, Dify, Google Cloud Console, and Resend.
- Track completion of privacy impact assessments when launching new data-collecting features.

This plan aligns security, privacy, and resilience efforts with Safhira’s current feature set, ensuring users receive sensitive STI guidance in a trustworthy, well-governed environment.
