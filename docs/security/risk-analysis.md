# Critical Analysis of Risks

Context: Safhira is a Next.js (App Router) application backed by Drizzle ORM and Tailwind UI. Primary surfaces include the landing page (`/`), detailed STI explainers (`/stis`), provider discovery tools, a Dify-embedded chat experience (`/chat`), gamified quizzes (`/quiz`), the Living Well newsletter funnel (`/living-well-with-sti`), and AI coaching tooling in `/tools` that connects to `/api/ai-scenarios/*` and `/api/tone-tune`. Data originates from curated content, Drizzle-managed imports, user submissions, and third-party APIs (OpenAI, Google Maps, OpenStreetMap, Resend).

Mission: Deliver stigma-aware guidance and practice simulations while respecting user anonymity, medical sensitivity, and regional context.

Constraints: No automated end-to-end suite, limited moderation staffing, dependence on external APIs, and evolving data-refresh tooling.

## 1. Sensitive Conversation Privacy

- **Issue**: AI simulations (`/api/ai-scenarios/session`, `/api/ai-scenarios/session/[sessionId]/turns`, `/api/ai-scenarios/session/[sessionId]/final-report`), tone rewrites (`/api/tone-tune`), and the Dify iframe in `app/chat/page.tsx` all accept free-form narratives that can include health details, relationship histories, or personal identifiers. Conversation histories persist in `aiScenarioTurns` and `aiScenarioResponses`, and third-party embeddings may retain data outside our control.
- **Why it matters**: Any leak of STI-related conversations harms users, invites regulatory scrutiny (PDPA/GDPR analogues), and erodes trust in Safhira’s promise of anonymity.
- **Signals**: Support tickets about transcript deletion, discovery of PII in logs or replicas, Dify retention questions, or spikes in `aiScenarioResponses.rawResponse` size.
- **Mitigations**: Redact PII at ingress, shorten retention windows for `aiScenario*` tables, limit logging to metadata, and gate `/tools` behind authentication or flags. Provide explicit consent copy before loading the `/chat` iframe and codify deletion SLAs with third-party vendors.

## 2. Location & Provider Data Exposure

- **Issue**: Provider search server actions (`app/actions/provider-actions.ts`), `/api/geocode`, and `/api/calculate-distances` collect user coordinates, query external APIs, and return enriched provider details. Storing or logging raw lat/long alongside STI context can deanonymize users, while exposed API keys risk quota abuse.
- **Why it matters**: Mismanaged location data jeopardizes user safety and may violate local privacy requirements. Compromised Google Maps/OpenStreetMap usage could incur costs or service bans.
- **Signals**: Repeated geocode requests from single IPs, large response payloads including unchanged coordinates, or reports of users receiving unsolicited contact after sharing location.
- **Mitigations**: Round coordinates before persistence, strip sensitive fields from logs, enforce request limits by IP/session, keep `GOOGLE_MAPS_API_KEY` and Nominatim headers server-side, and cache provider responses to reduce external calls.

## 3. Data Accuracy & Integrity

- **Issue**: STI narratives in `app/stis` (powered by `app/actions/sti-actions.ts`), prevalence copy, and provider directory records can drift if not re-verified. Manual edits risk losing provenance and version history.
- **Why it matters**: Outdated treatment guidance or incorrect clinic availability causes real-world harm and degrades credibility with health partners.
- **Signals**: User reports via “contact us” channels, mismatch between Drizzle data and public sources, or conflicting copy across locales.
- **Mitigations**: Store source URLs and last-reviewed timestamps in Drizzle, schedule quarterly audits, embed “Report an issue” affordances on STI and provider pages, and require moderation approval before publishing data imports.

## 4. AI Simulation & Tone Safety

- **Issue**: Model outputs from `/api/ai-scenarios/*` and `/api/tone-tune` can hallucinate medical directives, mis-handle crisis language, or leak system prompts if prompt-injected. `/tools/page.tsx` allows custom scenario payloads, increasing attack surface.
- **Why it matters**: Harmful advice contravenes Safhira’s educational scope and can create legal liability. Prompt leakage exposes internal guidance or secrets.
- **Signals**: Feedback citing unsafe AI output, sudden spikes in completion failures, logs showing repeated injection attempts, or users sharing leaked system text.
- **Mitigations**: Filter requests for self-harm, medical diagnoses, or PII; cap turn length; attach disclaimers in consuming UI; rate-limit per IP/session; and route high-risk prompts to human review. Keep prompt templates in version control with required security sign-off.

