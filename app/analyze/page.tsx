'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AnalyzeResponse, Stage } from '@/types/analysis'

const MAX_CHARS = 500
const MAX_NAME_CHARS = 100
const MAX_CUSTOMER_CHARS = 150

const STAGES: { value: Stage; label: string; hint: string; detail: string }[] = [
  { value: 'idea', label: 'Idea', hint: 'Not built yet • highest uncertainty', detail: 'At idea stage, scores reflect higher uncertainty because there is no real-world validation yet.' },
  { value: 'mvp', label: 'MVP', hint: 'Built & testing • early validation', detail: 'At MVP stage, scores reflect early validation and lower risk than pure idea-stage concepts.' },
  { value: 'launched', label: 'Launch', hint: 'Live with users • real-world signal', detail: 'At launch stage, scores reflect real execution potential and market feedback readiness.' },
]

export default function AnalyzePage() {
  const router = useRouter()

  const [ideaName, setIdeaName] = useState('')
  const [customer, setCustomer] = useState('')
  const [ideaText, setIdeaText] = useState('')
  const [stage, setStage] = useState<Stage>('idea')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charsLeft = MAX_CHARS - ideaText.length
  const customerCharsLeft = MAX_CUSTOMER_CHARS - customer.length
  const nameCharsLeft = MAX_NAME_CHARS - ideaName.length

  const canSubmit =
    ideaText.trim().length >= 20 &&
    customer.trim().length > 0 &&
    ideaText.length <= MAX_CHARS &&
    customer.length <= MAX_CUSTOMER_CHARS &&
    ideaName.length <= MAX_NAME_CHARS &&
    !loading

  const selectedStage = STAGES.find(s => s.value === stage)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText,
          ideaName: ideaName.trim() || undefined,
          customer: customer.trim(),
          stage,
        }),
      })

      const data: AnalyzeResponse = await res.json()

      if ('error' in data) {
        setError(data.error)
        return
      }

      if ('id' in data && data.id) {
        router.push(`/results/${data.id}`)
      } else if ('result' in data && data.result) {
        sessionStorage.setItem('preview_result', JSON.stringify(data.result))
        router.push(`/results/preview`)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <Link href="/" className="text-sm font-semibold hover:text-violet-400">
          FounderOS
        </Link>
        <Link href="/about" className="text-xs text-gray-500 hover:text-violet-400 transition">
          About
        </Link>
      </nav>

      {/* CONTENT */}
      <div className="flex-1 flex items-start justify-center px-6 py-16">
        <div className="w-full max-w-2xl">

          <h1 className="text-2xl font-bold mb-2">
            Most startup ideas fail silently. Test yours before you waste months.
          </h1>

          <p className="text-sm text-gray-400 mb-6">
            Be specific. The more context you provide, the sharper the analysis.
          </p>

          {/* WHAT YOU GET */}
          <div className="bg-gray-900 p-4 rounded mb-6 text-sm text-gray-300">
            <p className="font-semibold mb-2">What you'll get:</p>
            <ul className="list-disc ml-5">
              <li>Startup score</li>
              <li>Key insight</li>
              <li>Biggest risk</li>
              <li>Clear next steps</li>
            </ul>
          </div>

          {/* ✅ INPUT QUALITY GUIDANCE */}
          <div className="bg-gray-900 p-4 rounded mb-6 text-sm text-gray-300 border border-gray-800">
            <p className="font-semibold mb-2">How to get a more accurate score:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Define your exact target customer</li>
              <li>Explain the problem you solve</li>
              <li>Describe what you have already built</li>
              <li>Mention how you plan to make money</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* STAGE */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Stage
              </label>

              {/* ✅ STAGE GUIDANCE */}
              <p className="text-xs text-gray-500 mb-2">
                Choose your stage — this changes how FounderOS evaluates risk and readiness.
              </p>

              {/* ✅ PROGRESSION VISUAL */}
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                <span className={stage === 'idea' ? 'text-violet-400 font-semibold' : ''}>Idea</span>
                <span>→</span>
                <span className={stage === 'mvp' ? 'text-violet-400 font-semibold' : ''}>MVP</span>
                <span>→</span>
                <span className={stage === 'launched' ? 'text-violet-400 font-semibold' : ''}>Launch</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {STAGES.map(({ value, label, hint }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStage(value)}
                    className={`rounded-xl p-4 border transition ${
                      stage === value
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div>{label}</div>
                    <div className="text-xs">{hint}</div>
                  </button>
                ))}
              </div>

              {/* ✅ STAGE DETAIL */}
              {selectedStage && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedStage.detail}
                </p>
              )}
            </div>

            {/* STARTUP NAME */}
            <div>
              <input
                value={ideaName}
                onChange={(e) => setIdeaName(e.target.value)}
                maxLength={MAX_NAME_CHARS}
                placeholder="Startup name (optional)"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                {nameCharsLeft} characters left
              </div>
            </div>

            {/* TARGET CUSTOMER */}
            <div>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                maxLength={MAX_CUSTOMER_CHARS}
                placeholder="Target customer (REQUIRED) e.g. college students preparing for exams"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                {customerCharsLeft} characters left
              </div>
            </div>

            {/* IDEA TEXT */}
            <div>
              <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                rows={6}
                maxLength={MAX_CHARS}
                placeholder="e.g. AI tool that helps students plan study schedules, track progress, and improve focus"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {charsLeft} characters left
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-red-400 text-sm space-y-1">
                {error.split('\n\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              disabled={loading || !canSubmit}
              className="w-full bg-violet-600 py-3 rounded-xl font-semibold hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? 'Analyzing your idea…' : 'Get My Startup Score (60 sec)'}
            </button>

            {/* LOADING STEPS */}
            {loading && (
              <div className="text-sm text-gray-400 space-y-1 mt-3">
                <p>Analyzing your idea…</p>
                <p>• Checking demand</p>
                <p>• Evaluating risks</p>
                <p>• Generating insights</p>
              </div>
            )}

          </form>

        </div>
      </div>
    </main>
  )
}