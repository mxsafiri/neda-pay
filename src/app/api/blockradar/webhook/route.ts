import { NextRequest, NextResponse } from 'next/server';
import { verifyBlockradarSignature } from '@/lib/blockradar/verify';

/**
 * Webhook handler for Blockradar events
 * This endpoint receives and processes events from Blockradar such as deposits, withdrawals, etc.
 */
export async function POST(req: NextRequest) {
  // Get the raw request body as a string for signature verification
  const rawBody = await req.text();
  const body = JSON.parse(rawBody);
  
  // Get the signature from the headers
  const signature = req.headers.get('x-blockradar-signature');
  
  // If there's no signature, return an error
  if (!signature) {
    console.error('No Blockradar signature found in webhook request');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }
  
  // Verify the webhook signature
  const isValid = verifyBlockradarSignature(rawBody, signature);
  
  if (!isValid) {
    console.error('Invalid Blockradar webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  console.log('Received valid Blockradar webhook:', body.event);
  
  // Process different event types
  try {
    switch (body.event) {
      case 'deposit.pending':
        // Handle pending deposit
        console.log('Pending deposit detected:', body.data);
        // Here you would typically update your database to show a pending transaction
        break;
        
      case 'deposit.confirmed':
        // Handle confirmed deposit
        console.log('Confirmed deposit:', body.data);
        // Update user's balance in database
        // Emit event to connected clients if using real-time updates
        break;
        
      case 'withdrawal.pending':
        // Handle pending withdrawal
        console.log('Pending withdrawal:', body.data);
        break;
        
      case 'withdrawal.confirmed':
        // Handle confirmed withdrawal
        console.log('Confirmed withdrawal:', body.data);
        break;
        
      case 'withdrawal.failed':
        // Handle failed withdrawal
        console.log('Failed withdrawal:', body.data);
        // You might want to notify the user or retry
        break;
        
      case 'address.created':
        // Handle new address creation
        console.log('New address created:', body.data);
        break;
        
      default:
        console.log('Unhandled Blockradar event:', body.event);
    }
    
    // Always return a 200 response so Blockradar knows we received the webhook
    return NextResponse.json({ received: true, event: body.event });
    
  } catch (error) {
    console.error('Error processing Blockradar webhook:', error);
    // Still return 200 to avoid Blockradar retrying the webhook unnecessarily
    // Log the error internally and handle it asynchronously
    return NextResponse.json({ received: true, error: 'Internal processing error' });
  }
}
