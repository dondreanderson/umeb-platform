-- Create Sponsor Table
CREATE TABLE IF NOT EXISTS sponsor (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event(id),
    name VARCHAR NOT NULL,
    logo_url VARCHAR,
    tier VARCHAR DEFAULT 'Bronze' NOT NULL,
    website VARCHAR,
    bio TEXT,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS ix_sponsor_id ON sponsor (id);
CREATE INDEX IF NOT EXISTS ix_sponsor_name ON sponsor (name);
