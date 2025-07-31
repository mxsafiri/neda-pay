import { NextRequest, NextResponse } from 'next/server'

const PAYCREST_API_URL = process.env.NEXT_PUBLIC_PAYCREST_API_URL || 'https://api.paycrest.io/v1'
const PAYCREST_CLIENT_ID = process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || ''

export async function GET() {
  try {
    if (!PAYCREST_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Paycrest API not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${PAYCREST_API_URL}/currencies`, {
      headers: {
        'Content-Type': 'application/json',
        'API-Key': PAYCREST_CLIENT_ID,
      },
    })

    if (!response.ok) {
      // If the API endpoint doesn't exist, return fallback data
      if (response.status === 404) {
        const fallbackCurrencies = [
          {
            code: 'TZS',
            name: 'Tanzanian Shilling',
            symbol: 'TZS',
            country: 'Tanzania'
          },
          {
            code: 'KES',
            name: 'Kenyan Shilling',
            symbol: 'KES',
            country: 'Kenya'
          },
          {
            code: 'NGN',
            name: 'Nigerian Naira',
            symbol: 'NGN',
            country: 'Nigeria'
          },
          {
            code: 'GHS',
            name: 'Ghanaian Cedi',
            symbol: 'GHS',
            country: 'Ghana'
          },
          {
            code: 'UGX',
            name: 'Ugandan Shilling',
            symbol: 'UGX',
            country: 'Uganda'
          }
        ]

        return NextResponse.json({
          status: 'success',
          message: 'Supported currencies loaded',
          data: fallbackCurrencies
        })
      }

      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Paycrest currencies API error:', error)
    
    // Return fallback data on any error
    const fallbackCurrencies = [
      {
        code: 'TZS',
        name: 'Tanzanian Shilling',
        symbol: 'TZS',
        country: 'Tanzania'
      },
      {
        code: 'KES',
        name: 'Kenyan Shilling',
        symbol: 'KES',
        country: 'Kenya'
      },
      {
        code: 'NGN',
        name: 'Nigerian Naira',
        symbol: 'NGN',
        country: 'Nigeria'
      },
      {
        code: 'GHS',
        name: 'Ghanaian Cedi',
        symbol: 'GHS',
        country: 'Ghana'
      },
      {
        code: 'UGX',
        name: 'Ugandan Shilling',
        symbol: 'UGX',
        country: 'Uganda'
      }
    ]

    return NextResponse.json({
      status: 'success',
      message: 'Supported currencies loaded (fallback)',
      data: fallbackCurrencies
    })
  }
}
