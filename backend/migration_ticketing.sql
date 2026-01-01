-- Create TicketType Table
CREATE TABLE IF NOT EXISTS tickettype (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event(id),
    name VARCHAR NOT NULL,
    description VARCHAR,
    price FLOAT DEFAULT 0.0 NOT NULL,
    currency VARCHAR DEFAULT 'USD' NOT NULL,
    quantity_available INTEGER NOT NULL,
    quantity_sold INTEGER DEFAULT 0 NOT NULL,
    sale_start TIMESTAMP,
    sale_end TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_tickettype_id ON tickettype (id);

-- Create EventRegistration Table
CREATE TABLE IF NOT EXISTS eventregistration (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event(id),
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    ticket_type_id INTEGER NOT NULL REFERENCES tickettype(id),
    status VARCHAR DEFAULT 'PENDING' NOT NULL,
    payment_status VARCHAR DEFAULT 'UNPAID' NOT NULL,
    payment_id VARCHAR,
    check_in_status BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP,
    qr_code_data VARCHAR UNIQUE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS ix_eventregistration_id ON eventregistration (id);
