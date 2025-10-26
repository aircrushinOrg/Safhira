# AI-Native Simulator Expansion PRD

## Background
- `GameEmbed` currently loads fixed scenario templates from `@/lib/simulator/scenarios` and drives NPC chats via the `POST /api/ai-scenarios/session/[sessionId]/turns` pipeline.
- The API already supports summaries, scores, suggested follow-ups, streaming replies, and speech capture; the UI mostly surfaces NPC dialogue plus optional text reports in Chat Practice.
- Learners manually pick scenarios; there is no personalised pacing, dynamic scenario remixing, or AI-driven briefing loop that carries across sessions.
- Voice capture exists in `ChatPractice`, but NPC output and coaching remain text-only, limiting immersion.

## Product Vision
Deliver an AI-native learning loop where the simulator senses player intent, generates bespoke scenario beats on the fly, and mirrors human communication cues (voice, tone, pace). The experience should feel like an adaptive coach who stages realistic scenes, intervenes with live guidance, and curates reflections automatically.

## Goals
- Auto-orchestrate practice sessions that adapt to learner skill and prior performance without manual menu navigation.
- Provide real-time AI co-piloting that shapes player phrasing, tone, and pacing while preserving agency.
- Extend NPC interactions beyond text by generating expressive audio and emotional feedback that matches the conversation arc.

## Non-Goals
- Rebuild the Phaser overworld core movement mechanics.
- Replace the existing assessment framework (risk score, summaries) with a new rubric.
- Ship facilitator dashboards; this PRD focuses on the learner experience inside the simulator.

## Users
- **Learners** seeking immersive rehearsal with contextual coaching tailored to their strengths and gaps.
- **Facilitators** who expect richer artefacts (auto-notes, tone analysis, scenario mixes) to feedback quickly.

## Proposed Features

### 1. AI Scenario Director
**Concept**
A director service curates branching micro-scenarios based on learner profile, past session metadata, and live turn outcomes.

**Core Capabilities**
- **Dynamic scene briefs:** Before spawning an NPC encounter, call a new `/api/ai-scenarios/director` endpoint that synthesises an encounter brief. Inputs include the learner profile, last session summary, unresolved learning objectives, and recent risk score trends.
- **Beat remixing:** Instead of a single template, the director assembles a 3-beat arc (hook, escalation, resolution) by recombining fragments from `ScenarioTemplateConfig` and live generated prompts. Phaser scenes consume this arc to adjust NPC pathing, props, or dialogue triggers.
- **Tension calibration:** Use accumulated `summary.riskLevel` and `score.riskScore` to push or ease tension. High-risk learners receive supportive NPC tactics first; confident learners face harder pushback.
- **Session memory:** Persist director decisions (selected beats, difficulty, rationale) alongside `aiScenarioSessions` so future encounters reference what was already covered.

**Success Signals**
- 50% reduction in repeated scenario selection (learners stay in auto-curated flow).
- Learners encounter at least one fresh beat variant in 80% of sessions.

### 2. Live AI Co-Pilot
**Concept**
An in-overlay sidekick that listens to player speech/text, drafts alternative phrasing in real time, and visualises tone/pace feedback while the conversation streams.

