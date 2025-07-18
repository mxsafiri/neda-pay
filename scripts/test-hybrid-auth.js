// Test script for hybrid authentication with Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');

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

// Utility functions for testing
function generateSalt() {
  return CryptoJS.lib.WordArray.random(16).toString();
}

function hashPin(pin, salt) {
  return CryptoJS.SHA256(pin + salt).toString();
}

function encryptData(data, password) {
  return CryptoJS.AES.encrypt(data, password).toString();
}

function decryptData(encryptedData, password) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function deriveKeyFromPin(pin, salt) {
  return CryptoJS.PBKDF2(pin, salt, { keySize: 256/32, iterations: 1000 }).toString();
}

// Test database connection and schema
async function testDatabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test a simple query to verify connection
    const { data, error } = await supabase
      .from('wallet_users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error.message);
      
      // Check if the table exists
      console.log('Checking if wallet_users table exists...');
      const { error: tableError } = await supabase.rpc('check_table_exists', { table_name: 'wallet_users' });
      
      if (tableError) {
        console.error('❌ Table check error:', tableError.message);
        console.log('You may need to run the SQL migration script to create the necessary tables.');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`Found ${data.length} records in wallet_users table`);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Test wallet registration
async function testWalletRegistration() {
  console.log('\nTesting wallet registration...');
  
  try {
    // Generate test data
    const walletAddress = `0x${Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const pin = '123456';
    const recoveryPhrase = 'test recovery phrase for wallet registration';
    
    // Generate salt for PIN hashing
    const salt = generateSalt();
    
    // Hash the PIN for secure storage
    const pinHash = hashPin(pin, salt);
    
    // Derive encryption key from PIN
    const encryptionKey = deriveKeyFromPin(pin, salt);
    
    // Encrypt wallet data and recovery phrase
    const walletData = JSON.stringify({
      address: walletAddress,
      createdAt: new Date().toISOString()
    });
    
    const encryptedWalletData = encryptData(walletData, encryptionKey);
    const encryptedRecoveryPhrase = encryptData(recoveryPhrase, encryptionKey);
    
    // Store in Supabase
    const { data, error } = await supabase
      .from('wallet_users')
      .insert({
        wallet_address: walletAddress,
        encrypted_wallet_data: encryptedWalletData,
        encrypted_recovery_phrase: encryptedRecoveryPhrase,
        pin_hash: pinHash,
        salt
      })
      .select('id')
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        console.log('⚠️ Test wallet already exists (unique constraint violation)');
        return { success: true, walletAddress, pin, recoveryPhrase };
      }
      
      console.error('❌ Error registering wallet user:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Successfully registered test wallet!');
    console.log('Wallet ID:', data.id);
    console.log('Wallet Address:', walletAddress);
    
    return { success: true, walletAddress, pin, recoveryPhrase };
  } catch (error) {
    console.error('❌ Unexpected error during wallet registration:', error.message);
    return { success: false, error: error.message };
  }
}

// Test wallet authentication
async function testWalletAuthentication(walletAddress, pin) {
  console.log('\nTesting wallet authentication...');
  
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('wallet_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (userError) {
      console.error('❌ Error fetching user data:', userError.message);
      return { success: false, error: userError.message };
    }
    
    // Verify PIN
    const hashedPin = hashPin(pin, userData.salt);
    const isPinValid = hashedPin === userData.pin_hash;
    
    if (!isPinValid) {
      console.error('❌ Invalid PIN');
      return { success: false, error: 'Invalid PIN' };
    }
    
    // Derive encryption key from PIN
    const encryptionKey = deriveKeyFromPin(pin, userData.salt);
    
    // Decrypt wallet data
    try {
      const walletData = decryptData(userData.encrypted_wallet_data, encryptionKey);
      console.log('✅ Successfully authenticated wallet!');
      console.log('Decrypted wallet data:', walletData);
      
      return { success: true, walletData };
    } catch (decryptError) {
      console.error('❌ Error decrypting wallet data:', decryptError.message);
      return { success: false, error: 'Error decrypting wallet data' };
    }
  } catch (error) {
    console.error('❌ Unexpected error during wallet authentication:', error.message);
    return { success: false, error: error.message };
  }
}

// Test recovery phrase functionality
async function testRecoveryPhrase(walletAddress, recoveryPhrase, newPin) {
  console.log('\nTesting recovery phrase functionality...');
  
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('wallet_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (userError) {
      console.error('❌ Error fetching user data:', userError.message);
      return { success: false, error: userError.message };
    }
    
    // Generate new salt for PIN hashing
    const newSalt = generateSalt();
    
    // Hash the new PIN for secure storage
    const newPinHash = hashPin(newPin, newSalt);
    
    // Derive encryption keys
    const oldEncryptionKey = deriveKeyFromPin(recoveryPhrase, userData.salt);
    const newEncryptionKey = deriveKeyFromPin(newPin, newSalt);
    
    try {
      // Try to decrypt the recovery phrase with the provided recovery phrase
      const decryptedRecoveryPhrase = decryptData(userData.encrypted_recovery_phrase, oldEncryptionKey);
      
      // If decryption succeeds, the recovery phrase is correct
      console.log('✅ Recovery phrase verified successfully!');
      
      // Now decrypt the wallet data with the old key
      const walletData = decryptData(userData.encrypted_wallet_data, oldEncryptionKey);
      
      // Re-encrypt with the new key
      const encryptedWalletData = encryptData(walletData, newEncryptionKey);
      const encryptedRecoveryPhrase = encryptData(decryptedRecoveryPhrase, newEncryptionKey);
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('wallet_users')
        .update({
          encrypted_wallet_data: encryptedWalletData,
          encrypted_recovery_phrase: encryptedRecoveryPhrase,
          pin_hash: newPinHash,
          salt: newSalt,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);
      
      if (updateError) {
        console.error('❌ Error updating user data:', updateError.message);
        return { success: false, error: updateError.message };
      }
      
      console.log('✅ Successfully reset PIN using recovery phrase!');
      return { success: true };
    } catch (decryptError) {
      console.error('❌ Error decrypting data:', decryptError.message);
      return { success: false, error: 'Invalid recovery phrase' };
    }
  } catch (error) {
    console.error('❌ Unexpected error during recovery:', error.message);
    return { success: false, error: error.message };
  }
}

// Test KYC verification
async function testKycVerification(walletAddress) {
  console.log('\nTesting KYC verification...');
  
  try {
    // Submit KYC verification data
    const verificationData = {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      idNumber: 'TEST123456',
      country: 'US',
      timestamp: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({
        wallet_address: walletAddress,
        verification_type: 'identity',
        verification_data: verificationData,
        verification_status: 'pending'
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('❌ Error submitting KYC verification:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Successfully submitted KYC verification!');
    console.log('Verification ID:', data.id);
    
    // Get KYC verification status
    const { data: statusData, error: statusError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (statusError) {
      console.error('❌ Error fetching KYC verification status:', statusError.message);
      return { success: false, error: statusError.message };
    }
    
    console.log('✅ Successfully retrieved KYC verification status!');
    console.log('Status:', statusData.verification_status);
    console.log('Type:', statusData.verification_type);
    console.log('Data:', statusData.verification_data);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error during KYC verification:', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('Running hybrid authentication tests...');
  
  // Test database connection
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Database connection failed. Aborting tests.');
    return;
  }
  
  // Test wallet registration
  const registrationResult = await testWalletRegistration();
  if (!registrationResult.success) {
    console.error('❌ Wallet registration failed. Aborting tests.');
    return;
  }
  
  // Test wallet authentication
  const authResult = await testWalletAuthentication(
    registrationResult.walletAddress,
    registrationResult.pin
  );
  if (!authResult.success) {
    console.error('❌ Wallet authentication failed. Aborting tests.');
    return;
  }
  
  // Test recovery phrase functionality
  const newPin = '654321';
  const recoveryResult = await testRecoveryPhrase(
    registrationResult.walletAddress,
    registrationResult.recoveryPhrase,
    newPin
  );
  if (!recoveryResult.success) {
    console.error('❌ Recovery phrase test failed. Aborting tests.');
    return;
  }
  
  // Test KYC verification
  const kycResult = await testKycVerification(registrationResult.walletAddress);
  if (!kycResult.success) {
    console.error('❌ KYC verification test failed.');
    return;
  }
  
  console.log('\n✅ All tests passed successfully!');
}

// Run the tests
runTests()
  .catch(error => {
    console.error('Unexpected error during tests:', error);
    process.exit(1);
  });
