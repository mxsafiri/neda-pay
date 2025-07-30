/**
 * Paycrest API Integration for NEDApay
 * 
 * Provides USDC cash-out functionality through Paycrest's decentralized routing protocol
 * Enables users to convert USDC to local fiat currencies via bank transfers, mobile money, etc.
 */

// Paycrest API Configuration
export const PAYCREST_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_PAYCREST_API_URL || 'https://api.paycrest.io/v1',
  CLIENT_ID: process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '',
  CLIENT_SECRET: process.env.PAYCREST_CLIENT_SECRET || '', // Server-side only
} as const;

// Supported currencies and tokens
export interface PaycrestCurrency {
  code: string;
  name: string;
  symbol: string;
  country: string;
}

export interface PaycrestToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  network: string;
}

export interface PaycrestInstitution {
  id: string;
  name: string;
  code: string;
  type: 'bank' | 'mobile_money' | 'wallet';
  country: string;
}

// Order interfaces
export interface PaycrestOrderRequest {
  amount: string;
  token: string;
  fiat: string;
  institution_id: string;
  account_number: string;
  account_name: string;
  reference?: string;
  webhook_url?: string;
}

export interface PaycrestOrder {
  id: string;
  amount: string;
  token: string;
  fiat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  institution_id: string;
  account_number: string;
  account_name: string;
  receiving_address: string;
  rate: string;
  fee: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface PaycrestRate {
  token: string;
  fiat: string;
  rate: string;
  amount: string;
  fee: string;
  total: string;
}

// API Error interface
export interface PaycrestError {
  message: string;
  status: string;
  code?: string;
}

// API Response wrapper
export interface PaycrestResponse<T> {
  message: string;
  status: 'success' | 'error';
  data?: T;
  error?: PaycrestError;
}

/**
 * Base API request function
 */
async function paycrestRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PaycrestResponse<T>> {
  const url = `${PAYCREST_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'API-Key': PAYCREST_CONFIG.CLIENT_ID,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Paycrest API Error:', error);
    throw error;
  }
}

/**
 * Get supported fiat currencies
 */
export async function getSupportedCurrencies(): Promise<PaycrestCurrency[]> {
  const response = await paycrestRequest<PaycrestCurrency[]>('/currencies');
  return response.data || [];
}

/**
 * Get supported tokens
 */
export async function getSupportedTokens(): Promise<PaycrestToken[]> {
  const response = await paycrestRequest<PaycrestToken[]>('/tokens');
  return response.data || [];
}

/**
 * Get supported institutions for a currency
 */
export async function getInstitutions(currencyCode: string): Promise<PaycrestInstitution[]> {
  const response = await paycrestRequest<PaycrestInstitution[]>(`/institutions/${currencyCode}`);
  return response.data || [];
}

/**
 * Get exchange rate for token to fiat conversion
 */
export async function getExchangeRate(
  token: string,
  amount: string,
  fiat: string
): Promise<PaycrestRate> {
  const response = await paycrestRequest<PaycrestRate>(`/rates/${token}/${amount}/${fiat}`);
  if (!response.data) {
    throw new Error('Failed to get exchange rate');
  }
  return response.data;
}

/**
 * Verify bank account details
 */
export async function verifyBankAccount(
  institutionId: string,
  accountNumber: string
): Promise<{ valid: boolean; account_name?: string }> {
  const response = await paycrestRequest<{ valid: boolean; account_name?: string }>('/verify-account', {
    method: 'POST',
    body: JSON.stringify({
      institution_id: institutionId,
      account_number: accountNumber,
    }),
  });
  
  if (!response.data) {
    throw new Error('Failed to verify account');
  }
  
  return response.data;
}

/**
 * Create a cash-out order
 */
export async function createCashOutOrder(orderData: PaycrestOrderRequest): Promise<PaycrestOrder> {
  const response = await paycrestRequest<PaycrestOrder>('/sender/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

  if (!response.data) {
    throw new Error('Failed to create cash-out order');
  }

  return response.data;
}

/**
 * Get order details by ID
 */
export async function getOrderDetails(orderId: string): Promise<PaycrestOrder> {
  const response = await paycrestRequest<PaycrestOrder>(`/sender/orders/${orderId}`);
  
  if (!response.data) {
    throw new Error('Failed to get order details');
  }
  
  return response.data;
}

/**
 * Get user's cash-out orders with filtering
 */
export async function getCashOutOrders(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PaycrestOrder[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const endpoint = `/sender/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await paycrestRequest<PaycrestOrder[]>(endpoint);
  
  return response.data || [];
}

/**
 * Get sender statistics
 */
export async function getSenderStats(): Promise<{
  total_orders: number;
  completed_orders: number;
  total_volume: string;
  success_rate: string;
}> {
  const response = await paycrestRequest<{
    total_orders: number;
    completed_orders: number;
    total_volume: string;
    success_rate: string;
  }>('/sender/stats');
  
  if (!response.data) {
    throw new Error('Failed to get sender stats');
  }
  
  return response.data;
}

/**
 * Format currency amount for display
 */
export function formatCurrencyAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Validate Paycrest configuration
 */
export function validatePaycrestConfig(): boolean {
  if (!PAYCREST_CONFIG.CLIENT_ID) {
    console.error('Paycrest Client ID is not configured');
    return false;
  }
  return true;
}

/**
 * Get order status color for UI
 */
export function getOrderStatusColor(status: PaycrestOrder['status']): string {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'processing':
      return 'text-blue-600';
    case 'pending':
      return 'text-yellow-600';
    case 'failed':
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get order status badge color for UI
 */
export function getOrderStatusBadge(status: PaycrestOrder['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
