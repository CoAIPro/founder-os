import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  buildUserPrompt,
  SYSTEM_PROMPT,
  PROMPT_VERSION,
} from '@/prompts/analyze-idea'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createHash } from 'crypto'
import { rateLimit } from '@/lib/rate-limit'
import { logError, logInfo } from '@/lib/logger'
import { trackEvent } from '@/lib/telemetry'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// ✅ SAFETY BLOCKLIST
const BLOCKED_KEYWORDS = [
  'cocaine', 'heroin', 'meth',
  'money laundering',
  'malware', 'ransomware',
  'terrorist', 'terrorism',
  'dark web',
]

function isSafeInput(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_KEYWORDS.some(keyword => lower.includes(keyword))
}

// ✅ FALLBACK (SAFE)
function getFallback() {
  return {
    score: 5,
    market_demand: 'We need more detail to assess demand reliably.',
    differentiation: 'We need a clearer value proposition to assess differentiation.',
    execution_risk: 'We need more detail about the product and workflow to assess execution risk.',
    insight: 'Idea lacks clarity and structured thinking.',
    risk: 'Higher risk due to unclear problem definition.',
    blind_spot: 'Missing clarity in idea description.',
    next_steps: [
      'Refine your idea description.',
      'Clearly define your target customer.',
      'Validate problem with real users.',
    ],
    confidence: 'Low',
  }
}

// ✅ IP HASH FUNCTION
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ideaText, stage, customer } = body

    // ✅ CAPTURE AND HASH IP
    const rawIP =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const ipHash = hashIP(rawIP)

    // ✅ RATE LIMITING
    const allowed = rateLimit(rawIP)
    if (!allowed) {
      logInfo('analyze-api', 'Rate limit exceeded', { ip: rawIP })
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      )
    }

    // ✅ DAILY LIMIT CHECK
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabaseAdmin
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`)

    const dailyLimit = parseInt(process.env.DAILY_LIMIT || '100')
    if ((count ?? 0) >= dailyLimit) {
      logInfo('analyze-api', 'Daily limit reached', { count })
      return NextResponse.json(
        { error: 'Daily analysis limit reached. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // ✅ VALIDATION
    if (!ideaText || ideaText.length < 10 || !customer) {
      logInfo('analyze-api', 'Validation failed', { ideaText, customer })
      return NextResponse.json(
        { error: 'Idea and target customer are required' },
        { status: 400 }
      )
    }

    // ✅ SAFETY GUARDRAIL
    if (!isSafeInput(ideaText) || !isSafeInput(customer)) {
      logInfo('analyze-api', 'Blocked unsafe input', { ip: ipHash })
      trackEvent({
        event_type: 'blocked_input',
        stage,
        metadata: { blocked_reason: 'unsafe_keywords' },
      })
      return NextResponse.json(
        { error: 'This idea cannot be evaluated due to safety and legal constraints.\n\nFounderOS evaluates only legal, ethical startup ideas to protect users and ensure safe analysis.\n\nTry a different idea that solves a real-world problem.' },
        { status: 400 }
      )
    }

    // ✅ TRACK ANALYSIS RUN
    trackEvent({
      event_type: 'analysis_run',
      stage,
      metadata: {
        input_length: ideaText.length,
        has_customer: !!customer,
      },
    })

    logInfo('analyze-api', 'Request received', { stage, customer })

    // ✅ CACHE CHECK — before OpenAI call to save cost
    const normalized = ideaText.trim().toLowerCase()
    const { data: existing } = await supabaseAdmin
      .from('analyses')
      .select('id, score')
      .eq('idea_text', normalized)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1)
      .single()

    if (existing) {
      logInfo('analyze-api', 'Cache hit — returning existing result', { id: existing.id })
      return NextResponse.json({ id: existing.id, result: existing })
    }

    // ✅ BUILD PROMPT
    const prompt = buildUserPrompt(ideaText, undefined, stage, customer)

    // ✅ OPENAI CALL
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    })

    const text = response.choices?.[0]?.message?.content?.trim() || ''

    let parsed: any

    // ✅ SAFE JSON PARSE (ANTI-FRAGILE)
    try {
      parsed = JSON.parse(text)
    } catch (err) {
      logError('analyze-api', err, { context: 'JSON parse failed', raw: text })
      parsed = getFallback()
    }

    // ✅ HARD VALIDATION (COMPANY CRITICAL)
    const safe = {
      score: Math.min(Math.max(Number(parsed.score) || 5, 0), 10),

      market_demand:
        typeof parsed.market_demand === 'string'
          ? parsed.market_demand
          : 'Not available',

      differentiation:
        typeof parsed.differentiation === 'string'
          ? parsed.differentiation
          : 'Not available',

      execution_risk:
        typeof parsed.execution_risk === 'string'
          ? parsed.execution_risk
          : 'Not available',

      insight:
        typeof parsed.insight === 'string' && parsed.insight.length > 5
          ? parsed.insight
          : 'No clear strategic insight generated.',

      risk:
        typeof parsed.risk === 'string' && parsed.risk.length > 5
          ? parsed.risk
          : 'Potential failure risk unclear.',

      blind_spot:
        typeof parsed.blind_spot === 'string'
          ? parsed.blind_spot
          : 'Not available',

      next_steps:
        Array.isArray(parsed.next_steps) && parsed.next_steps.length >= 3
          ? parsed.next_steps.slice(0, 3)
          : getFallback().next_steps,

      confidence:
        parsed.confidence === 'High' ||
        parsed.confidence === 'Medium' ||
        parsed.confidence === 'Low'
          ? parsed.confidence
          : 'Medium',
    }

    const { data: saved, error } = await supabaseAdmin
      .from('analyses')
      .insert([
        {
          idea_text: ideaText,
          stage,
          target_customer: customer,

          score: safe.score,
          market_demand: safe.market_demand,
          differentiation: safe.differentiation,
          execution_risk: safe.execution_risk,

          insight: safe.insight,
          risk: safe.risk,

          blind_spot: safe.blind_spot,
          next_steps: safe.next_steps,
          confidence: safe.confidence,

          prompt_version: PROMPT_VERSION,
          model: 'gpt-4o-mini',

          cta_clicked: false,
          useful_rating: null,
          ip_hash: ipHash,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    // ✅ EVEN IF DB FAILS → RETURN RESULT
    if (error) {
      logError('analyze-api', error, { context: 'Supabase insert failed' })
      trackEvent({
        event_type: 'result_generated',
        stage,
        score: safe.score,
        confidence: safe.confidence,
        is_fallback: true,
      })
      return NextResponse.json({ result: safe, is_fallback: true })
    }

    // ✅ TRACK RESULT GENERATED
    trackEvent({
      event_type: 'result_generated',
      stage,
      score: safe.score,
      confidence: safe.confidence,
      is_fallback: false,
    })

    logInfo('analyze-api', 'Analysis saved successfully', { id: saved.id })

    // ✅ SUCCESS RESPONSE
    return NextResponse.json({
      id: saved.id,
      result: safe,
    })

  } catch (err) {
    logError('analyze-api', err, { context: 'Unhandled error' })

    // ✅ NEVER BREAK UI
    return NextResponse.json({
      result: getFallback(),
      is_fallback: true,
    })
  }
}