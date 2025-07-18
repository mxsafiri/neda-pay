-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for wallet data
CREATE TABLE IF NOT EXISTS wallet_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR NOT NULL UNIQUE,
  encrypted_wallet_data TEXT NOT NULL,
  encrypted_recovery_phrase TEXT NOT NULL,
  pin_hash VARCHAR NOT NULL,
  salt VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for device tokens
CREATE TABLE IF NOT EXISTS wallet_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR NOT NULL,
  device_token VARCHAR NOT NULL,
  device_name VARCHAR,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, device_token)
);

-- Create table for KYC verification data
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR NOT NULL,
  verification_status VARCHAR NOT NULL DEFAULT 'pending',
  verification_type VARCHAR NOT NULL,
  verification_data JSONB NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints after all tables are created
ALTER TABLE wallet_devices
  ADD CONSTRAINT fk_wallet_devices_wallet_address
  FOREIGN KEY (wallet_address) 
  REFERENCES wallet_users(wallet_address);

ALTER TABLE kyc_verifications
  ADD CONSTRAINT fk_kyc_verifications_wallet_address
  FOREIGN KEY (wallet_address) 
  REFERENCES wallet_users(wallet_address);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS wallet_users_wallet_address_idx ON wallet_users(wallet_address);
CREATE INDEX IF NOT EXISTS wallet_devices_wallet_address_idx ON wallet_devices(wallet_address);
CREATE INDEX IF NOT EXISTS kyc_verifications_wallet_address_idx ON kyc_verifications(wallet_address);

-- Add RLS (Row Level Security) policies
-- Note: We're temporarily disabling RLS until we set up proper authentication
-- You can enable these later when your auth system is properly configured

-- ALTER TABLE wallet_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wallet_devices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- For now, we'll just create the tables without RLS policies
-- This will allow your test scripts to work without authentication
-- You can add RLS policies later when your auth system is properly configured
