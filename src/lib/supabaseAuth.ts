/**
 * Supabase authentication service for hybrid authentication approach
 * - Client-side PIN verification for quick access
 * - Server-side encrypted wallet and recovery phrase storage
 */
import supabase from './supabase';
import { encryptData, decryptData, hashPin, generateSalt, verifyPin, deriveKeyFromPin } from './encryption';

export interface WalletUser {
  id: string;
  wallet_address: string;
  encrypted_wallet_data: string;
  encrypted_recovery_phrase: string;
  pin_hash: string;
  salt: string;
  created_at: string;
  updated_at: string;
}

export interface WalletDevice {
  id: string;
  wallet_address: string;
  device_token: string;
  device_name?: string;
  last_active: string;
  created_at: string;
}

export interface KycVerification {
  id: string;
  wallet_address: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_type: string;
  verification_data: Record<string, any>;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Register a new wallet user with Supabase
 */
export async function registerWalletUser(
  walletAddress: string,
  walletData: string,
  recoveryPhrase: string,
  pin: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Generate salt for PIN hashing
    const salt = generateSalt();
    
    // Hash the PIN for secure storage
    const pinHash = hashPin(pin, salt);
    
    // Derive encryption key from PIN
    const encryptionKey = deriveKeyFromPin(pin, salt);
    
    // Encrypt wallet data and recovery phrase
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
      console.error('Error registering wallet user:', error);
      return { success: false, error: error.message };
    }
    
    // Register device token
    const deviceToken = generateDeviceToken();
    await registerDevice(walletAddress, deviceToken);
    
    // Store device token in local storage for future authentication
    localStorage.setItem('deviceToken', deviceToken);
    
    return { success: true, userId: data.id };
  } catch (error) {
    console.error('Unexpected error registering wallet user:', error);
    return { success: false, error: 'Unexpected error registering wallet user' };
  }
}

/**
 * Authenticate a wallet user with PIN
 */
export async function authenticateWithPin(
  walletAddress: string,
  pin: string
): Promise<{ success: boolean; error?: string; walletData?: string }> {
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('wallet_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return { success: false, error: 'User not found' };
    }
    
    // Verify PIN
    const isPinValid = verifyPin(pin, userData.pin_hash, userData.salt);
    
    if (!isPinValid) {
      return { success: false, error: 'Invalid PIN' };
    }
    
    // Derive encryption key from PIN
    const encryptionKey = deriveKeyFromPin(pin, userData.salt);
    
    // Decrypt wallet data
    const walletData = decryptData(userData.encrypted_wallet_data, encryptionKey);
    
    // Update device last active timestamp
    const deviceToken = localStorage.getItem('deviceToken');
    if (deviceToken) {
      await updateDeviceLastActive(walletAddress, deviceToken);
    }
    
    return { success: true, walletData };
  } catch (error) {
    console.error('Unexpected error authenticating user:', error);
    return { success: false, error: 'Unexpected error authenticating user' };
  }
}

/**
 * Reset PIN using recovery phrase
 */
export async function resetPinWithRecoveryPhrase(
  walletAddress: string,
  recoveryPhrase: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('wallet_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return { success: false, error: 'User not found' };
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
      // This verifies that the recovery phrase is correct
      const decryptedRecoveryPhrase = decryptData(userData.encrypted_recovery_phrase, oldEncryptionKey);
      
      // If decryption succeeds, the recovery phrase is correct
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
        console.error('Error updating user data:', updateError);
        return { success: false, error: updateError.message };
      }
      
      return { success: true };
    } catch (decryptError) {
      console.error('Error decrypting data:', decryptError);
      return { success: false, error: 'Invalid recovery phrase' };
    }
  } catch (error) {
    console.error('Unexpected error resetting PIN:', error);
    return { success: false, error: 'Unexpected error resetting PIN' };
  }
}

/**
 * Generate a random device token
 */
function generateDeviceToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Register a new device for a wallet user
 */
async function registerDevice(
  walletAddress: string,
  deviceToken: string,
  deviceName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('wallet_devices')
      .insert({
        wallet_address: walletAddress,
        device_token: deviceToken,
        device_name: deviceName || 'Unknown Device'
      });
    
    if (error) {
      console.error('Error registering device:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error registering device:', error);
    return { success: false, error: 'Unexpected error registering device' };
  }
}

/**
 * Update device last active timestamp
 */
async function updateDeviceLastActive(
  walletAddress: string,
  deviceToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('wallet_devices')
      .update({
        last_active: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .eq('device_token', deviceToken);
    
    if (error) {
      console.error('Error updating device last active:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating device last active:', error);
    return { success: false, error: 'Unexpected error updating device last active' };
  }
}

/**
 * Get all devices for a wallet user
 */
export async function getDevices(
  walletAddress: string
): Promise<{ success: boolean; error?: string; devices?: WalletDevice[] }> {
  try {
    const { data, error } = await supabase
      .from('wallet_devices')
      .select('*')
      .eq('wallet_address', walletAddress);
    
    if (error) {
      console.error('Error fetching devices:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, devices: data as WalletDevice[] };
  } catch (error) {
    console.error('Unexpected error fetching devices:', error);
    return { success: false, error: 'Unexpected error fetching devices' };
  }
}

/**
 * Submit KYC verification data
 */
export async function submitKycVerification(
  walletAddress: string,
  verificationType: string,
  verificationData: Record<string, any>
): Promise<{ success: boolean; error?: string; verificationId?: string }> {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({
        wallet_address: walletAddress,
        verification_type: verificationType,
        verification_data: verificationData
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error submitting KYC verification:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, verificationId: data.id };
  } catch (error) {
    console.error('Unexpected error submitting KYC verification:', error);
    return { success: false, error: 'Unexpected error submitting KYC verification' };
  }
}

/**
 * Get KYC verification status
 */
export async function getKycVerificationStatus(
  walletAddress: string
): Promise<{ success: boolean; error?: string; verification?: KycVerification }> {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching KYC verification status:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, verification: data as KycVerification };
  } catch (error) {
    console.error('Unexpected error fetching KYC verification status:', error);
    return { success: false, error: 'Unexpected error fetching KYC verification status' };
  }
}
