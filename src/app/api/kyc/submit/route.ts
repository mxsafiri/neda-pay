import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import supabase from '@/lib/supabase';
import { IdType, KycStatus, KycSubmissionData } from '@/types/kyc';

// Define the KYC submission schema with Zod for validation
const kycSubmissionSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date (YYYY-MM-DD)' }),
  nationality: z.string().min(2, { message: 'Please select your nationality' }),
  idType: z.enum(['passport', 'nationalId'], { 
    required_error: 'Please select an ID type' 
  }),
  idNumber: z.string().min(4, { message: 'ID number must be at least 4 characters' }),
  documentUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = kycSubmissionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const kycData = validationResult.data;
    
    // Check if user already has a KYC verification
    const { data: existingVerification, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('id, status')
      .eq('user_id', kycData.userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error checking existing verification:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error checking existing verification',
          error: fetchError.message
        },
        { status: 500 }
      );
    }
    
    // If user already has an approved verification, don't allow new submission
    if (existingVerification && existingVerification.status === KycStatus.APPROVED) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You already have an approved KYC verification',
          verificationId: existingVerification.id
        },
        { status: 400 }
      );
    }
    
    // If user has a pending or rejected verification, update it
    if (existingVerification) {
      const { data: updatedVerification, error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          first_name: kycData.firstName,
          last_name: kycData.lastName,
          date_of_birth: kycData.dateOfBirth,
          nationality: kycData.nationality,
          id_type: kycData.idType,
          id_number: kycData.idNumber,
          document_url: kycData.documentUrl,
          status: KycStatus.PENDING,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingVerification.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating verification:', updateError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Error updating verification',
            error: updateError.message
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'KYC verification updated successfully',
        verificationId: updatedVerification.id,
      });
    }
    
    // Create new verification
    console.log('Creating new verification with data:', {
      user_id: kycData.userId,
      first_name: kycData.firstName,
      last_name: kycData.lastName,
      date_of_birth: kycData.dateOfBirth,
      nationality: kycData.nationality,
      id_type: kycData.idType,
      id_number: kycData.idNumber,
      document_url: kycData.documentUrl || 'No document URL provided',
    });
    
    try {
      const { data: newVerification, error: insertError } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: kycData.userId,
          first_name: kycData.firstName,
          last_name: kycData.lastName,
          date_of_birth: kycData.dateOfBirth,
          nationality: kycData.nationality,
          id_type: kycData.idType as IdType, // Ensure correct type casting
          id_number: kycData.idNumber,
          document_url: kycData.documentUrl || null, // Handle undefined/empty document URL
          status: KycStatus.PENDING,
        })
        .select()
        .single();
    
      if (insertError) {
        console.error('Error creating verification:', insertError);
        console.error('Error details:', JSON.stringify(insertError, null, 2));
        return NextResponse.json(
          { 
            success: false, 
            message: 'Error creating verification',
            error: insertError.message,
            details: insertError
          },
          { status: 500 }
        );
      }
      
      if (!newVerification) {
        console.error('No verification data returned after insert');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Error creating verification: No data returned',
          },
          { status: 500 }
        );
      }
    } catch (insertCatchError) {
      console.error('Exception during verification creation:', insertCatchError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Exception during verification creation',
          error: insertCatchError instanceof Error ? insertCatchError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'KYC verification submitted successfully',
      verificationId: newVerification.id,
    });
    
  } catch (error) {
    console.error('Error processing KYC submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing KYC submission',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
