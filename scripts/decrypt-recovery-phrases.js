/**
 * Utility script to decrypt recovery phrases from Supabase database
 * Usage: node scripts/decrypt-recovery-phrases.js
 * 
 * This script helps administrators view decrypted recovery phrases when needed
 * for support or debugging purposes.
 */

const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Derives an encryption key from a PIN and salt
 */
function deriveKeyFromPin(pin, salt) {
  return CryptoJS.PBKDF2(pin, salt, { keySize: 256/32, iterations: 1000 }).toString();
}

/**
 * Decrypts data with a password
 */
function decryptData(encryptedData, password) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Decrypt a recovery phrase for a specific wallet address
 */
async function decryptRecoveryPhrase(walletAddress, userPin) {
  try {
    console.log(`🔍 Looking up wallet: ${walletAddress}`);
    
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('wallet_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (userError || !userData) {
      console.error('❌ User not found:', userError?.message || 'No data returned');
      return null;
    }
    
    console.log('✅ User found in database');
    
    // Derive encryption key from PIN and salt
    const encryptionKey = deriveKeyFromPin(userPin, userData.salt);
    
    // Decrypt the recovery phrase
    const decryptedRecoveryPhrase = decryptData(userData.encrypted_recovery_phrase, encryptionKey);
    
    if (!decryptedRecoveryPhrase) {
      console.error('❌ Failed to decrypt recovery phrase - incorrect PIN?');
      return null;
    }
    
    console.log('✅ Recovery phrase decrypted successfully');
    return decryptedRecoveryPhrase;
    
  } catch (error) {
    console.error('❌ Error decrypting recovery phrase:', error.message);
    return null;
  }
}

/**
 * List all wallet addresses in the database
 */
async function listWalletAddresses() {
  try {
    const { data: users, error } = await supabase
      .from('wallet_users')
      .select('wallet_address, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching wallet addresses:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('📭 No wallet addresses found in database');
      return;
    }
    
    console.log(`\n📋 Found ${users.length} wallet address(es):`);
    console.log('─'.repeat(60));
    
    users.forEach((user, index) => {
      const date = new Date(user.created_at).toLocaleDateString();
      console.log(`${index + 1}. ${user.wallet_address} (Created: ${date})`);
    });
    
    console.log('─'.repeat(60));
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

/**
 * Interactive CLI for decrypting recovery phrases
 */
async function main() {
  console.log('🔐 NEDApay Recovery Phrase Decryption Utility');
  console.log('═'.repeat(50));
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n📖 Usage Options:');
    console.log('1. List all wallet addresses:');
    console.log('   node scripts/decrypt-recovery-phrases.js list');
    console.log('\n2. Decrypt recovery phrase:');
    console.log('   node scripts/decrypt-recovery-phrases.js decrypt <wallet_address> <pin>');
    console.log('\n📝 Examples:');
    console.log('   node scripts/decrypt-recovery-phrases.js list');
    console.log('   node scripts/decrypt-recovery-phrases.js decrypt 0x123...abc 123456');
    return;
  }
  
  const command = args[0];
  
  if (command === 'list') {
    await listWalletAddresses();
  } else if (command === 'decrypt') {
    if (args.length < 3) {
      console.error('❌ Missing arguments for decrypt command');
      console.log('Usage: node scripts/decrypt-recovery-phrases.js decrypt <wallet_address> <pin>');
      return;
    }
    
    const walletAddress = args[1];
    const userPin = args[2];
    
    console.log('\n🔓 Attempting to decrypt recovery phrase...');
    
    const recoveryPhrase = await decryptRecoveryPhrase(walletAddress, userPin);
    
    if (recoveryPhrase) {
      console.log('\n🎉 SUCCESS! Decrypted Recovery Phrase:');
      console.log('═'.repeat(50));
      console.log(`📝 ${recoveryPhrase}`);
      console.log('═'.repeat(50));
      console.log('\n⚠️  SECURITY WARNING:');
      console.log('• Keep this recovery phrase secure and confidential');
      console.log('• Do not share or store in plain text');
      console.log('• This phrase can restore the entire wallet');
    } else {
      console.log('\n❌ Failed to decrypt recovery phrase');
      console.log('• Check that the wallet address exists');
      console.log('• Verify the PIN is correct');
      console.log('• Ensure database connection is working');
    }
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('Available commands: list, decrypt');
  }
}

// Run the script
main().catch(console.error);
