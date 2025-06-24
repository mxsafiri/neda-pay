/**
 * Utility to verify Blockradar webhook signatures
 */
import crypto from 'crypto';

/**
 * Verifies that a webhook event came from Blockradar by checking the signature
 * 
 * @param payload The raw request body as a string
 * @param signature The signature provided in the x-blockradar-signature header
 * @returns Boolean indicating if signature is valid
 */
export function verifyBlockradarSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.BLOCKRADAR_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('BLOCKRADAR_WEBHOOK_SECRET is not defined in environment variables');
    return false;
  }

  try {
    // Create HMAC using the secret
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    
    // Get the computed signature
    const computedSignature = hmac.digest('hex');
    
    // Compare signatures using a timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error verifying Blockradar signature:', error);
    return false;
  }
}
