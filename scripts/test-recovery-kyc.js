// Test script for recovery tokens and KYC verification with Supabase
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
      .from('recovery_tokens')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`Found ${data.length} records in recovery_tokens table`);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Test recovery token registration
async function testRecoveryTokenRegistration() {
  console.log('\nTesting recovery token registration...');
  
  try {
    // Generate test data
    const userId = `user_${Math.random().toString(36).substring(2, 15)}`;
    const pin = '123456';
    const recoveryPhrase = 'test recovery phrase for user registration';
    
    // Generate salt for PIN hashing
    const salt = generateSalt();
    
    // Hash the PIN for secure storage
    const pinHash = hashPin(pin, salt);
    
    // Derive encryption key from PIN
    const encryptionKey = deriveKeyFromPin(pin, salt);
    
    // Encrypt recovery phrase
    const encryptedRecoveryPhrase = encryptData(recoveryPhrase, encryptionKey);
    
    // Store in Supabase
    const { data, error } = await supabase
      .from('recovery_tokens')
      .insert({
        user_id: userId,
        encrypted_recovery_phrase: encryptedRecoveryPhrase,
        pin_hash: pinHash,
        salt
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('❌ Error registering recovery token:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Successfully registered test recovery token!');
    console.log('Token ID:', data.id);
    console.log('User ID:', userId);
    
    return { success: true, userId, pin, recoveryPhrase };
  } catch (error) {
    console.error('❌ Unexpected error during recovery token registration:', error.message);
    return { success: false, error: error.message };
  }
}

// Test PIN authentication
async function testPinAuthentication(userId, pin) {
  console.log('\nTesting PIN authentication...');
  
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('recovery_tokens')
      .select('*')
      .eq('user_id', userId)
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
    
    // Decrypt recovery phrase
    try {
      const recoveryPhrase = decryptData(userData.encrypted_recovery_phrase, encryptionKey);
      console.log('✅ Successfully authenticated with PIN!');
      console.log('Decrypted recovery phrase:', recoveryPhrase);
      
      return { success: true, recoveryPhrase };
    } catch (decryptError) {
      console.error('❌ Error decrypting recovery phrase:', decryptError.message);
      return { success: false, error: 'Error decrypting recovery phrase' };
    }
  } catch (error) {
    console.error('❌ Unexpected error during PIN authentication:', error.message);
    return { success: false, error: error.message };
  }
}

// Test recovery phrase functionality
async function testRecoveryPhraseReset(userId, recoveryPhrase, newPin) {
  console.log('\nTesting recovery phrase reset functionality...');
  
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('recovery_tokens')
      .select('*')
      .eq('user_id', userId)
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
      
      // Re-encrypt with the new key
      const encryptedRecoveryPhrase = encryptData(decryptedRecoveryPhrase, newEncryptionKey);
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('recovery_tokens')
        .update({
          encrypted_recovery_phrase: encryptedRecoveryPhrase,
          pin_hash: newPinHash,
          salt: newSalt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
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

// Test KYC verification with passport and national ID
async function testKycVerification(userId) {
  console.log('\nTesting KYC verification with passport and national ID...');
  
  try {
    // Submit passport KYC verification data
    const passportVerificationData = {
      documentType: 'passport',
      documentNumber: 'AB123456',
      issuingCountry: 'US',
      expiryDate: '2030-01-01',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      documentImageHash: 'abc123def456ghi789', // Hash of the passport image
      selfieImageHash: 'xyz789uvw456mno123', // Hash of the selfie image
      timestamp: new Date().toISOString()
    };
    
    const { data: passportData, error: passportError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        verification_type: 'passport',
        verification_data: passportVerificationData,
        verification_status: 'pending'
      })
      .select('id')
      .single();
    
    if (passportError) {
      console.error('❌ Error submitting passport verification:', passportError.message);
      return { success: false, error: passportError.message };
    }
    
    console.log('✅ Successfully submitted passport verification!');
    console.log('Passport Verification ID:', passportData.id);
    
    // Submit national ID KYC verification data
    const nationalIdVerificationData = {
      documentType: 'nationalId',
      documentNumber: 'ID987654321',
      issuingCountry: 'US',
      expiryDate: '2028-01-01',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US'
      },
      documentImageFrontHash: 'jkl123mno456pqr789', // Hash of the ID front image
      documentImageBackHash: 'stu123vwx456yz789', // Hash of the ID back image
      selfieImageHash: 'abc789def456ghi123', // Hash of the selfie image
      timestamp: new Date().toISOString()
    };
    
    const { data: nationalIdData, error: nationalIdError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        verification_type: 'nationalId',
        verification_data: nationalIdVerificationData,
        verification_status: 'pending'
      })
      .select('id')
      .single();
    
    if (nationalIdError) {
      console.error('❌ Error submitting national ID verification:', nationalIdError.message);
      return { success: false, error: nationalIdError.message };
    }
    
    console.log('✅ Successfully submitted national ID verification!');
    console.log('National ID Verification ID:', nationalIdData.id);
    
    // Get KYC verification status
    const { data: statusData, error: statusError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (statusError) {
      console.error('❌ Error fetching KYC verification status:', statusError.message);
      return { success: false, error: statusError.message };
    }
    
    console.log('✅ Successfully retrieved KYC verification status!');
    console.log(`Found ${statusData.length} KYC verification records for user`);
    
    // Display details of each KYC verification
    statusData.forEach((verification, index) => {
      console.log(`\nKYC Verification #${index + 1}:`);
      console.log('Type:', verification.verification_type);
      console.log('Status:', verification.verification_status);
      console.log('Document Type:', verification.verification_data.documentType);
      console.log('Document Number:', verification.verification_data.documentNumber);
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error during KYC verification:', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('Running recovery token and KYC verification tests...');
  
  // Test database connection
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Database connection failed. Aborting tests.');
    return;
  }
  
  // Test recovery token registration
  const registrationResult = await testRecoveryTokenRegistration();
  if (!registrationResult.success) {
    console.error('❌ Recovery token registration failed. Aborting tests.');
    return;
  }
  
  // Test PIN authentication
  const authResult = await testPinAuthentication(
    registrationResult.userId,
    registrationResult.pin
  );
  if (!authResult.success) {
    console.error('❌ PIN authentication failed. Aborting tests.');
    return;
  }
  
  // Test recovery phrase functionality
  const newPin = '654321';
  const recoveryResult = await testRecoveryPhraseReset(
    registrationResult.userId,
    registrationResult.recoveryPhrase,
    newPin
  );
  if (!recoveryResult.success) {
    console.error('❌ Recovery phrase reset test failed. Aborting tests.');
    return;
  }
  
  // Test KYC verification
  const kycResult = await testKycVerification(registrationResult.userId);
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
