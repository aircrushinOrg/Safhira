-- Create state table if missing
CREATE TABLE IF NOT EXISTS state (
  state_id serial PRIMARY KEY,
  state_name varchar(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_state_name ON state (state_name);

-- Create provider table if missing
CREATE TABLE IF NOT EXISTS provider (
  provider_id serial PRIMARY KEY,
  state_id integer NOT NULL,
  provider_name varchar(255) NOT NULL,
  provider_address text NOT NULL,
  provider_phone_num varchar(50),
  provider_email varchar(255),
  provider_longitude numeric(9, 6),
  provider_latitude numeric(9, 6),
  provider_provide_prep boolean DEFAULT false NOT NULL,
  provider_provide_pep boolean DEFAULT false NOT NULL,
  provider_free_sti_screening boolean DEFAULT false NOT NULL,
  CONSTRAINT provider_state_id_state_state_id_fk FOREIGN KEY (state_id) REFERENCES state(state_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_state ON provider (state_id);
CREATE INDEX IF NOT EXISTS idx_provider_name ON provider (provider_name);

