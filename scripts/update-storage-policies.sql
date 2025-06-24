-- Update Storage RLS Policies for KYC documents
-- This script modifies the existing policies to be less restrictive for testing

-- First, drop the existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;

-- Create a more permissive policy for uploads during testing
-- This allows any authenticated user to upload to the kyc_documents bucket
CREATE POLICY "Allow uploads to KYC documents bucket" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'kyc_documents');

-- Create a more permissive policy for viewing documents during testing
-- This allows any authenticated user to view documents in the kyc_documents bucket
CREATE POLICY "Allow viewing KYC documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'kyc_documents');

-- Note: For production, you would want to revert to more restrictive policies
-- that check the user ID against the folder name
