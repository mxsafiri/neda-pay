import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';


export async function GET() {
  try {
    console.log('Testing KYC verification creation');
    
    // Generate a test user ID
    const testUserId = `test-user-${Date.now()}`;
    
    // Create a test verification
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'User',
        date_of_birth: '1990-01-01',
        nationality: 'United States',
        id_type: 'passport',
        id_number: 'TEST12345',
        document_url: 'https://example.com/test-document.pdf',
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test verification:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error creating test verification',
          error: error.message,
          details: error
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test verification created successfully',
      verification: data,
    });
    
  } catch (error) {
    console.error('Exception during test verification creation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Exception during test verification creation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
