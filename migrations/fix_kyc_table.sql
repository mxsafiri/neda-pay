-- Fix the kyc_verifications table to ensure verification_data is properly defined as JSONB
DROP TABLE IF EXISTS kyc_verifications;

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR NOT NULL,
  verification_status VARCHAR NOT NULL DEFAULT 'pending',
  verification_type VARCHAR NOT NULL,
  verification_data JSONB NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS kyc_verifications_user_id_idx ON kyc_verifications(user_id);
