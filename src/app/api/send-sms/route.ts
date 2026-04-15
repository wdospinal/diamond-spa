import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  const toNumber   = process.env.BUSINESS_PHONE ?? '+573054541635'

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('SMS service not configured — missing Twilio env vars')
    return NextResponse.json({ error: 'SMS service not configured' }, { status: 503 })
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const body = new URLSearchParams({ From: fromNumber, To: toNumber, Body: message })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Twilio error:', text)
    return NextResponse.json({ error: text }, { status: res.status })
  }

  return NextResponse.json({ success: true })
}
