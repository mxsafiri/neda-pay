import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SwapTransaction } from '@/hooks/useTokenSwap';

// Define request schema
const historyRequestSchema = z.object({
  userId: z.string(),
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Validate request parameters
    const result = historyRequestSchema.safeParse({
      userId,
      limit,
      offset,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Connect to a database
    // 2. Query for the user's swap history
    // 3. Return the results
    
    // For now, we'll return mock data
    const mockTransactions: SwapTransaction[] = [
      {
        id: 'swap-1687452321-123',
        fromToken: 'USDC',
        toToken: 'nTZS',
        inputAmount: 50,
        outputAmount: 125000,
        fee: 0.15,
        rate: 2500,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'completed',
      },
      {
        id: 'swap-1687365921-456',
        fromToken: 'nTZS',
        toToken: 'USDT',
        inputAmount: 10000,
        outputAmount: 4,
        fee: 0.03,
        rate: 0.0004,
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'completed',
      },
      {
        id: 'swap-1687279521-789',
        fromToken: 'USDT',
        toToken: 'EURC',
        inputAmount: 100,
        outputAmount: 92.1,
        fee: 0.3,
        rate: 0.921,
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: 'completed',
      },
    ];
    
    // Filter by userId in a real implementation
    // Here we just return the mock data
    
    return NextResponse.json({
      success: true,
      transactions: mockTransactions.slice(offset, offset + limit),
      total: mockTransactions.length,
    });
    
  } catch (error) {
    console.error('Error fetching swap history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swap history', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
