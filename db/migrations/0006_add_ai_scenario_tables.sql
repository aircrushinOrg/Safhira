CREATE TABLE IF NOT EXISTS ai_scenario_sessions (
    session_id varchar(128) PRIMARY KEY,
    scenario_id varchar(128) NOT NULL,
    scenario_title varchar(255),
    scenario_setting varchar(255),
    tension_level varchar(16),
    learning_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
    supporting_facts jsonb NOT NULL DEFAULT '[]'::jsonb,
    locale varchar(16),
    allow_auto_end boolean NOT NULL DEFAULT true,
    npc_id varchar(128) NOT NULL,
    npc_name varchar(255) NOT NULL,
    npc_role varchar(255) NOT NULL,
    npc_persona text,
    npc_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
    npc_tactics jsonb NOT NULL DEFAULT '[]'::jsonb,
    npc_boundaries jsonb NOT NULL DEFAULT '[]'::jsonb,
    last_summary_risk varchar(16),
    last_score integer,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    completed_at timestamp,
    completion_reason text
);

CREATE INDEX IF NOT EXISTS idx_ai_scenario_sessions_created_at ON ai_scenario_sessions (created_at);
CREATE INDEX IF NOT EXISTS idx_ai_scenario_sessions_npc ON ai_scenario_sessions (npc_id);
CREATE INDEX IF NOT EXISTS idx_ai_scenario_sessions_scenario ON ai_scenario_sessions (scenario_id);

CREATE TABLE IF NOT EXISTS ai_scenario_turns (
    id serial PRIMARY KEY,
    session_id varchar(128) NOT NULL REFERENCES ai_scenario_sessions(session_id) ON DELETE CASCADE,
    turn_index integer NOT NULL,
    role varchar(16) NOT NULL,
    content text NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_scenario_turns_session ON ai_scenario_turns (session_id);
CREATE INDEX IF NOT EXISTS idx_ai_scenario_turns_turn_index ON ai_scenario_turns (turn_index);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_scenario_turns_session_index ON ai_scenario_turns (session_id, turn_index);

CREATE TABLE IF NOT EXISTS ai_scenario_responses (
    id serial PRIMARY KEY,
    session_id varchar(128) NOT NULL REFERENCES ai_scenario_sessions(session_id) ON DELETE CASCADE,
    player_turn_count integer NOT NULL,
    summary_due boolean NOT NULL DEFAULT false,
    assessment_due boolean NOT NULL DEFAULT false,
    npc_reply text NOT NULL,
    summary jsonb,
    score jsonb,
    final_report jsonb,
    safety_alerts jsonb NOT NULL DEFAULT '[]'::jsonb,
    conversation_complete boolean NOT NULL DEFAULT false,
    conversation_complete_reason text,
    raw_response jsonb,
    created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_scenario_responses_session ON ai_scenario_responses (session_id);
CREATE INDEX IF NOT EXISTS idx_ai_scenario_responses_player_turn_count ON ai_scenario_responses (player_turn_count);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_scenario_responses_session_turns ON ai_scenario_responses (session_id, player_turn_count);
