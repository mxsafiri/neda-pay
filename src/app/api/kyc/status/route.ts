import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapKycRecordToVerification } from '@/types/kyc';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }
    
    // Fetch KYC verification for the user
    const { data: verification, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no verification found, return empty result
      if (error.code === 'PGRST116') { // PGRST116 is "no rows returned" error
        return NextResponse.json({
          success: true,
          message: 'No KYC verification found for this user',
          verification: null
        });
      }
      
      console.error('Error fetching KYC verification:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error fetching KYC verification',
          error: error.message
        },
        { status: 500 }
      );
    }
    
    // Map the database record to our frontend model
    const mappedVerification = mapKycRecordToVerification(verification);
    
    return NextResponse.json({
      success: true,
      message: 'KYC verification retrieved successfully',
      verification: mappedVerification
    });
    
  } catch (error) {
    console.error('Error retrieving KYC status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error retrieving KYC status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
