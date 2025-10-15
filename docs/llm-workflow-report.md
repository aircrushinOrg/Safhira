# AI Scenario LLM Workflow Report

This report summarises how the AI scenario endpoints in `app/api/ai-scenarios` orchestrate
large language model (LLM) interactions, database persistence, and safety controls.

## Overview
- Sessions record simulated conversations between a learner (player) and an NPC.
- Each learner turn triggers an LLM call that returns the NPC reply plus optional
  summary, assessment, and safety artefacts.
- The workflow enforces language guidelines, scenario learning goals, and strict
  JSON outputs so the client and database stay consistent.

## Key Data Structures
- `aiScenarioSessions` — scenario metadata, localisation, NPC configuration, and
  completion state (`db/schema.ts`).
- `aiScenarioTurns` — ordered conversation history for replay and prompt context.
- `aiScenarioResponses` — LLM outputs per player turn, including summaries,
  scores, safety alerts, and final reports.

## Session Creation (`POST /api/ai-scenarios/session`)
1. Validates the payload into `ScenarioDescriptor` and `NpcProfile`
   (`session/route.ts`).
2. Persists a new session (or updates an existing one) with objectives, NPC
   traits, locale, and control flags.
3. Returns session metadata to the client, including the generated `sessionId`.

## Turn Handling (`POST /api/ai-scenarios/session/[sessionId]/turns`)
1. Verifies the session and loads existing history from the database.
2. Decides whether summary or assessment outputs are due based on
   `SUMMARY_INTERVAL` (every three player turns by default) or explicit
   overrides.
3. Builds prompts via `buildSystemPrompt`, `buildFormatInstruction`,
   `buildScenarioSnapshot`, and `toOpenAIMessages` (`lib/ai-scenarios/engine.ts`).
   - Prompt content encodes scenario goals, NPC persona, safety rails, scoring
     rubric, and locale instructions.
4. Calls the configured chat completion model (`DEFAULT_MODEL`) and requests JSON
   output; retries without the response-format hint if the provider rejects it.
5. Parses the JSON with `parseModelResponse`, normalising scores, risk levels,
   and language fields.
6. Within a transaction, writes the player's message and NPC reply to
   `aiScenarioTurns`, stores the parsed payload in `aiScenarioResponses`, and
   updates session state (last summary, last score, completion timestamp).

## Suggested Replies (`GET /api/ai-scenarios/session/[sessionId]/suggested`)
1. Gathers the latest eight turns and the most recent NPC line for context.
2. Constructs a single JSON-producing prompt instructing the model to craft
   positive and negative reply options that match the stored locale.
3. Enforces character limits and trims responses before returning them.

## Final Report Generation (`POST /api/ai-scenarios/session/[sessionId]/final-report`)
1. Confirms the session has completed (or `force=true` is supplied) and fetches
   conversation history plus the latest assessment snapshot.
2. Rebuilds prompts with `finalReportDue=true`, ensuring consistency with earlier
   scoring and locale rules.
3. Sends an additional accuracy reminder to lock the response into the player's
   language and emphasise risk-sensitive feedback.
4. Retries without the JSON response-format directive if the model rejects it.
5. Stores the final coaching report and marks the session complete in a
   transaction.

## Prompt Construction Highlights
- `buildLocaleDirective` adapts instructions to English, Simplified Chinese, or
  Malay while encouraging tone mirroring.
- `buildSystemPrompt` embeds learning objectives, NPC tactics, safety boundaries,
  and scoring requirements.
- `buildFormatInstruction` supplies a strict schema for JSON fields, language
  requirements for safety alerts, and guidance for numeric ranges.
- `buildScenarioSnapshot` summarises recent dialogue (last eight turns) and
  control flags to keep the model anchored in session state.

## Safety & Robustness Measures
- Missing `OPENAI_API_KEY` triggers 500 responses before any model call.
- Guard rails ensure summaries, scores, and final reports appear only when due,
  preventing schema drift.
- Score values are clamped to 0–100 and risk levels default to `"medium"` when
  parsing fails.
- Response parsing strips code fences and normalises newline escapes to survive
  imperfect model formatting.
- Transactions keep session metadata, turns, and responses in sync even if a
  downstream write fails.

## Environment & Configuration
- Models use the OpenAI-compatible Chat Completions API. Override defaults via
  `SCENARIO_MODEL_NAME`, `SUGGESTION_MODEL_NAME`, or `REPORT_MODEL_NAME` env
  vars; custom endpoints can be set with `OPENAI_BASE_URL`.
- The API routes run with the App Router runtime `nodejs`; ensure outbound
  network access to the LLM provider.
- Locale defaults to `en` but can be overridden per session or per request.

## Operational Considerations
- Run `pnpm dev` and simulate conversations to verify prompt outputs end-to-end.
- Monitor token usage: transcripts include the last eight turns plus system
  prompts; long sessions may need pruning if models truncate replies.
- Review the stored `rawResponse` payloads when debugging prompt drift or schema
  mismatches.
- Extend `aiScenarioSessions` carefully; adjust prompt builders if new session
  flags should influence model behaviour.

