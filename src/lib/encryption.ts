/**
 * Encryption utilities for secure data storage in Supabase
 */
import CryptoJS from 'crypto-js';

/**
 * Encrypts data with a password
 * @param data - Data to encrypt
 * @param password - Password to encrypt with
 * @returns Encrypted data string
 */
export function encryptData(data: string, password: string): string {
  return CryptoJS.AES.encrypt(data, password).toString();
}

/**
 * Decrypts data with a password
 * @param encryptedData - Encrypted data string
 * @param password - Password to decrypt with
 * @returns Decrypted data string
 */
export function decryptData(encryptedData: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Generates a hash of the PIN for secure storage
 * @param pin - PIN to hash
 * @param salt - Salt for the hash
 * @returns Hashed PIN
 */
export function hashPin(pin: string, salt: string): string {
  return CryptoJS.SHA256(pin + salt).toString();
}

/**
 * Generates a random salt for PIN hashing
 * @returns Random salt string
 */
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Verifies a PIN against a stored hash
 * @param pin - PIN to verify
 * @param storedHash - Stored hash to verify against
 * @param salt - Salt used for hashing
 * @returns Whether the PIN is valid
 */
export function verifyPin(pin: string, storedHash: string, salt: string): boolean {
  const hashedPin = hashPin(pin, salt);
  return hashedPin === storedHash;
}

/**
 * Derives an encryption key from a PIN
 * @param pin - PIN to derive key from
 * @param salt - Salt for key derivation
 * @returns Derived encryption key
 */
export function deriveKeyFromPin(pin: string, salt: string): string {
  return CryptoJS.PBKDF2(pin, salt, { keySize: 256/32, iterations: 1000 }).toString();
}
