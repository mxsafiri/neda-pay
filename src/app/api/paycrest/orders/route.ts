import { NextRequest, NextResponse } from 'next/server'

const PAYCREST_API_URL = process.env.NEXT_PUBLIC_PAYCREST_API_URL || 'https://api.paycrest.io'
const PAYCREST_BASE_URL = PAYCREST_API_URL.endsWith('/v1') ? PAYCREST_API_URL : `${PAYCREST_API_URL}/v1`
const PAYCREST_CLIENT_ID = process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID
const PAYCREST_CLIENT_SECRET = process.env.PAYCREST_CLIENT_SECRET

interface PaymentOrderRequest {
  amount: number
  token: string
  rate: number
  network: string
  recipient: {
    institution: string
    accountIdentifier: string
    accountName: string
    memo: string
    currency: string
    providerId: string
  }
  reference: string
  returnAddress: string
}

export async function POST(request: NextRequest) {
  try {
    if (!PAYCREST_CLIENT_ID || !PAYCREST_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Paycrest API not configured' },
        { status: 500 }
      )
    }

    const body: PaymentOrderRequest = await request.json()
    console.log('Creating Paycrest payment order:', body)

    const response = await fetch(`${PAYCREST_BASE_URL}/sender/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': PAYCREST_CLIENT_ID,
        'Authorization': `Bearer ${PAYCREST_CLIENT_SECRET}`,
      },
      body: JSON.stringify(body)
    })

    console.log('Paycrest payment order response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Paycrest payment order error:', errorText)
      
      return NextResponse.json(
        { 
          error: 'Failed to create payment order',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Paycrest payment order created:', data)

    return NextResponse.json({
      status: 'success',
      message: 'Payment order created successfully',
      data: data.data || data
    })

  } catch (error) {
    console.error('Payment order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
