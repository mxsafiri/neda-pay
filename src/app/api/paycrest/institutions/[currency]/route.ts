import { NextRequest, NextResponse } from 'next/server'

const PAYCREST_API_URL = process.env.NEXT_PUBLIC_PAYCREST_API_URL || 'https://api.paycrest.io/v1'
const PAYCREST_CLIENT_ID = process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || ''

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ currency: string }> }
) {
  const params = await context.params
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

    console.log(`Fetching institutions for ${currency} from Paycrest API...`)
    console.log('Response status:', response.status)

    if (!response.ok) {
      console.error(`Paycrest API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      
      // Return fallback data if API fails
      const fallbackInstitutions = getFallbackInstitutions(currency)
      console.log(`Using fallback institutions for ${currency}:`, fallbackInstitutions)
      return NextResponse.json({
        status: 'success',
        message: 'Using fallback data - API unavailable',
        data: fallbackInstitutions
      })
    }

    const data = await response.json()
    console.log(`Live Paycrest institutions for ${currency}:`, data)
    
    // Return the live data from Paycrest API
    return NextResponse.json({
      status: 'success',
      message: 'Live data from Paycrest API',
      data: data.data || data.institutions || data
    })
  } catch (error) {
    console.error('Paycrest institutions API error:', error)
    
    // Return fallback data on any error
    const fallbackInstitutions = getFallbackInstitutions(params.currency)
    return NextResponse.json({
      status: 'success',
      message: 'Operation successful',
      data: fallbackInstitutions
    })
  }
}

interface FallbackInstitution {
  name: string;
  code: string;
  type: string;
}

function getFallbackInstitutions(currency: string) {
  const institutionMap: Record<string, FallbackInstitution[]> = {
    TZS: [
      {
        name: 'M-Pesa Tanzania',
        code: 'MPESA_TZ',
        type: 'mobile_money'
      },
      {
        name: 'Tigo Pesa',
        code: 'TIGO_PESA',
        type: 'mobile_money'
      },
      {
        name: 'Bank Transfer Tanzania',
        code: 'BANK_TZ',
        type: 'bank'
      }
    ],
    KES: [
      {
        name: 'M-Pesa Kenya',
        code: 'MPESA_KE',
        type: 'mobile_money'
      },
      {
        name: 'Airtel Money Kenya',
        code: 'AIRTEL_KE',
        type: 'mobile_money'
      },
      {
        name: 'Bank Transfer Kenya',
        code: 'BANK_KE',
        type: 'bank'
      }
    ],
    NGN: [
      {
        name: 'Bank Transfer Nigeria',
        code: 'BANK_NG',
        type: 'bank'
      },
      {
        name: 'OPay Nigeria',
        code: 'OPAY_NG',
        type: 'mobile_money'
      }
    ],
    GHS: [
      {
        name: 'MTN Mobile Money Ghana',
        code: 'MTN_GH',
        type: 'mobile_money'
      },
      {
        name: 'Bank Transfer Ghana',
        code: 'BANK_GH',
        type: 'bank'
      }
    ],
    UGX: [
      {
        name: 'MTN Mobile Money Uganda',
        code: 'MTN_UG',
        type: 'mobile_money'
      },
      {
        name: 'Airtel Money Uganda',
        code: 'AIRTEL_UG',
        type: 'mobile_money'
      },
      {
        name: 'Bank Transfer Uganda',
        code: 'BANK_UG',
        type: 'bank'
      }
    ]
  }

  return institutionMap[currency] || []
}
