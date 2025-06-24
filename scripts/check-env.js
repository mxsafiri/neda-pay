// Simple script to check if environment variables are loaded correctly
require('dotenv').config({ path: '.env.local' });

console.log('Checking environment variables...');
console.log('------------------------------');

// Check Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log('NEXT_PUBLIC_SUPABASE_URL:');
console.log(`- Set: ${!!supabaseUrl}`);
if (supabaseUrl) {
  console.log(`- Value: ${supabaseUrl}`);
}

// Check Supabase anon key (show first and last few characters only for security)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('\nNEXT_PUBLIC_SUPABASE_ANON_KEY:');
console.log(`- Set: ${!!supabaseAnonKey}`);
if (supabaseAnonKey) {
  const maskedKey = supabaseAnonKey.length > 10 
    ? `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}`
    : '(key too short, might be invalid)';
  console.log(`- Value: ${maskedKey}`);
  console.log(`- Length: ${supabaseAnonKey.length} characters`);
  
  // Check if the key looks like a valid JWT (most Supabase anon keys are JWTs)
  const isLikelyJWT = supabaseAnonKey.split('.').length === 3;
  console.log(`- Looks like JWT: ${isLikelyJWT ? 'Yes' : 'No'}`);
  
  // Check for common issues
  if (supabaseAnonKey.includes('"') || supabaseAnonKey.includes("'")) {
    console.log('⚠️ WARNING: Key contains quotes which should be removed');
  }
  
  if (supabaseAnonKey.includes(' ')) {
    console.log('⚠️ WARNING: Key contains spaces which should be removed');
  }
  
  if (supabaseAnonKey === 'your-supabase-anon-key-here') {
    console.log('⚠️ WARNING: You are using the placeholder key, not a real key');
  }
}

console.log('\nReminder: The anon key should be a long string starting with "ey" and containing two periods.');
console.log('Get this key from your Supabase dashboard: Project Settings > API > Project API keys > anon public');
