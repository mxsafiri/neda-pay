-- KYC Schema for NEDA-pay
-- This SQL script creates the necessary tables for KYC verification

-- Create KYC verification status enum
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Create ID type enum
CREATE TYPE id_type AS ENUM ('passport', 'nationalId');

-- Create KYC verification table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  id_type id_type NOT NULL,
  id_number TEXT NOT NULL,
  document_url TEXT,
  status kyc_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  
  -- Add a unique constraint to prevent duplicate submissions per user
  CONSTRAINT unique_user_verification UNIQUE (user_id)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);

-- Create RLS policies for kyc_verifications table
-- Enable RLS on the table
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only their own KYC data
CREATE POLICY "Users can view their own KYC data" 
  ON kyc_verifications 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Policy for users to insert their own KYC data
CREATE POLICY "Users can insert their own KYC data" 
  ON kyc_verifications 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for users to update their own KYC data if status is pending
CREATE POLICY "Users can update their own pending KYC data" 
  ON kyc_verifications 
  FOR UPDATE 
  USING (auth.uid()::text = user_id AND status = 'pending');

-- Create storage bucket for KYC documents
-- Note: This assumes Supabase Storage is enabled
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the storage bucket
CREATE POLICY "Users can upload their own KYC documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'kyc_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own KYC documents" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'kyc_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
