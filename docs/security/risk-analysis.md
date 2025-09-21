# Critical Analysis of Risks

Context: Safhira is a Next.js (App Router) platform with Drizzle ORM, Tailwind UI, and rich content around STI education. Key flows include educational pages (e.g., `/stis`), interactive geographic resources, anonymous chat, and AI-assisted tone tuning via `/api/tone-tune`. Data origins mix moderated content, user submissions, and optional third-party datasets.

Mission: Deliver trustworthy, stigma-aware guidance while protecting sensitive conversations and location insights. The product must balance reach, privacy, and operational reliability as features evolve.

Constraints: No automated test suite, early-stage moderation capacity, restricted engineering bandwidth, and evolving dataset pipelines.

## 1. Privacy & Confidentiality

- **Issue**: Chat transcripts, AI prompts, and optional location sharing can surface health-related or identifying data. Without strict minimization, logs or analytics may retain sensitive details.
- **Why it matters**: Breaches erode trust and may trigger regulatory exposure (PDPA/GDPR analogues). Users expect anonymity when discussing STI topics.
- **Signals**: Support tickets about unwanted retention, requests to delete messages, appearance of phone numbers or addresses in logs, or pushback from community partners.
- **Mitigations**: Redact PII at ingress, expire raw chat/AI payloads, log only metadata, and publish retention/disclaimer messaging. Require secure storage (`DATABASE_URL` via env vars, TLS). Build self-service deletion requests into the roadmap.

## 2. Data Accuracy & Integrity

- **Issue**: STI fact sheets, legal notes, and clinic directories drift over time. Manual updates lack version tracking, raising the odds of outdated or conflicting advice.
- **Why it matters**: Incorrect care guidance can cause real-world harm or legal risk; credibility plummets when high-impact details (clinic hours, safer sex advice) are wrong.
- **Signals**: User reports of incorrect info, broken resource links, clinic partners flagging mismatches, or inconsistent copy between locales.
- **Mitigations**: Enforce review cadences, store provenance and last-verified timestamps in Drizzle models, add “Report an issue” affordances, and sync with official datasets where possible. Highlight stale entries in internal dashboards.

## 3. AI Tone Tuning Risk

- **Issue**: `/api/tone-tune` can hallucinate medical advice, leak system prompts, or be exploited for prompt-injection attacks that expose internals.
- **Why it matters**: Harmful or misleading AI output increases liability and undermines the safe-disclosure mission. Prompt abuse could disclose secrets or manipulate downstream systems.
- **Signals**: Users quoting unsafe AI guidance, sudden spikes in API usage, atypical prompt patterns, or bug reports showing leaked template content.
- **Mitigations**: Filter prompts for disallowed topics/PII, cap response length, attach disclaimers, log abuse metrics without bodies, and add a human review fallback. Version prompts in Git and review changes with security.

## 4. Community Moderation & Abuse

- **Issue**: Anonymous chat and resource submissions invite harassment, misinformation, or stigma-laden language. Manual moderation alone may not scale.
- **Why it matters**: Unsafe spaces deter the most vulnerable users, damage institutional partnerships, and can trigger platform bans or PR backlash.
- **Signals**: Growth in reported messages, repeat offenders, moderator overload, or unaddressed flags staying in queues too long.
- **Mitigations**: Layer keyword filters, rate limits, and human review; offer in-product reporting; publish clear community guidelines; log moderation actions for auditability; rotate moderators during campaigns.

## 5. Platform Reliability & Observability

- **Issue**: Limited automated testing and monitoring raise regression risk across maps, chat, and localization. Deployments may fail silently.
- **Why it matters**: Downtime or slow responses on map/chat pages interrupt critical support moments. Regressions erode trust with partners.
- **Signals**: Increased 5xx responses, slow map tiles, chat send failures, or deployment rollbacks without root cause.
- **Mitigations**: Add smoke tests before deploy (`/`, `/stis`, map render, chat send/receive), instrument API latency/error metrics, and document rollback procedures for Vercel + database migrations.

## 6. Database & Schema Governance

- **Issue**: Schema drift or unsafe migrations via Drizzle can corrupt content. Seed data may diverge from production if not curated.
- **Why it matters**: Content integrity depends on accurate references between STI topics, regions, and resources; a migration misstep can break entire flows.
- **Signals**: Failed `pnpm db:migrate`, conflicting migrations in PRs, or inconsistent staging/production schemas.
- **Mitigations**: Require reviews on migrations, run `pnpm db:generate` + `db:push` in CI, back up before releases, and keep fixtures in `db/data/` free of sensitive info.

## 7. Web Application Security

- **Issue**: Potential XSS through chat, injection via map query params, and missing rate limits/headers. Dependency drift increases vulnerability surface.
- **Why it matters**: Exploits put user data at risk and can deface educational content, eroding credibility.
- **Signals**: Lint warnings ignored, security header scanners failing, dependency alerts, or suspicious activity in server logs.
- **Mitigations**: Enforce CSP, sanitize/escape UGC, validate all API inputs, implement rate limiting, and patch dependencies promptly. Use secret scanning and restrict CORS.

## Summary & Next Steps

- Ship privacy safeguards first: data minimization, retention policies, user disclosures, and redaction pipelines.
- Stand up accuracy workflows: provenance tracking, scheduled reviews, and “report issue” affordances for maps/resources.
- Harden AI and community features: prompt filtering, disclaimers, moderation tooling, and rate limiting.
- Invest in reliability: smoke tests, observability, and documented release/rollback steps.
- Institutionalize database governance: reviewed migrations, backups, and safe seeding practices.

Addressing these domains keeps Safhira trustworthy for people seeking sensitive STI guidance while preparing the platform for broader adoption.
