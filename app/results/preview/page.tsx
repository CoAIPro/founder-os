'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/telemetry'

export default function PreviewPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('preview_result')
    if (stored) {
      setData(JSON.parse(stored))
    } else {
      router.push('/')
    }
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  function getScoreLabel(score: number) {
    if (score >= 8.0) return 'Strong Potential'
    if (score >= 6.5) return 'Moderate Potential'
    if (score >= 5.0) return 'Needs Clarity'
    return 'Low Clarity'
  }

  async function handleRetry() {
    try {
      await trackEvent({
        event_type: 'retry_clicked',
        is_fallback: true,
        score: data?.score ?? undefined,
      })
    } catch {
      // silently ignore
    }
    router.push('/analyze')
  }

  const nextSteps: string[] = Array.isArray(data.next_steps)
    ? data.next_steps
    : typeof data.next_steps === 'string'
    ? data.next_steps.split('\n').filter(Boolean)
    : []

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">

        <h1 className="text-3xl font-bold">Your Startup Analysis</h1>

        <p className="text-xs text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-xl">
          We generated a quick analysis due to a temporary system issue. You can retry for a deeper result.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
          >
            Retry Full Analysis
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">

          <div className="flex items-center gap-3">
            <p className={`text-4xl font-bold ${
              data.score >= 8.0 ? 'text-green-400'
              : data.score >= 6.5 ? 'text-yellow-400'
              : data.score >= 5.0 ? 'text-orange-400'
              : 'text-red-400'
            }`}>
              {data.score}
            </p>
            <p className="text-sm text-gray-400">{getScoreLabel(data.score)}</p>
          </div>

          <p><strong>Market Demand:</strong> {data.market_demand}</p>
          <p><strong>Differentiation:</strong> {data.differentiation}</p>
          <p><strong>Execution Risk:</strong> {data.execution_risk}</p>
          <p><strong>Insight:</strong> {data.insight}</p>
          <p><strong>Risk:</strong> {data.risk}</p>
          <p><strong>Blind Spot:</strong> {data.blind_spot}</p>

          <div>
            <strong>Next Steps:</strong>
            <ul className="list-disc ml-6">
              {nextSteps.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          <p><strong>Confidence:</strong> {data.confidence}</p>

        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-3">
          <p className="text-sm text-gray-400">Want a more accurate analysis?</p>
          <p className="font-semibold text-white">How to get a sharper analysis</p>
          <ul className="list-disc ml-6 text-sm text-gray-400 space-y-1">
            <li>Define your exact target customer</li>
            <li>Explain the problem you solve</li>
            <li>Describe how your product is different</li>
            <li>Mention how you plan to make money</li>
          </ul>
        </div>

      </div>
    </main>
  )
}