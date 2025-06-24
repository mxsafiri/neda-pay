import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Get Supabase URL and anon key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if the environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: 'Missing Supabase environment variables',
        error: 'NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY not set',
      }, { status: 500 });
    }
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test a simple query to verify connection
    const { data: tables, error: tablesError } = await supabase
      .from('User')
      .select('id, email, firstName, lastName')
      .limit(10);
    
    if (tablesError) {
      throw tablesError;
    }
    
    // Create a test user if none exists
    if (!tables || tables.length === 0) {
      const { data: newUser, error: createError } = await supabase
        .from('User')
        .upsert({
          id: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select();
      
      if (createError) {
        throw createError;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection and CRUD tests completed successfully',
      diagnostics: {
        supabaseUrlSet: !!supabaseUrl,
        supabaseAnonKeySet: !!supabaseAnonKey
      },
      results: {
        users: tables
      },
      connectionStatus: 'Connected to Supabase database successfully',
    });
  } catch (error) {
    console.error('Supabase test error:', error);
    
    // Extract more detailed error information
    let errorDetails = {};
    if (error && typeof error === 'object') {
      errorDetails = {
        name: error.name,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      };
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to Supabase or perform operations',
      error: error instanceof Error ? error.message : String(error),
      errorDetails,
      supabaseConfig: {
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' // Show partial URL for debugging
      }
    }, { status: 500 });
  }
}
