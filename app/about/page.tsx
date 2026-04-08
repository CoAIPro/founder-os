import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <Link href="/" className="text-sm font-semibold hover:text-violet-400">
          FounderOS
        </Link>
        <Link href="/analyze" className="text-xs text-gray-500 hover:text-violet-400 transition">
          Test Your Idea
        </Link>
      </nav>

      {/* CONTENT */}
      <div className="flex-1 flex items-start justify-center px-6 py-16">
        <div className="w-full max-w-2xl space-y-10">

          {/* OPENING */}
          <div className="space-y-2">
            <p className="text-2xl font-bold leading-snug">
              Most startup ideas don&apos;t fail loudly.
            </p>
            <p className="text-2xl font-bold leading-snug text-gray-400">
              They fail silently — after months of effort.
            </p>
            <p className="text-lg text-violet-400 font-medium">
              Before you build your startup — know if it&apos;s worth building.
            </p>
          </div>

          {/* PROBLEM */}
          <div className="space-y-2">
            <p className="text-gray-300">Founders often build before they validate.</p>
            <p className="text-gray-300">They invest time, energy, and money into ideas that were never strong to begin with.</p>
          </div>

          {/* INSIGHT */}
          <div className="space-y-2">
            <p className="text-white font-semibold">The problem is not execution.</p>
            <p className="text-gray-300">It&apos;s decision quality.</p>
          </div>

          {/* PRODUCT */}
          <div className="space-y-2">
            <p className="text-gray-300">FounderOS is a decision system designed to help founders evaluate their startup ideas.</p>
            <p className="text-gray-300">It analyzes clarity, risk, and validation signals to give structured insights — not generic advice.</p>
          </div>

          {/* DIFFERENTIATION */}
          <div className="space-y-3">
            <p className="text-gray-300">Unlike typical AI tools, FounderOS does not just generate answers. It forces structured thinking.</p>
            <ul className="list-disc ml-6 text-gray-400 text-sm space-y-1">
              <li>Stage-aware evaluation (Idea, MVP, Launch)</li>
              <li>Prioritizes real-world validation over polished descriptions</li>
              <li>Designed to reduce wasted effort</li>
            </ul>
          </div>

          {/* USAGE */}
          <div className="space-y-3">
            <p className="text-white font-semibold">Use FounderOS to:</p>
            <ul className="list-disc ml-6 text-gray-400 text-sm space-y-1">
              <li>Test your idea</li>
              <li>Identify risks</li>
              <li>Improve clarity</li>
              <li>Decide whether to build, pivot, or drop</li>
            </ul>
          </div>

          {/* BUILDER */}
          <div className="space-y-2 border-t border-gray-800 pt-8">
            <p className="text-white font-semibold">Built by Srini Gubbala</p>
            <p className="text-gray-400 text-sm">Focused on designing systems that help founders make better decisions.</p>
            <a href="https://www.linkedin.com/in/srini-gubbala/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-violet-400 transition">Srini Gubbala (LinkedIn)</a>
          </div>

          {/* TRUST */}
          <div className="space-y-2 border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">Your idea stays private. FounderOS does not store or use it to train AI models.</p>
          </div>

          {/* CONTACT */}
          <div className="space-y-2 border-t border-gray-800 pt-8">
            <p className="text-white font-semibold">Building something interesting?</p>
            <a href="mailto:hello@founderos.pro" className="text-gray-500 hover:text-violet-400 transition text-sm">hello@founderos.pro</a>
          </div>

          {/* SYSTEM IDENTITY */}
          <p className="text-xs text-gray-600 text-center">
            FounderOS evaluates ideas differently as execution matures.
          </p>

          {/* CTA */}
          <div className="pt-4">
            <Link href="/analyze" className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition">
              Test Your Idea (60 sec)
            </Link>
          </div>

        </div>
      </div>

    </main>
  )
}