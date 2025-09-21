# Potential Risks and Strategy

## Potential Risks

- **Sensitive health context**: Anonymous chat, AI tone assistant, and location sharing expose the risk of collecting or revealing personally identifiable health information.
- **Information accuracy drift**: STI explainers, clinic directories, and safety checklists can go stale without structured reviews.
- **AI misuse or hallucination**: `/api/tone-tune` could generate unsafe guidance or leak prompt context if unguarded.
- **Abuse and stigma in community features**: Chat and feedback flows may be used for harassment, misinformation, or spam.
- **Operational resilience**: Limited automation and observability increase the chance of regressions or downtime during releases.

## Strategy

### 1. Protect Sensitive Context and Privacy

- Minimize data collection: keep chat anonymous by default, store only coarse location when users opt in, and expire tone‑tuning prompts once responses are generated.
- Apply redaction before persistence: strip phone numbers, emails, and explicit identifiers from chat transcripts and analytics logs.
- Enforce secure storage: require `DATABASE_URL` secrets in environment variables, enable TLS, and restrict access to production replicas.
- Publish clear user‑facing disclaimers about educational scope, data retention limits, and opt‑out controls.

### 2. Maintain Accurate STI and Clinic Data

- Establish review cadences: assign monthly domain experts to audit `/stis` content, legal notes, and regional resources.
- Track provenance in Drizzle: add fields for source URL, verification date, and reviewer; surface stale records in moderation dashboards.
- Activate feedback loops: provide “Report an issue” controls on maps and resource lists, routing submissions to moderators.
- Partner with trusted sources: schedule pull jobs from Ministry of Health or NGO datasets, and verify changes before publishing.

### 3. Guard AI Interactions

- Constrain prompts/responses: filter incoming tone‑tuning requests for disallowed topics, PII, or self‑harm content; truncate output length and profanity.
- Add system guardrails: include medical disclaimers at the top of AI responses and route high‑risk prompts to a human review queue.
- Monitor `/api/tone-tune`: log usage metrics (without message bodies) and alert on unusual spikes to detect abuse or scripted probing.
- Provide a reset path: allow users to revert AI output to vetted templates instantly.

### 4. Moderate Community Surfaces

- Implement layered moderation: combine keyword filtering, rate limiting, and human review for chat messages and resource submissions.
- Offer in‑product reporting: enable quick “Report” controls with stigmatizing language categories so moderators can triage quickly.
- Publish community guidelines emphasizing respect, consent, and stigma‑aware language; require acceptance before chat use.
- Rotate moderators: ensure coverage during campaigns or new feature launches to handle increased volume.

### 5. Improve Operational Readiness

- Automate smoke checks: add basic end‑to‑end tests for `/`, `/stis`, map rendering, and chat send/receive before deploys.
- Instrument key paths: capture logs/metrics for tone tuning latency, map tile errors, and chat queue health in Vercel/observability tooling.
- Define release runbooks: document rollback steps for database migrations and Next.js deployments; practice at least quarterly.
- Review dependencies weekly: update vulnerable packages, especially chat/markdown sanitizers, Drizzle, and Next.js security patches.
