-- Update RLS Policies for KYC verifications table
-- This script modifies the existing policies to be less restrictive for testing

-- First, drop the existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own KYC data" ON kyc_verifications;
DROP POLICY IF EXISTS "Users can insert their own KYC data" ON kyc_verifications;
DROP POLICY IF EXISTS "Users can update their own pending KYC data" ON kyc_verifications;

-- Create a more permissive policy for inserts during testing
-- This allows any authenticated user to insert KYC verifications
CREATE POLICY "Allow inserts to KYC verifications" 
  ON kyc_verifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create a more permissive policy for viewing KYC verifications during testing
-- This allows any authenticated user to view KYC verifications
CREATE POLICY "Allow viewing KYC verifications" 
  ON kyc_verifications 
  FOR SELECT 
  USING (true);

-- Create a more permissive policy for updating KYC verifications during testing
-- This allows any authenticated user to update KYC verifications
CREATE POLICY "Allow updating KYC verifications" 
  ON kyc_verifications 
  FOR UPDATE 
  USING (true);

-- Note: For production, you would want to revert to more restrictive policies
-- that check the user ID against the record's user_id field
