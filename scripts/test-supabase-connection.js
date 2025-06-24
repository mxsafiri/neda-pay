// Simple script to test Supabase connection using the JavaScript client
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  // Get Supabase URL and anon key from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment variables:');
  console.log(`- NEXT_PUBLIC_SUPABASE_URL set: ${!!supabaseUrl}`);
  console.log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY set: ${!!supabaseAnonKey}`);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Supabase environment variables are not set!');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
    process.exit(1);
  }
  
  try {
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('Connecting to Supabase...');
    
    // Test a simple query to verify connection
    const { data, error } = await supabase
      .from('User')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Data:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Supabase connection failed:');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Run the test
testSupabaseConnection()
  .then(result => {
    if (result.success) {
      console.log('✅ All tests passed!');
    } else {
      console.error('❌ Tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
