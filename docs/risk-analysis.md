# Critical Analysis of Risks

Context: Next.js App Router with Drizzle ORM, pages for home, `/stis`, maps, and chat; seed/migrations under `db/`; Tailwind for UI; manual testing via `pnpm dev`.

Mission: Provide trustworthy STI information, maps, and community interaction; balance engagement with privacy, safety, and data integrity.

Constraint: No automated tests; early-stage visibility and community traction likely constrained.

## Insufficient Community Engagement

- Issue: Static content and one‑way interaction limit contributions and feedback loops beyond casual browsing.
- Why it matters: Without a participatory core, chat and map features underperform and content stales; growth stalls from lack of network effects.
- Early signals: Low repeat sessions, shallow time‑on‑page on `/stis`, minimal chat activity, few UGC submissions (if any).
- Mitigations: Add lightweight contribution flows, recognition systems, gentle prompts, and periodic community challenges; keep contribution UX 1–2 clicks.

## Weak Marketing and Limited Outreach

- Issue: Minimal presence across social and local partners inhibits reach to target audiences (youth, students, community orgs).
- Why it matters: Without top‑of‑funnel acquisition, even great UX won’t compound; maps and chat rely on critical mass.
- Early signals: Flat traffic outside dev bursts, absence of referral/organic channels, no partner traffic or backlinks.
- Mitigations: Launch focused editorial calendar, partner toolkits, and creator collabs; track source in analytics; run small on‑campus and clinic pilots.

## Lack of Sustained User Motivation

- Issue: Few mechanisms for retention (personalization, progress, saved items, reminders); chat lacks scaffolds for safe, helpful exchanges.
- Why it matters: Visits don’t convert to habits; health learning requires spaced repetition and supportive communities.
- Early signals: Low D7/D30 retention, minimal favorites/saves, high chat bounce rate, no return via notifications or email.
- Mitigations: Add saves and history, tailored recommendations, gentle streaks/badges, prompts to revisit topics; make chat sticky with “follow topic” and summaries.

## Data Accuracy and Upkeep

- Issue: Manual curation doesn’t scale; STI facts, clinic locations, hours, and services drift without pipelines and review cycles.
- Why it matters: In health contexts, stale or wrong info erodes trust and carries real‑world harm.
- Early signals: User reports of incorrect clinic hours, broken links, inconsistent terminology across `/stis` pages.
- Mitigations: Blend official source syncs, crowdsourced flags with expert moderation, scheduled audits; add provenance fields and review states in `db/`.

## Privacy, Safety, and Compliance

- Issue: STI topics are sensitive; chat and any stored interactions risk exposing PII; ambiguous scope may drift toward health advice.
- Why it matters: Legal/regulatory exposure and user harm from confidentiality breaches; reputational damage is hard to recover.
- Early signals: Users sharing phone numbers or medical histories in chat; requests for diagnosis; logs containing identifiers.
- Mitigations: Privacy by default, content disclaimers, automated PII redaction, guardrails for advice; strict `DATABASE_URL` handling in `.env.local`; data minimization and clear retention.

## Content Quality and Moderation (Chat and UGC)

- Issue: Misinformation, harassment, or stigmatizing language in chat can spread quickly without moderation tools.
- Why it matters: Safety and trust degrade; vulnerable users churn first.
- Early signals: Reports on chat, blocked words appearing, high delete rates, or mod backlog.
- Mitigations: Add report/flag flows, tiered moderation (auto + human), stigma‑aware language filters, conversation prompts steering to vetted resources.

## Technical Reliability and Scalability

- Issue: Map tiles, search, and chat can degrade under load; lack of tests increases regressions; migrations can drift.
- Why it matters: Outages or slow maps break core value; silent data issues compound.
- Early signals: Slow TTFB/LCP on map pages, API 5xx spikes, long `pnpm build`, flaky local runs.
- Mitigations: Cache map data, defer heavy components, add simple e2e smoke paths; performance budgets; monitor tile provider limits and add fallbacks.

## Database and Migration Risk

- Issue: Schema drift, unsafe migrations, or poor seeding can corrupt data; `drizzle.config.ts` mispaths lead to missing or partial migrations.
- Why it matters: Integrity issues undermine trust and complicate rollback; data loss becomes operational crisis.
- Early signals: Divergent local vs prod schemas, failed `pnpm db:migrate`, manual hotfixes, inconsistent foreign keys.
- Mitigations: Enforce migration discipline (`pnpm db:generate` → review → `db:migrate`), seed with non‑PII fixtures in `db/data/`, add constraints and indexes for critical relations.

## Security Posture

- Issue: Potential XSS in rich text, injection via chat inputs, exposed environment vars, missing rate limits and CSRF protections.
- Why it matters: Exploits risk user data and platform integrity; public health context raises stakes.
- Early signals: Dependency alerts, lint warnings ignored, errors around unescaped HTML, elevated 429/401 logs without mitigation.
- Mitigations: Strict output encoding, input validation, CSP and headers, rate limiting on chat/APIs, secret hygiene, periodic dependency updates.

## Operational Gaps

- Issue: No automated tests; unclear on-call/monitoring; deployment and rollback paths unspecified.
- Why it matters: Incidents linger, regressions slip; team load increases as complexity grows.
- Early signals: Manual QA only, lack of logs/metrics, inconsistent release notes.
- Mitigations: Add minimal smoke tests for `/`, `/stis`, maps, chat; structured logging; a simple release checklist and rollback script.

## Summary and Path Forward

- Prioritize community and retention: Add saves, recommendations, and recognition to convert visitors into contributors.
- Build data trust: Introduce provenance, expert review states, and scheduled audits; integrate official sources where possible.
- Safeguard users: Implement privacy guardrails, moderation workflows, and clear disclaimers around non‑diagnostic content.
- Harden the stack: Add basic e2e smoke checks, caching, rate limits, and safe migrations with `db/migrations`.
- Grow visibility intentionally: Run small partner pilots and measured social campaigns; track acquisition and retention with analytics.

If helpful, we can draft a lightweight risk register (owner, likelihood, impact, early signals, mitigations) and a 4‑week mitigation plan mapped to `pnpm` tasks and repo paths (`app/`, `db/`, `lib/`).

