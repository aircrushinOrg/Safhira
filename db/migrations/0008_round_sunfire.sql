DO $$
BEGIN
    CREATE TYPE locale AS ENUM ('en', 'ms', 'zh');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS state_translations (
    state_id integer NOT NULL REFERENCES state(state_id) ON DELETE CASCADE,
    locale locale NOT NULL,
    state_name varchar(255) NOT NULL,
    PRIMARY KEY (state_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_state_translations_locale ON state_translations (locale);

CREATE TABLE IF NOT EXISTS sti_translations (
    sti_id integer NOT NULL REFERENCES sti(sti_id) ON DELETE CASCADE,
    locale locale NOT NULL,
    name varchar(255) NOT NULL,
    type varchar(50) NOT NULL,
    severity varchar(20) NOT NULL,
    treatability varchar(20) NOT NULL,
    treatment text NOT NULL,
    malaysian_context text NOT NULL,
    PRIMARY KEY (sti_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_sti_translations_locale ON sti_translations (locale);

CREATE TABLE IF NOT EXISTS symptom_translations (
    symptom_id integer NOT NULL REFERENCES symptom(symptom_id) ON DELETE CASCADE,
    locale locale NOT NULL,
    symptom_text text NOT NULL,
    PRIMARY KEY (symptom_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_symptom_translations_locale ON symptom_translations (locale);

CREATE TABLE IF NOT EXISTS transmission_translations (
    transmission_id integer NOT NULL REFERENCES transmission(transmission_id) ON DELETE CASCADE,
    locale locale NOT NULL,
    transmission_text text NOT NULL,
    PRIMARY KEY (transmission_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_transmission_translations_locale ON transmission_translations (locale);

CREATE TABLE IF NOT EXISTS health_effect_translations (
    health_effect_id integer NOT NULL REFERENCES health_effect(health_effect_id) ON DELETE CASCADE,
    locale locale NOT NULL,
    health_effect_text text NOT NULL,
    PRIMARY KEY (health_effect_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_health_effect_translations_locale ON health_effect_translations (locale);

CREATE TABLE IF NOT EXISTS prevention_translations (
    prevention_id integer NOT NULL REFERENCES prevention(prevention_id) ON DELETE CASCADE,
    locale locale NOT NULL,
    prevention_text text NOT NULL,
    PRIMARY KEY (prevention_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_prevention_translations_locale ON prevention_translations (locale);

CREATE TABLE IF NOT EXISTS quiz_question_translations (
    question_id integer NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    locale locale NOT NULL,
    statement text NOT NULL,
    explanation text NOT NULL,
    PRIMARY KEY (question_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_quiz_question_translations_locale ON quiz_question_translations (locale);
