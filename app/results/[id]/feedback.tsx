'use client'

import { useState } from 'react'

export default function Feedback({ id }: { id: string }) {
  const [loadingCTA, setLoadingCTA] = useState(false)
  const [ctaClicked, setCtaClicked] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null)

  // MODAL STATE
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [building, setBuilding] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailError, setEmailError] = useState('')

  // OPEN MODAL ON CTA CLICK
  async function handleCTA() {
    try {
      setLoadingCTA(true)

      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'cta' }),
      })

      setShowModal(true)

    } catch (err) {
      console.log('CTA ERROR:', err)
    } finally {
      setLoadingCTA(false)
    }
  }

  // SUBMIT EMAIL
  async function handleEmailSubmit() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.')
      return
    }

    setEmailError('')

    try {
      setSubmitting(true)

      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          building: building.trim(),
          id,
        }),
      })

      setSubmitted(true)

    } catch (err) {
      console.log('EMAIL ERROR:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // FEEDBACK
  async function handleFeedback(value: number) {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'feedback', value }),
      })

      setFeedbackSent(value === 1)

    } catch (err) {
      console.log('FEEDBACK ERROR:', err)
    }
  }

  return (
    <div className="mt-10 space-y-8 text-center">

      {/* CTA BLOCK */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <p className="text-sm text-gray-300 mb-4">
          This idea has potential — but execution clarity is missing.
        </p>

        {ctaClicked ? (
          <p className="text-green-400 font-medium">
            Thanks — we will reach out soon with your Founder Strategy Plan.
          </p>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleCTA}
              disabled={loadingCTA}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition disabled:opacity-50"
            >
              {loadingCTA ? 'Processing...' : 'Get My Strategy Plan'}
            </button>
            <p className="text-xs text-gray-500">Free during early launch</p>
          </div>
        )}
      </div>

      {/* FEEDBACK */}
      <div>
        <p className="text-sm text-gray-400 mb-3">Was this analysis helpful?</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleFeedback(1)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white transition"
          >
            👍 Yes
          </button>
          <button
            onClick={() => handleFeedback(-1)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white transition"
          >
            👎 No
          </button>
        </div>

        {feedbackSent !== null && (
          <p className="text-sm text-gray-400 mt-3">
            Thanks — this helps improve FounderOS.
          </p>
        )}
      </div>

      {/* EMAIL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md space-y-5">

            {submitted ? (
              <div className="text-center space-y-3">
                <p className="text-2xl">✅</p>
                <p className="text-white font-semibold text-lg">
                  Thanks — we will reach out soon with your Founder Strategy Plan.
                </p>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setCtaClicked(true)
                  }}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-xl">
                    Get your Founder Strategy Plan
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError('')
                  }}
                  placeholder="Your email (required)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                />

                {emailError && (
                  <p className="text-red-400 text-sm text-left">{emailError}</p>
                )}

                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="What are you building? (optional)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                />

                <button
                  onClick={handleEmailSubmit}
                  disabled={submitting || !email.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send My Plan'}
                </button>

                {/* ✅ UPDATED TRUST LINE */}
                <p className="text-xs text-gray-600 text-center">
                  We only use your email to send your strategy plan. Your idea remains private.
                </p>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}