**Core Capabilities**
- **Streaming critique:** Extend the existing `/turns/stream` pipeline to fork each player utterance through a `coach` channel returning suggestions, empathetic language cues, and boundary reminders before the player hits send.
- **Tone meter:** Feed the captured audio waveform (from `ChatPractice` speech recorder) plus transcript into an analysis endpoint that classifies confidence, empathy, and assertiveness levels. Display a live meter that nudges toward target ranges derived from learning objectives.
- **Adaptive prompts:** When `SUMMARY_INTERVAL` is reached, the co-pilot proposes next-turn strategies (e.g., role-play setting boundaries) based on `safetyAlerts` and outstanding learning objectives, letting the learner accept or dismiss with one tap.
- **Facilitator presets:** Facilitators can push a coaching pack (set of phrases, do/don't) that seeds the co-pilot guidance for a cohort.

**Success Signals**
- 65% of learners accept at least one AI wording suggestion per session.
- Tone meter “green zone” dwell time increases by 25% versus baseline.

### 3. Expressive NPCs & Emotion Mirror
**Concept**
Shift NPC interactions from text bubbles to voiced, emotionally-aware exchanges while reflecting the learner’s tone back through an AI avatar.

**Core Capabilities**
- **NPC synthetic voices:** Pipe NPC replies through an on-device TTS engine (or OpenAI Audio API if available) with emotion parameters derived from the director’s beat metadata. Cache clips per turn for instant playback in Phaser.
- **Emotion mirror:** After each learner turn, render a short animated overlay that reflects perceived emotion (supportive, uncertain, assertive) and offers a quick tip (e.g., “Try slowing pace to emphasise empathy”). Powered by sentiment analysis on the player transcript plus tone meter data.
- **Bilingual parity:** Ensure TTS and emotion detection honour the locale auto-detected in `ChatPractice` so Malay and Mandarin players get equal fidelity.
- **Accessibility toggle:** Provide text-only fallback and captions for all audio.

**Success Signals**
- 75% of learners enable NPC voice playback after first exposure.
- Learners report higher realism scores (post-session survey baseline +30%).

### 4. Auto-Reflect & Share Capsules
**Concept**
Generate a story-like artefact at session end that stitches highlights, tone graphs, and AI reflections into a shareable capsule.

**Core Capabilities**
- **Narrative synthesis:** Combine final report data, emotion mirror timelines, and director notes into a narrative summary (why the scene mattered, how the learner responded, recommended follow-up).
- **Smart snippets:** Auto-select impactful dialogue turns with AI annotations (“Here you validated consent clearly”).
- **Capsule export:** Offer secure share links or facilitator handoffs without exposing raw transcripts; use signed URLs tied to session IDs and expiry policies.
- **Progress alignment:** Suggest the next AI-generated beat pack, closing the loop back to the director.

**Success Signals**
- 60% of sessions result in capsule exports or facilitator shares.
- Facilitators reduce manual note-taking time by 40% (qualitative interviews).

## Technical Notes
- Introduce a new “Director” service module under `@/lib/ai-scenarios/director` to orchestrate beat generation, using existing `ScenarioTemplateConfig` as seed data plus LLM calls for remixing.
- Extend `aiScenarioSessions` with columns for `directorPlan`, `toneMetrics`, and `capsuleUrl` (pending schema discussion).
- Reuse the speech recording infrastructure in `ChatPractice`; add server endpoints for tone analysis (e.g., `/api/ai-scenarios/session/[id]/analysis/tone`).
- Phaser integration will require bi-directional events so React can push new beat briefs and receive NPC state changes without reloading the canvas.
- All new strings must route through `next-intl` locales; plan translation updates early.

## Analytics & Instrumentation
- Track director decisions (`director_scene_generated`, difficulty, beat IDs) and learner acceptance of AI suggestions (`copilot_suggestion_used`).
- Measure tone meter ranges per turn, NPC voice playback toggles, capsule exports, and facilitator preset usage.
- Monitor latency for new endpoints to ensure beat generation and co-pilot hints stay under 1.5 seconds.

## Open Questions
- What privacy guardrails are needed when storing tone metrics or audio-derived insights?
- How should we handle conflicting facilitator presets across cohorts (priority rules)?
- Can we cache generative beat packs offline to support flaky connections?

## Rollout Phases
1. **Director Alpha:** Ship AI Scenario Director with silent logging to validate beat generation quality; keep existing manual scenario selection as fallback.
2. **Co-Pilot Beta:** Enable Live AI Co-Pilot for limited cohorts, gathering UX feedback on suggestion helpfulness and tone meter accuracy.
3. **Immersive Launch:** Release Expressive NPCs and Auto-Reflect Capsules once latency and privacy policies are signed off.

