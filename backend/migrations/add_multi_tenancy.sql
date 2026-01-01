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

-- Step 2: Add tenant_id to existing tables (only if tables exist)
DO $$
BEGIN
    -- Add to user table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user') THEN
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
    END IF;
    
    -- Add to event table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event') THEN
        ALTER TABLE event ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
    END IF;
    
    -- Add to fundraisingcampaign table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fundraisingcampaign') THEN
        ALTER TABLE fundraisingcampaign ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
    END IF;
    
    -- Add to election table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'election') THEN
        ALTER TABLE election ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
    END IF;
    
    -- Add to membershipfee table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'membershipfee') THEN
        ALTER TABLE membershipfee ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
    END IF;
    
    -- Add to sponsor table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sponsor') THEN
        ALTER TABLE sponsor ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenant(id);
    END IF;
END $$;

-- Step 3: Create a default tenant for existing data (optional)
INSERT INTO tenant (name, slug, plan_tier, is_active)
VALUES ('Default Organization', 'default-org', 'business', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Step 4: Update existing records to link to default tenant (optional - uncomment when ready)
-- DO $$
-- DECLARE default_tenant_id INTEGER;
-- BEGIN
--     SELECT id INTO default_tenant_id FROM tenant WHERE slug = 'default-org';
--     
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user') THEN
--         UPDATE "user" SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
--     END IF;
--     
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event') THEN
--         UPDATE event SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
--     END IF;
--     
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fundraisingcampaign') THEN
--         UPDATE fundraisingcampaign SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
--     END IF;
--     
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'election') THEN
--         UPDATE election SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
--     END IF;
--     
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'membershipfee') THEN
--         UPDATE membershipfee SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
--     END IF;
--     
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sponsor') THEN
--         UPDATE sponsor SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
--     END IF;
-- END $$;

-- Step 5: (Future) Make tenant_id NOT NULL after data migration
-- ALTER TABLE "user" ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE event ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE fundraisingcampaign ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE election ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE membershipfee ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE sponsor ALTER COLUMN tenant_id SET NOT NULL;
