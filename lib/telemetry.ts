import { supabaseAdmin } from '@/lib/supabase-admin'

type EventType =
  | 'analysis_run'
  | 'result_generated'
  | 'retry_clicked'
  | 'share_clicked'
  | 'email_submitted'
  | 'feedback_submitted'
  | 'blocked_input'

interface TelemetryEvent {
  event_type: EventType
  stage?: string
  score?: number
  confidence?: string
  is_fallback?: boolean
  metadata?: Record<string, any>
}

// ✅ FIRE AND FORGET — never breaks UX
export async function trackEvent(event: TelemetryEvent): Promise<void> {
  try {
    if (!supabaseAdmin) return

    await supabaseAdmin.from('events').insert([{
      event_type: event.event_type,
      stage: event.stage ?? null,
      score: event.score ?? null,
      confidence: event.confidence ?? null,
      is_fallback: event.is_fallback ?? false,
      metadata: event.metadata ?? null,
      created_at: new Date().toISOString(),
    }])
  } catch {
    // ✅ SILENTLY IGNORE — telemetry never breaks UX
  }
}