import { NextRequest, NextResponse } from 'next/server'

const PAYCREST_API_URL = process.env.NEXT_PUBLIC_PAYCREST_API_URL || 'https://api.paycrest.io/v1'
const PAYCREST_CLIENT_ID = process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || ''

export async function GET(
  request: NextRequest,
  { params }: { params: { currency: string } }
) {
  try {
    const { currency } = params

    if (!PAYCREST_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Paycrest API not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${PAYCREST_API_URL}/institutions/${currency}`, {
      headers: {
        'Content-Type': 'application/json',
        'API-Key': PAYCREST_CLIENT_ID,
      },
    })

    if (!response.ok) {
      // If the API endpoint doesn't exist, return fallback data based on currency
      if (response.status === 404) {
        const fallbackInstitutions = getFallbackInstitutions(currency)
        return NextResponse.json({
          status: 'success',
          message: 'Institutions loaded',
          data: fallbackInstitutions
        })
      }

      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Paycrest institutions API error:', error)
    
    // Return fallback data on any error
    const fallbackInstitutions = getFallbackInstitutions(params.currency)
    return NextResponse.json({
      status: 'success',
      message: 'Institutions loaded (fallback)',
      data: fallbackInstitutions
    })
  }
}

interface FallbackInstitution {
  id: string;
  name: string;
  code: string;
  type: 'mobile_money' | 'bank';
  country: string;
}

function getFallbackInstitutions(currency: string) {
  const institutionMap: Record<string, FallbackInstitution[]> = {
    TZS: [
      {
        id: 'tz-mpesa',
        name: 'M-Pesa Tanzania',
        code: 'MPESA_TZ',
        type: 'mobile_money',
        country: 'Tanzania'
      },
      {
        id: 'tz-tigo',
        name: 'Tigo Pesa',
        code: 'TIGO_TZ',
        type: 'mobile_money',
        country: 'Tanzania'
      },
      {
        id: 'tz-bank',
        name: 'Tanzania Bank Transfer',
        code: 'BANK_TZ',
        type: 'bank',
        country: 'Tanzania'
      }
    ],
    KES: [
      {
        id: 'ke-mpesa',
        name: 'M-Pesa Kenya',
        code: 'MPESA_KE',
        type: 'mobile_money',
        country: 'Kenya'
      },
      {
        id: 'ke-airtel',
        name: 'Airtel Money Kenya',
        code: 'AIRTEL_KE',
        type: 'mobile_money',
        country: 'Kenya'
      },
      {
        id: 'ke-bank',
        name: 'Kenya Bank Transfer',
        code: 'BANK_KE',
        type: 'bank',
        country: 'Kenya'
      }
    ],
    NGN: [
      {
        id: 'ng-bank',
        name: 'Nigeria Bank Transfer',
        code: 'BANK_NG',
        type: 'bank',
        country: 'Nigeria'
      },
      {
        id: 'ng-opay',
        name: 'OPay Nigeria',
        code: 'OPAY_NG',
        type: 'mobile_money',
        country: 'Nigeria'
      }
    ],
    GHS: [
      {
        id: 'gh-mtn',
        name: 'MTN Mobile Money Ghana',
        code: 'MTN_GH',
        type: 'mobile_money',
        country: 'Ghana'
      },
      {
        id: 'gh-bank',
        name: 'Ghana Bank Transfer',
        code: 'BANK_GH',
        type: 'bank',
        country: 'Ghana'
      }
    ],
    UGX: [
      {
        id: 'ug-mtn',
        name: 'MTN Mobile Money Uganda',
        code: 'MTN_UG',
        type: 'mobile_money',
        country: 'Uganda'
      },
      {
        id: 'ug-airtel',
        name: 'Airtel Money Uganda',
        code: 'AIRTEL_UG',
        type: 'mobile_money',
        country: 'Uganda'
      },
      {
        id: 'ug-bank',
        name: 'Uganda Bank Transfer',
        code: 'BANK_UG',
        type: 'bank',
        country: 'Uganda'
      }
    ]
  }

  return institutionMap[currency] || []
}
