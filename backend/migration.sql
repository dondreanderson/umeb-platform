BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> a8f672f59893

CREATE TYPE userrole AS ENUM ('ADMIN', 'MEMBER', 'DONOR', 'VOLUNTEER');

CREATE TYPE membershiptier AS ENUM ('NONE', 'BRONZE', 'SILVER', 'GOLD');

CREATE TABLE "user" (
    id SERIAL NOT NULL, 
    full_name VARCHAR, 
    email VARCHAR NOT NULL, 
    hashed_password VARCHAR NOT NULL, 
    is_active BOOLEAN, 
    role userrole, 
    membership_tier membershiptier, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_user_email ON "user" (email);

CREATE INDEX ix_user_full_name ON "user" (full_name);

CREATE INDEX ix_user_id ON "user" (id);

CREATE TABLE donor (
    id SERIAL NOT NULL, 
    user_id INTEGER, 
    first_name VARCHAR, 
    last_name VARCHAR, 
    email VARCHAR, 
    phone VARCHAR, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE INDEX ix_donor_email ON donor (email);

CREATE INDEX ix_donor_first_name ON donor (first_name);

CREATE INDEX ix_donor_id ON donor (id);

CREATE INDEX ix_donor_last_name ON donor (last_name);

CREATE TABLE event (
    id SERIAL NOT NULL, 
    title VARCHAR NOT NULL, 
    description TEXT, 
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    location VARCHAR NOT NULL, 
    capacity INTEGER, 
    created_by_id INTEGER, 
    PRIMARY KEY (id), 
    FOREIGN KEY(created_by_id) REFERENCES "user" (id)
);

CREATE INDEX ix_event_id ON event (id);

CREATE INDEX ix_event_title ON event (title);

CREATE TABLE donation (
    id SERIAL NOT NULL, 
    donor_id INTEGER, 
    amount FLOAT NOT NULL, 
    currency VARCHAR, 
    payment_status VARCHAR, 
    stripe_payment_id VARCHAR, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(donor_id) REFERENCES donor (id)
);

CREATE INDEX ix_donation_id ON donation (id);

INSERT INTO alembic_version (version_num) VALUES ('a8f672f59893') RETURNING alembic_version.version_num;

-- Running upgrade a8f672f59893 -> 50439dd282a3

ALTER TABLE event ADD COLUMN status VARCHAR DEFAULT 'DRAFT' NOT NULL;

ALTER TABLE event ADD COLUMN event_type VARCHAR DEFAULT 'MEETING' NOT NULL;

ALTER TABLE event ADD COLUMN ticket_price FLOAT;

ALTER TABLE event ADD COLUMN registration_deadline TIMESTAMP WITHOUT TIME ZONE;

UPDATE alembic_version SET version_num='50439dd282a3' WHERE alembic_version.version_num = 'a8f672f59893';

-- Running upgrade 50439dd282a3 -> 7057a8219a47

CREATE TYPE emailliststatus AS ENUM ('DRAFT', 'SENT', 'FAILED');

CREATE TABLE emaillist (
    id SERIAL NOT NULL, 
    event_id INTEGER, 
    name VARCHAR NOT NULL, 
    recipients JSON, 
    subject VARCHAR NOT NULL, 
    body TEXT NOT NULL, 
    status emailliststatus, 
    sent_at TIMESTAMP WITHOUT TIME ZONE, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(event_id) REFERENCES event (id)
);

CREATE INDEX ix_emaillist_id ON emaillist (id);

CREATE INDEX ix_emaillist_name ON emaillist (name);

CREATE TABLE eventbudget (
    id SERIAL NOT NULL, 
    event_id INTEGER, 
    category VARCHAR NOT NULL, 
    planned_amount FLOAT, 
    actual_amount FLOAT, 
    forecast_amount FLOAT, 
    PRIMARY KEY (id), 
    FOREIGN KEY(event_id) REFERENCES event (id)
);

CREATE INDEX ix_eventbudget_id ON eventbudget (id);

CREATE TABLE eventesg (
    id SERIAL NOT NULL, 
    event_id INTEGER, 
    metric VARCHAR NOT NULL, 
    value FLOAT, 
    unit VARCHAR NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(event_id) REFERENCES event (id)
);

CREATE INDEX ix_eventesg_id ON eventesg (id);

CREATE TABLE eventgoal (
    id SERIAL NOT NULL, 
    event_id INTEGER, 
    metric_name VARCHAR NOT NULL, 
    target_value FLOAT NOT NULL, 
    actual_value FLOAT, 
    PRIMARY KEY (id), 
    FOREIGN KEY(event_id) REFERENCES event (id)
);

CREATE INDEX ix_eventgoal_id ON eventgoal (id);

ALTER TABLE event ADD COLUMN region VARCHAR;

ALTER TABLE event ADD COLUMN is_template BOOLEAN;

ALTER TABLE event ADD COLUMN parent_event_id INTEGER;

ALTER TABLE event ADD COLUMN scenario_type VARCHAR DEFAULT 'IN_PERSON' NOT NULL;

ALTER TABLE event ADD COLUMN is_public BOOLEAN;

ALTER TABLE event ADD FOREIGN KEY(parent_event_id) REFERENCES event (id);

UPDATE alembic_version SET version_num='7057a8219a47' WHERE alembic_version.version_num = '50439dd282a3';

-- Running upgrade 7057a8219a47 -> 0ed42107af66

CREATE TABLE election (
    id SERIAL NOT NULL, 
    title VARCHAR NOT NULL, 
    description TEXT, 
    start_date TIMESTAMP WITHOUT TIME ZONE, 
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    is_active BOOLEAN, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_election_id ON election (id);

CREATE INDEX ix_election_title ON election (title);

CREATE TABLE candidate (
    id SERIAL NOT NULL, 
    election_id INTEGER NOT NULL, 
    name VARCHAR NOT NULL, 
    bio TEXT, 
    photo_url VARCHAR, 
    PRIMARY KEY (id), 
    FOREIGN KEY(election_id) REFERENCES election (id) ON DELETE CASCADE
);

CREATE INDEX ix_candidate_id ON candidate (id);

CREATE TABLE vote (
    id SERIAL NOT NULL, 
    election_id INTEGER NOT NULL, 
    candidate_id INTEGER NOT NULL, 
    user_id INTEGER NOT NULL, 
    timestamp TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(candidate_id) REFERENCES candidate (id) ON DELETE CASCADE, 
    FOREIGN KEY(election_id) REFERENCES election (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE INDEX ix_vote_id ON vote (id);

UPDATE alembic_version SET version_num='0ed42107af66' WHERE alembic_version.version_num = '7057a8219a47';

-- Running upgrade 0ed42107af66 -> 9a6d3fd9871a

ALTER TABLE "user" ADD COLUMN bio VARCHAR;

ALTER TABLE "user" ADD COLUMN phone_number VARCHAR;

ALTER TABLE "user" ADD COLUMN avatar_url VARCHAR;

ALTER TABLE "user" ADD COLUMN linkedin_url VARCHAR;

UPDATE alembic_version SET version_num='9a6d3fd9871a' WHERE alembic_version.version_num = '0ed42107af66';

-- Running upgrade 9a6d3fd9871a -> 70e70d1d8cf6

CREATE TABLE position (
    id SERIAL NOT NULL, 
    title VARCHAR NOT NULL, 
    description TEXT, 
    term_length VARCHAR, 
    is_executive BOOLEAN, 
    current_holder_id INTEGER, 
    PRIMARY KEY (id), 
    FOREIGN KEY(current_holder_id) REFERENCES "user" (id)
);

CREATE INDEX ix_position_id ON position (id);

CREATE INDEX ix_position_title ON position (title);

ALTER TABLE election ADD COLUMN position_id INTEGER;

ALTER TABLE election ADD FOREIGN KEY(position_id) REFERENCES position (id);

UPDATE alembic_version SET version_num='70e70d1d8cf6' WHERE alembic_version.version_num = '9a6d3fd9871a';

-- Running upgrade 70e70d1d8cf6 -> 6040e64ebe68

CREATE TABLE membershipfee (
    id SERIAL NOT NULL, 
    name VARCHAR NOT NULL, 
    amount FLOAT NOT NULL, 
    interval VARCHAR NOT NULL, 
    is_active BOOLEAN, 
    description VARCHAR, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_membershipfee_id ON membershipfee (id);

CREATE TABLE payment (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    fee_id INTEGER NOT NULL, 
    amount FLOAT NOT NULL, 
    status VARCHAR NOT NULL, 
    transaction_id VARCHAR, 
    payment_date TIMESTAMP WITHOUT TIME ZONE, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(fee_id) REFERENCES membershipfee (id), 
    FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE INDEX ix_payment_id ON payment (id);

UPDATE alembic_version SET version_num='6040e64ebe68' WHERE alembic_version.version_num = '70e70d1d8cf6';

COMMIT;

