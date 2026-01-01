-- Create EventSession Table
CREATE TABLE IF NOT EXISTS eventsession (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event(id),
    title VARCHAR NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR,
    speaker_name VARCHAR,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS ix_eventsession_id ON eventsession (id);
CREATE INDEX IF NOT EXISTS ix_eventsession_title ON eventsession (title);
