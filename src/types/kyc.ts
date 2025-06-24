// KYC verification types

/**
 * KYC verification status
 */
export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * ID document type
 */
export enum IdType {
  PASSPORT = 'passport',
  NATIONAL_ID = 'nationalId',
}

/**
 * KYC verification data
 */
export interface KycVerification {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO format date string
  nationality: string;
  idType: IdType;
  idNumber: string;
  documentUrl?: string;
  status: KycStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

/**
 * KYC verification submission data
 */
export interface KycSubmissionData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  idType: IdType;
  idNumber: string;
  documentUrl?: string;
}

/**
 * KYC verification database record (as returned from Supabase)
 */
export interface KycVerificationRecord {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  id_type: string;
  id_number: string;
  document_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

/**
 * Convert a KYC verification record from the database to the frontend model
 */
export function mapKycRecordToVerification(record: KycVerificationRecord): KycVerification {
  return {
    id: record.id,
    userId: record.user_id,
    firstName: record.first_name,
    lastName: record.last_name,
    dateOfBirth: record.date_of_birth,
    nationality: record.nationality,
    idType: record.id_type as IdType,
    idNumber: record.id_number,
    documentUrl: record.document_url,
    status: record.status as KycStatus,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    reviewedAt: record.reviewed_at,
    reviewerNotes: record.reviewer_notes,
  };
}
