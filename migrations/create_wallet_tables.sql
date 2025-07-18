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
  wallet_address VARCHAR NOT NULL REFERENCES wallet_users(wallet_address),
  device_token VARCHAR NOT NULL,
  device_name VARCHAR,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, device_token)
);

-- Create table for KYC verification data
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR NOT NULL REFERENCES wallet_users(wallet_address),
  verification_status VARCHAR NOT NULL DEFAULT 'pending',
  verification_type VARCHAR NOT NULL,
  verification_data JSONB NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE wallet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_users
CREATE POLICY "Users can read their own wallet data"
  ON wallet_users FOR SELECT
  USING (wallet_address = auth.uid()::text);

CREATE POLICY "Users can update their own wallet data"
  ON wallet_users FOR UPDATE
  USING (wallet_address = auth.uid()::text);

-- Create policies for wallet_devices
CREATE POLICY "Users can read their own devices"
  ON wallet_devices FOR SELECT
  USING (wallet_address = auth.uid()::text);

CREATE POLICY "Users can insert their own devices"
  ON wallet_devices FOR INSERT
  WITH CHECK (wallet_address = auth.uid()::text);

CREATE POLICY "Users can update their own devices"
  ON wallet_devices FOR UPDATE
  USING (wallet_address = auth.uid()::text);

-- Create policies for kyc_verifications
CREATE POLICY "Users can read their own KYC data"
  ON kyc_verifications FOR SELECT
  USING (wallet_address = auth.uid()::text);

CREATE POLICY "Users can insert their own KYC data"
  ON kyc_verifications FOR INSERT
  WITH CHECK (wallet_address = auth.uid()::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS wallet_users_wallet_address_idx ON wallet_users(wallet_address);
CREATE INDEX IF NOT EXISTS wallet_devices_wallet_address_idx ON wallet_devices(wallet_address);
CREATE INDEX IF NOT EXISTS kyc_verifications_wallet_address_idx ON kyc_verifications(wallet_address);
