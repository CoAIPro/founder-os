import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logError, logInfo } from '@/lib/logger'
import { trackEvent } from '@/lib/telemetry'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, type, value } = body

    // ✅ Basic validation
    if (!id || !type) {
      return NextResponse.json(
        { error: 'Missing id or type' },
        { status: 400 }
      )
    }

    // 🔥 CTA CLICK
    if (type === 'cta') {
      const { error } = await supabaseAdmin
        .from('analyses')
        .update({ cta_clicked: true })
        .eq('id', id)

      if (error) {
        logError('feedback-api', error, { context: 'CTA update failed', id })
        return NextResponse.json({ error: 'DB update failed' })
      }

      logInfo('feedback-api', 'CTA clicked', { id })
      return NextResponse.json({ success: true })
    }

    // 🔥 FEEDBACK (👍 / 👎)
    if (type === 'feedback') {
      if (value !== 1 && value !== -1) {
        return NextResponse.json(
          { error: 'Invalid feedback value' },
          { status: 400 }
        )
      }

      const { data: analysis } = await supabaseAdmin
        .from('analyses')
        .select('score, confidence')
        .eq('id', id)
        .single()

      const { error } = await supabaseAdmin
        .from('analyses')
        .update({ useful_rating: value })
        .eq('id', id)

      if (error) {
        logError('feedback-api', error, { context: 'Feedback update failed', id })
        return NextResponse.json({ error: 'DB update failed' })
      }

      // ✅ TRACK FEEDBACK
      trackEvent({
        event_type: 'feedback_submitted',
        score: analysis?.score ?? undefined,
        confidence: analysis?.confidence ?? undefined,
        metadata: { positive: value === 1 },
      })

      logInfo('feedback-api', 'Feedback saved', { id, value })
      return NextResponse.json({ success: true })
    }

    // 🔥 SHARE CLICKED
    if (type === 'share') {
      const { data: analysis } = await supabaseAdmin
        .from('analyses')
        .select('score, stage')
        .eq('id', id)
        .single()

      // ✅ TRACK SHARE
      trackEvent({
        event_type: 'share_clicked',
        stage: analysis?.stage ?? undefined,
        score: analysis?.score ?? undefined,
      })

      logInfo('feedback-api', 'Share clicked', { id })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid type' },
      { status: 400 }
    )

  } catch (err) {
    logError('feedback-api', err, { context: 'Unhandled error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}