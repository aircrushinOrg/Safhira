# AI Scenario Simulation Storage

This document describes the persistence layer that backs the `/api/ai-scenarios` endpoint.

## Tables

### `ai_scenario_sessions`
Tracks high-level metadata for every simulation session initiated from the client.

| Column | Type | Notes |
| --- | --- | --- |
| `session_id` | `varchar(128)` | Primary key provided by the client (UUID recommended). |
| `scenario_id` | `varchar(128)` | Scenario descriptor id from the client payload. |
| `scenario_title` | `varchar(255)` | Optional friendly title. |
| `scenario_setting` | `varchar(255)` | Optional location/setting descriptor. |
| `tension_level` | `varchar(16)` | Normalised `low`\|`medium`\|`high` tension. |
| `learning_objectives` | `jsonb` | String array of objectives. |
| `supporting_facts` | `jsonb` | String array of canonical facts. |
| `locale` | `varchar(16)` | Locale hint passed by the client. |
| `allow_auto_end` | `boolean` | Whether the assistant may end conversations. |
| `npc_*` | `varchar`/`jsonb`/`text` | Captures persona, goals, tactics, boundaries. |
| `last_summary_risk` | `varchar(16)` | Risk level from the latest summary checkpoint. |
| `last_score` | `integer` | Latest refusal effectiveness score (0-100). |
| `completed_at` | `timestamp` | Populated when the conversation ends. |
| `completion_reason` | `text` | Reason supplied by the model or player. |
| `created_at` / `updated_at` | `timestamp` | Audit timestamps. |

### `ai_scenario_turns`
Stores an ordered transcript of player/NPC turns.

| Column | Type | Notes |
| --- | --- | --- |
| `session_id` | `varchar(128)` | FK → `ai_scenario_sessions.session_id` (cascade delete). |
| `turn_index` | `integer` | 1-based ordering of the message within a session. |
| `role` | `varchar(16)` | `player` or `npc`. |
| `content` | `text` | Message body. |
| `created_at` | `timestamp` | Defaults to `now()`. |

A unique index on `(session_id, turn_index)` prevents duplicate inserts when clients retry.

### `ai_scenario_responses`
Captures every model response including checkpoint summaries and the final report.

| Column | Type | Notes |
| --- | --- | --- |
| `session_id` | `varchar(128)` | FK → `ai_scenario_sessions`. |
| `player_turn_count` | `integer` | Count of player turns seen by the model when this response was generated. |
| `summary_due` / `assessment_due` | `boolean` | Flags computed server-side for checkpoint cadence. |
| `npc_reply` | `text` | Assistant reply delivered to the player. |
| `summary` | `jsonb` | Structured summary payload or `null`. |
| `score` | `jsonb` | Score payload or `null`. |
| `final_report` | `jsonb` | Final report object when the session ends. |
| `safety_alerts` | `jsonb` | Array of strings flagged during generation. |
| `conversation_complete` | `boolean` | Snapshot of `responseBody.conversationComplete`. |
| `conversation_complete_reason` | `text` | Model-supplied completion reason. |
| `raw_response` | `jsonb` | The response body returned to the client for quick replay/debug. |
| `created_at` | `timestamp` | Defaults to `now()`. |

`(session_id, player_turn_count)` is unique to simplify upserts on retries.

## Query hints

- Fetch a full conversation transcript:
  ```sql
  SELECT role, content
  FROM ai_scenario_turns
  WHERE session_id = $1
  ORDER BY turn_index;
  ```
- Retrieve the latest checkpoints and final report:
  ```sql
  SELECT player_turn_count, summary, score, final_report
  FROM ai_scenario_responses
  WHERE session_id = $1
  ORDER BY player_turn_count DESC
  LIMIT 1;
  ```
- List sessions awaiting completion:
  ```sql
  SELECT session_id, scenario_title, npc_name, updated_at
  FROM ai_scenario_sessions
  WHERE completed_at IS NULL
  ORDER BY updated_at DESC;
  ```

Run `pnpm db:migrate` to create the tables after pulling this change.

## API endpoints

- `POST /api/ai-scenarios/session` – initialise or update a session record with scenario/NPC metadata.
- `GET /api/ai-scenarios/session/:sessionId` – retrieve session metadata, turn transcript, and stored responses.
- `GET /api/ai-scenarios/session/:sessionId/turns` – fetch the ordered conversation history only.
- `POST /api/ai-scenarios/session/:sessionId/turns` – submit a player message, trigger the AI response, and persist the new turns/checkpoint data.
