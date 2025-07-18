// Script to apply SQL migration to Supabase
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Supabase environment variables are not set!');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Path to the migration file
const migrationFilePath = path.join(__dirname, '..', 'migrations', 'create_wallet_tables.sql');

// Read the migration file
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

// Split the SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

// Function to execute a single SQL statement
async function executeStatement(statement) {
  console.log(`Executing SQL statement: ${statement.substring(0, 50)}...`);
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: statement });
    
    if (error) {
      console.error(`Error executing statement: ${error.message}`);
      return false;
    }
    
    console.log('Statement executed successfully');
    return true;
  } catch (err) {
    console.error(`Unexpected error: ${err.message}`);
    return false;
  }
}

// Function to enable the pgcrypto extension (required for uuid_generate_v4())
async function enablePgcrypto() {
  console.log('Enabling pgcrypto extension...');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'CREATE EXTENSION IF NOT EXISTS pgcrypto;' });
    
    if (error) {
      console.error(`Error enabling pgcrypto: ${error.message}`);
      return false;
    }
    
    console.log('pgcrypto extension enabled successfully');
    return true;
  } catch (err) {
    console.error(`Unexpected error: ${err.message}`);
    return false;
  }
}

// Function to apply the migration
async function applyMigration() {
  console.log('Applying migration...');
  
  // Enable pgcrypto extension first
  const pgcryptoEnabled = await enablePgcrypto();
  if (!pgcryptoEnabled) {
    console.error('Failed to enable pgcrypto extension. Aborting migration.');
    return;
  }
  
  // Execute each statement
  let successCount = 0;
  let failureCount = 0;
  
  for (const statement of statements) {
    const success = await executeStatement(statement);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log(`Migration complete. ${successCount} statements succeeded, ${failureCount} statements failed.`);
}

// Run the migration
applyMigration()
  .catch(error => {
    console.error('Unexpected error during migration:', error);
    process.exit(1);
  });
