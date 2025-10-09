# Potential Risks and Strategy

## Potential Risks

- **AI coaching transcripts and tone rewrites**: `/api/ai-scenarios/session`, `/api/ai-scenarios/session/[sessionId]/turns`, `/api/ai-scenarios/session/[sessionId]/final-report`, and `/api/tone-tune` ingest free-form narratives that can contain personal health details, persist raw conversation history in `aiScenarioTurns`/`aiScenarioResponses`, and depend on OpenAI credentials.
- **Embedded chat assistant traffic**: `app/chat/page.tsx` embeds a Dify chatbot that collects sexual-health questions, limiting our visibility into logging, consent capture, or moderation controls.
- **Location and provider lookup APIs**: `/api/geocode`, `/api/calculate-distances`, and provider search actions process user coordinates and forward requests to OpenStreetMap and Google Maps, creating over-collection and API key abuse risks.
- **Gamified learning and newsletter data**: `/api/leaderboard`, `/api/leaderboard/submit`, server actions in `app/actions/leaderboard-actions.ts`, and `subscribeToNewsletter` in `app/living-well-with-sti/actions.ts` store nicknames, scores, and email addresses that can be enumerated or spammed.
- **Information accuracy drift**: STI explainers in `app/stis`, prevalence content, and clinic records can become outdated without curated refresh cycles.
- **Operational resilience**: Limited automated coverage across pages (`/`, `/stis`, `/quiz`, `/chat`, `/living-well-with-sti`) and APIs increases the likelihood of unnoticed regressions during deploys.

## Strategy

### 1. Lock Down AI Coaching and Tone Features

- Gate `/tools` behind authentication or role checks before exposing `/api/ai-scenarios/*`; disable the tooling route entirely in production if it is not part of the user journey.
- Minimise persistence: redact phone numbers, emails, and explicit identifiers before saving to `aiScenarioTurns` and `aiScenarioResponses.rawResponse`; rotate `sessionId` values and expire records after short inactivity windows.
- Add server-side rate limiting per `sessionId` and IP on `/api/ai-scenarios/...` and `/api/tone-tune`; enforce maximum turn length and reject unsafe topics before relaying to OpenAI.
- Store OpenAI credentials with least privilege, proxy outbound calls for observability, and watermark AI output with non-medical disclaimers across consuming UI components.

### 2. Control Embedded Chat and External AI Tools

- Present explicit consent and safety notices before loading the Dify iframe on `/chat`; feature-flag the embed so sensitive locales can fall back to static guidance.
- Negotiate transcript retention SLAs with Dify, ensure deletion routines are auditable, and monitor iframe `postMessage` events for scripted misuse.
- Provide a fallback explanation when third-party services are offline or withheld, and reiterate the limits of automated advice in interface copy.

### 3. Protect Location and Provider APIs

- Keep `GOOGLE_MAPS_API_KEY` and any Nominatim identifiers in environment variables; proxy requests server-side and strip precise coordinates from request/response logs.
- Round `userLatitude`/`userLongitude` to coarse grids before invoking `/api/calculate-distances`; cap acceptable radii and provider list sizes to deter bulk scraping.
- Cache `/api/geocode` results, rate limit by IP, reject non-Malaysian queries early, and surface only verified provider contact details from Drizzle.

### 4. Respect User Identifiers in Leaderboard and Newsletter

- Hash or tokenise stored emails in `newsletterSubscriptions`, require double opt-in, and capture unsubscribe events for audit.
- Protect `/api/leaderboard` and `/api/leaderboard/submit` with origin checks plus CAPTCHA or rate limiting to prevent nickname enumeration and score flooding.
- Sanitize `nickname` fields on the client and server, scope leaderboard responses to the requested quiz type, and purge quiz history beyond defined retention windows.

### 5. Maintain Accurate STI and Clinic Content

- Schedule quarterly reviews of STI copy, prevalence stats, and clinic metadata presented in `app/stis` and `app/components/ResourcesSection.tsx`; log source URLs in Drizzle for traceability.
- Embed “Report an issue” affordances on STI detail and provider pages, routing submissions to moderators with audit trails.
- Partner with trusted public-health datasets, verify imports before running `pnpm db:push`, and document calibration decisions inside `docs/`.

### 6. Strengthen Operational Resilience

- Extend smoke tests or scripted checks for `/`, `/stis`, provider search, `/quiz`, `/chat`, and `/living-well-with-sti` prior to deploys.
- Instrument `/api/ai-scenarios/*`, `/api/tone-tune`, `/api/geocode`, `/api/calculate-distances`, and `/api/leaderboard*` with structured logs plus alerts for unusual latency or error spikes.
- Maintain release runbooks covering Drizzle migrations and third-party outages (OpenAI, Dify, Google, Resend), and review dependency advisories weekly for frameworks and sanitizers.
