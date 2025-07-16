/**
 * Device Authentication Utilities
 * Provides functions for secure device-based authentication
 */

import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Storage keys
const DEVICE_TOKEN_KEY = 'neda_device_token';
const WALLET_AUTH_KEY = 'neda_wallet_auth';
const SESSION_KEY = 'neda_session';

// Session timeout in milliseconds (default: 30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Generate a new secure device token
 * @returns A unique device token
 */
export const generateDeviceToken = (): string => {
  return uuidv4();
};

/**
 * Store device token in local storage
 * @param deviceToken The device token to store
 */
export const storeDeviceToken = (deviceToken: string): void => {
  localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken);
};

/**
 * Get the stored device token
 * @returns The stored device token or null if not found
 */
export const getDeviceToken = (): string | null => {
  return localStorage.getItem(DEVICE_TOKEN_KEY);
};

/**
 * Hash a PIN/password for secure storage
 * @param pin The PIN or password to hash
 * @param salt Optional salt (defaults to device token)
 * @returns Hashed PIN
 */
export const hashPin = (pin: string, salt?: string): string => {
  const deviceToken = salt || getDeviceToken() || 'default-salt';
  return CryptoJS.SHA256(pin + deviceToken).toString();
};

/**
 * Store wallet authentication data
 * @param address Wallet address
 * @param hashedPin Hashed PIN
 * @param deviceToken Device token
 */
export const storeWalletAuth = (
  address: string,
  hashedPin: string,
  deviceToken: string
): void => {
  const authData = {
    address,
    hashedPin,
    deviceToken,
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(WALLET_AUTH_KEY, JSON.stringify(authData));
};

/**
 * Get stored wallet authentication data
 * @returns Wallet authentication data or null if not found
 */
export const getWalletAuth = () => {
  const authData = localStorage.getItem(WALLET_AUTH_KEY);
  if (!authData) return null;
  
  try {
    return JSON.parse(authData);
  } catch (error) {
    console.error('Failed to parse wallet auth data:', error);
    return null;
  }
};

/**
 * Verify PIN against stored hashed PIN
 * @param pin PIN to verify
 * @returns True if PIN is valid
 */
export const verifyPin = (pin: string): boolean => {
  const authData = getWalletAuth();
  if (!authData) return false;
  
  const hashedInputPin = hashPin(pin);
  return hashedInputPin === authData.hashedPin;
};

/**
 * Verify device token against stored token
 * @returns True if device token is valid
 */
export const verifyDeviceToken = (): boolean => {
  const storedToken = getDeviceToken();
  const authData = getWalletAuth();
  
  if (!storedToken || !authData) return false;
  return storedToken === authData.deviceToken;
};

/**
 * Complete authentication check
 * @param pin PIN to verify
 * @returns True if both PIN and device token are valid
 */
export const authenticate = (pin: string): boolean => {
  return verifyDeviceToken() && verifyPin(pin);
};

/**
 * Generate a recovery token for new device authentication
 * @param address Wallet address
 * @returns Recovery token
 */
export const generateRecoveryToken = (address: string): string => {
  const deviceToken = getDeviceToken();
  if (!deviceToken) {
    throw new Error('No device token found');
  }
  
  // Generate a recovery token based on wallet address and device token
  return CryptoJS.SHA256(address + deviceToken).toString();
};

/**
 * Create a new session
 * Stores the session start time in local storage
 */
export const createSession = (): void => {
  const sessionData = {
    startTime: Date.now(),
    lastActivity: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

/**
 * Update the last activity timestamp for the session
 */
export const updateSessionActivity = (): void => {
  const sessionData = getSessionData();
  if (sessionData) {
    sessionData.lastActivity = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } else {
    createSession();
  }
};

/**
 * Get the current session data
 * @returns Session data or null if no session exists
 */
export const getSessionData = (): { startTime: number; lastActivity: number } | null => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch (err) {
    console.error('Failed to parse session data:', err);
    return null;
  }
};

/**
 * Check if the session has timed out
 * @returns True if the session has timed out or doesn't exist
 */
export const isSessionTimedOut = (): boolean => {
  const sessionData = getSessionData();
  if (!sessionData) return true;
  
  const now = Date.now();
  return now - sessionData.lastActivity > SESSION_TIMEOUT;
};

/**
 * Clear the current session
 */
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
