-- PostgreSQL initialization script for YesCoin
-- This script sets up the database with proper permissions and extensions

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional user for read-only access (optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'yescoin_readonly') THEN
        CREATE ROLE yescoin_readonly;
    END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE yescoin_db TO yescoin_readonly;
GRANT USAGE ON SCHEMA public TO yescoin_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO yescoin_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO yescoin_readonly;

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples and will be handled by Prisma

-- Set timezone
SET timezone = 'UTC';

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'YesCoin database initialized successfully';
END
$$;