/**
 * Utility functions for generating and validating recovery phrases
 * Used for account recovery when a user forgets their PIN
 */

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
 * Validates if a provided phrase matches the stored recovery phrase
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

/**
 * Stores the recovery phrase in local storage (encrypted in a real implementation)
 * @param walletAddress The wallet address associated with the recovery phrase
 * @param recoveryPhrase The recovery phrase to store
 */
export function storeRecoveryPhrase(walletAddress: string, recoveryPhrase: string): void {
  // In a production environment, this should be encrypted
  // For now, we'll store it in local storage with a prefix
  localStorage.setItem(`neda_recovery_${walletAddress}`, recoveryPhrase);
}

/**
 * Retrieves the stored recovery phrase for a wallet address
 * @param walletAddress The wallet address to retrieve the recovery phrase for
 * @returns The stored recovery phrase or null if not found
 */
export function getStoredRecoveryPhrase(walletAddress: string): string | null {
  return localStorage.getItem(`neda_recovery_${walletAddress}`);
}
