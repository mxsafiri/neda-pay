/**
 * Utility functions for generating and validating recovery phrases
 * Used for account recovery when a user forgets their PIN
 * Now integrated with Supabase for secure, cross-device storage
 */

import supabase from '@/lib/supabase';
import { encryptData, decryptData, deriveKeyFromPin, hashPin, generateSalt } from '@/lib/encryption';

// List of common words for recovery phrase generation
// Using a subset of BIP39 wordlist for simplicity
const wordList = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
  'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
  'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
  'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
  'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge',
  'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain'
];

/**
 * Generates a random recovery phrase with the specified number of words
 * @param wordCount Number of words in the recovery phrase (default: 12)
 * @returns A string containing space-separated recovery words
 */
export function generateRecoveryPhrase(wordCount = 12): string {
  const selectedWords: string[] = [];
  
  // Generate random words from the wordlist
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    selectedWords.push(wordList[randomIndex]);
  }
  
  return selectedWords.join(' ');
}



/**
 * Stores the recovery phrase in Supabase database (encrypted)
 * @param userId The user ID associated with the recovery phrase
 * @param recoveryPhrase The recovery phrase to store
 * @param pin The user's PIN for encryption key derivation
 * @returns Promise indicating success or failure
 */
export async function storeRecoveryPhrase(
  userId: string, 
  recoveryPhrase: string, 
  pin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Derive encryption key from PIN and user ID
    const encryptionKey = deriveKeyFromPin(pin, userId);
    
    // Encrypt the recovery phrase
    const encryptedRecoveryPhrase = encryptData(recoveryPhrase, encryptionKey);
    
    // Create a hash of the recovery phrase for validation (without requiring PIN)
    const salt = generateSalt();
    const recoveryPhraseHash = hashPin(recoveryPhrase.toLowerCase().trim(), salt);
    
    // Store in Supabase
    const { error } = await supabase
      .from('recovery_tokens')
      .upsert({
        user_id: userId,
        encrypted_recovery_phrase: encryptedRecoveryPhrase,
        pin_hash: recoveryPhraseHash,
        salt: salt,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error storing recovery phrase:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error storing recovery phrase:', error);
    return { success: false, error: 'Failed to store recovery phrase' };
  }
}

/**
 * Retrieves the stored recovery phrase from Supabase database (decrypted)
 * @param userId The user ID to retrieve the recovery phrase for
 * @param pin The user's PIN for decryption key derivation
 * @returns Promise with the decrypted recovery phrase or null if not found
 */
export async function getStoredRecoveryPhrase(
  userId: string, 
  pin: string
): Promise<{ success: boolean; recoveryPhrase?: string; error?: string }> {
  try {
    // Retrieve encrypted recovery phrase from Supabase
    const { data, error } = await supabase
      .from('recovery_tokens')
      .select('encrypted_recovery_phrase')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving recovery phrase:', error);
      return { success: false, error: 'Recovery phrase not found' };
    }
    
    if (!data?.encrypted_recovery_phrase) {
      return { success: false, error: 'No recovery phrase found for this user' };
    }
    
    // Derive decryption key from PIN and user ID
    const decryptionKey = deriveKeyFromPin(pin, userId);
    
    // Decrypt the recovery phrase
    const decryptedRecoveryPhrase = decryptData(data.encrypted_recovery_phrase, decryptionKey);
    
    return { success: true, recoveryPhrase: decryptedRecoveryPhrase };
  } catch (error) {
    console.error('Unexpected error retrieving recovery phrase:', error);
    return { success: false, error: 'Failed to retrieve recovery phrase' };
  }
}

/**
 * Validates a recovery phrase against the stored hash (without requiring PIN)
 * @param userId The user ID to validate the recovery phrase for
 * @param providedPhrase The phrase provided by the user
 * @returns Promise indicating if the phrase is valid
 */
export async function validateStoredRecoveryPhrase(
  userId: string,
  providedPhrase: string
): Promise<{ success: boolean; isValid?: boolean; error?: string }> {
  try {
    // Retrieve the stored hash and salt from Supabase
    const { data, error } = await supabase
      .from('recovery_tokens')
      .select('pin_hash, salt')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving recovery phrase hash:', error);
      return { success: false, error: 'Recovery phrase not found' };
    }
    
    if (!data?.pin_hash || !data?.salt) {
      return { success: false, error: 'No recovery phrase found for this user' };
    }
    
    // Hash the provided phrase with the stored salt
    const providedPhraseHash = hashPin(providedPhrase.toLowerCase().trim(), data.salt);
    
    // Compare hashes
    const isValid = providedPhraseHash === data.pin_hash;
    
    return { success: true, isValid };
  } catch (error) {
    console.error('Error validating recovery phrase:', error);
    return { success: false, error: 'Failed to validate recovery phrase' };
  }
}

/**
 * Legacy synchronous validation function for backward compatibility
 * @param providedPhrase The phrase provided by the user during recovery
 * @param storedPhrase The phrase stored during account creation
 * @returns Boolean indicating if the phrases match
 */
export function validateRecoveryPhrase(providedPhrase: string, storedPhrase: string): boolean {
  // Normalize both phrases (trim whitespace, convert to lowercase)
  const normalizedProvided = providedPhrase.trim().toLowerCase();
  const normalizedStored = storedPhrase.trim().toLowerCase();
  
  return normalizedProvided === normalizedStored;
}
