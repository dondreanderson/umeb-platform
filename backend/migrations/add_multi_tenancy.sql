-- Migration: Add Multi-Tenancy Support
-- Created: 2026-01-01

-- Step 1: Create Tenant table
CREATE TABLE IF NOT EXISTS tenant (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    plan_tier VARCHAR DEFAULT 'starter' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add tenant_id to existing tables
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
ALTER TABLE event ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
ALTER TABLE fundraisingcampaign ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
ALTER TABLE election ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
ALTER TABLE membershipfee ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
ALTER TABLE sponsor ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);

-- Step 3: Create a default tenant for existing data (optional)
INSERT INTO tenant (name, slug, plan_tier, is_active)
VALUES ('Default Organization', 'default-org', 'business', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Step 4: Update existing records to link to default tenant (optional)
-- UPDATE "user" SET tenant_id = (SELECT id FROM tenant WHERE slug = 'default-org') WHERE tenant_id IS NULL;
-- UPDATE event SET tenant_id = (SELECT id FROM tenant WHERE slug = 'default-org') WHERE tenant_id IS NULL;
-- UPDATE fundraisingcampaign SET tenant_id = (SELECT id FROM tenant WHERE slug = 'default-org') WHERE tenant_id IS NULL;
-- UPDATE election SET tenant_id = (SELECT id FROM tenant WHERE slug = 'default-org') WHERE tenant_id IS NULL;
-- UPDATE membershipfee SET tenant_id = (SELECT id FROM tenant WHERE slug = 'default-org') WHERE tenant_id IS NULL;
-- UPDATE sponsor SET tenant_id = (SELECT id FROM tenant WHERE slug = 'default-org') WHERE tenant_id IS NULL;

-- Step 5: (Future) Make tenant_id NOT NULL after data migration
-- ALTER TABLE "user" ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE event ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE fundraisingcampaign ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE election ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE membershipfee ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE sponsor ALTER COLUMN tenant_id SET NOT NULL;
