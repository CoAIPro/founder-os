'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Feedback from './feedback'

export default function ResultPage() {
  const params = useParams()
  const id = params?.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    if (id === 'preview') {
      setLoading(false)
      return
    }

    async function fetchData() {
      const res = await fetch(`/api/result/${id}`)
      if (!res.ok) {
        console.log('❌ Failed to fetch result')
      } else {
        const json = await res.json()
        setData(json)
      }
      setLoading(false)
    }

    fetchData()
  }, [id])

  function handleCopyLink() {
    const url = `${window.location.origin}/results/${id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading result...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-2">
        <p>Failed to load result ❌</p>
        <p className="text-sm text-gray-400">
          Check console (F12 → Console)
        </p>
      </div>
    )
  }

  function getScoreLabel(score: number) {
    if (score >= 8.0) return 'Strong Potential'
    if (score >= 6.5) return 'Moderate Potential'
    if (score >= 5.0) return 'Needs Clarity'
    return 'Low Clarity'
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">

        {/* HEADER + SHARE BUTTON */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Startup Analysis</h1>
          <button
            onClick={handleCopyLink}
            className="text-sm px-4 py-2 rounded-xl border border-gray-700 hover:border-violet-500 text-gray-400 hover:text-white transition"
          >
            {copied ? '✅ Link copied!' : '🔗 Share with co-founder'}
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">

          {/* SCORE */}
          <div className="flex items-center gap-3">
            <p
              className={`text-4xl font-bold ${
                data.score >= 8.0
                  ? 'text-green-400'
                  : data.score >= 6.5
                  ? 'text-yellow-400'
                  : data.score >= 5.0
                  ? 'text-orange-400'
                  : 'text-red-400'
              }`}
            >
              {data.score}
            </p>
            <div>
              <p className="text-sm text-gray-400">{getScoreLabel(data.score)}</p>
              <p className="text-xs text-gray-600">Top ideas typically score 7+</p>
            </div>
          </div>

          {/* ✅ SCORE DISCLAIMER */}
          <p className="text-xs text-gray-500 border-t border-gray-800 pt-3">
            This score reflects how clearly your idea is defined — not guaranteed startup success.
          </p>

          {/* BREAKDOWN */}
          <p><strong>Market Demand:</strong> {data.market_demand}</p>
          <p><strong>Differentiation:</strong> {data.differentiation}</p>
          <p><strong>Execution Risk:</strong> {data.execution_risk}</p>

          {/* FIXED FIELDS */}
          <p><strong>Insight:</strong> {data.insight || 'Not available'}</p>
          <p><strong>Risk:</strong> {data.risk || data.execution_risk}</p>
          <p><strong>Blind Spot:</strong> {data.blind_spot}</p>

          {/* NEXT STEPS */}
          <div>
            <strong>Next Steps:</strong>
            <ul className="list-disc ml-6">
              {data.next_steps?.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          {/* CONFIDENCE */}
          <p><strong>Confidence:</strong> {data.confidence}</p>

          {/* ✅ LOW CONFIDENCE WARNING */}
          {data.confidence === 'Low' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 space-y-2">
              <p className="text-xs text-yellow-400 font-semibold">
                ⚠️ This idea is well described, but may still lack real-world validation.
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-2">How to improve your score in the real world:</p>
              <ul className="list-disc ml-5 text-xs text-gray-400 space-y-1">
                <li>Talk to real target users</li>
                <li>Validate the problem before building</li>
                <li>Test whether people actually want this</li>
                <li>Improve clarity with real feedback</li>
              </ul>
            </div>
          )}

        </div>

        {/* SHARE LINE */}
        <p className="text-xs text-gray-600 text-center">
          Share this analysis with your co-founder
        </p>

        {/* CTA + FEEDBACK */}
        <Feedback id={id} />

      </div>
    </main>
  )
}