## 5. Community & Gamified Features Abuse

- **Issue**: The Dify chatbot (`/chat`), quiz surfaces (`/quiz`), `/api/leaderboard`, `/api/leaderboard/submit`, and server actions in `app/actions/leaderboard-actions.ts` operate without strong identity checks. Nicknames, scores, and messages can be spammed or contain stigmatizing language, overwhelming moderators.
- **Why it matters**: Toxic content alienates the audience and discourages institutional partnerships. Score manipulation undermines community trust and may expose data trends.
- **Signals**: Growth in flagged chat sessions, duplicate or offensive leaderboard nicknames, sudden submission bursts from a single IP, or moderators reporting backlog.
- **Mitigations**: Apply profanity filtering and rate limiting to leaderboard submissions, pre-moderate chat via keyword screening, enable in-product reporting, and document escalation playbooks. Consider CAPTCHA or throttling when abuse is detected.

## 6. Outreach & Identity Data Handling

- **Issue**: Newsletter subscriptions managed by `app/living-well-with-sti/actions.ts` store email addresses and invoke Resend. Failed sends roll back locally but may still expose data in third-party logs. There is no double opt-in or granular consent tracking.
- **Why it matters**: Mishandled contact data invites spam complaints, regulatory fines, and loss of trust in privacy promises.
- **Signals**: Bounce/complaint spikes from Resend, support requests for unsubscribes, or discrepancies between newsletter database and actual sends.
- **Mitigations**: Hash or tokenize stored emails, institute double opt-in, log unsubscribe events, and review third-party agreements for retention limits. Monitor Resend responses centrally.

## 7. Platform Reliability & Observability

- **Issue**: Critical flows—`/`, `/stis`, provider search, `/quiz`, `/chat`, `/living-well-with-sti`, and `/tools`—lack automated smoke tests or monitoring. Failures in external dependencies (OpenAI, Dify, Google Maps, Resend) ripple into core UX without defined runbooks.
- **Why it matters**: Service interruptions or degraded performance during sensitive moments damage user trust and partner relationships.
- **Signals**: Unexplained drops in conversion, elevated 5xx/timeout metrics, or repeated manual rollbacks of Drizzle migrations.
- **Mitigations**: Add lightweight end-to-end checks before deployments, instrument API latency/error dashboards, document failover steps for each vendor, and rehearse rollback procedures quarterly.

## 8. Database & Schema Governance

- **Issue**: Drizzle migrations power STI relationships, provider metadata, and AI transcript storage. Improper sequencing or unreviewed migrations can corrupt foreign keys or leak data through seeds in `db/data/`.
- **Why it matters**: A broken schema disrupts STI pages, location search, and AI session retrieval, directly impacting trust and functionality.
- **Signals**: Conflicting migrations in PRs, failed `pnpm db:migrate`, or staging/production schema drift discovered via `db:studio`.
- **Mitigations**: Require peer review for every migration, run `pnpm db:generate` and `pnpm db:push` in CI, snapshot backups before release, and keep seed data free of PII.

## 9. Web Application Security

- **Issue**: User-generated text from chats, AI scenarios, and leaderboards can trigger XSS if improperly escaped. API inputs (e.g., `/api/geocode`, `/api/leaderboard/submit`) lack explicit throttling, and dependency drift widens attack surface.
- **Why it matters**: Exploits compromise user data, deface educational content, and damage reputation.
- **Signals**: Security header scans failing, automated dependency alerts, or anomalous patterns in server logs (e.g., repeated script tags in submissions).
- **Mitigations**: Enforce CSP and other security headers, sanitize all user-rendered content, validate inputs server-side, add rate limiting, patch dependencies promptly, and run secret scanning on the repository.

## Summary & Next Steps

- Prioritize sensitive conversation protections: retention limits, consent messaging, and PII redaction across `/api/ai-scenarios/*`, `/api/tone-tune`, and `/chat`.
- Harden location and provider tooling: coordinate rounding, API key hygiene, and abuse detection on `/api/geocode` and `/api/calculate-distances`.
- Maintain content accuracy: set review cadences for `app/stis`, provider directories, and prevalence copy with provenance tracking.
- Tame AI and community abuse vectors: enforce prompt filtering, disclaimers, rate limits, moderation tooling, and leaderboard safeguards.
- Invest in operations: add smoke tests, observability, vendor runbooks, and migration governance to keep releases predictable.

Addressing these areas keeps Safhira dependable for people seeking sensitive STI guidance while preparing the platform for broader adoption.
