import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logError, logInfo } from '@/lib/logger'
import { trackEvent } from '@/lib/telemetry'

export async function POST(req: NextRequest) {
  try {
    const { email, building, id } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      logError('leads-api', new Error('supabaseAdmin is null'), { context: 'DB not initialized' })
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // get idea details from analyses table
    const { data: analysis } = await supabaseAdmin
      .from('analyses')
      .select('idea_text, stage, target_customer, score')
      .eq('id', id)
      .single()

    // save to leads table
    await supabaseAdmin.from('leads').insert([{
      email,
      idea_text: analysis?.idea_text || building || null,
      stage: analysis?.stage || null,
      target_customer: analysis?.target_customer || null,
      created_at: new Date().toISOString(),
    }])

    // ✅ TRACK EMAIL SUBMITTED
    trackEvent({
      event_type: 'email_submitted',
      stage: analysis?.stage ?? undefined,
      score: analysis?.score ?? undefined,
      metadata: { strategy_requested: true },
    })

    logInfo('leads-api', 'Lead saved', { email, id })
    return NextResponse.json({ success: true })

  } catch (err) {
    logError('leads-api', err, { context: 'Lead save failed' })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}