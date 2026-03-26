'use client'

import { useState } from 'react'
import Link from 'next/link'

interface UpgradePromptProps {
  titel?: string
  beskrivelse?: string
  kravPlan?: 'boligkoeber' | 'investor'
  inlineBoks?: boolean
}

export function UpgradePrompt({
  titel = 'Opgrader for at fortsætte',
  beskrivelse = 'Denne funktion kræver et aktivt abonnement.',
  kravPlan = 'boligkoeber',
  inlineBoks = false,
}: UpgradePromptProps) {
  const [lukket, setLukket] = useState(false)

  if (lukket) return null

  if (inlineBoks) {
    return (
      <div className="relative mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl">
        <button
          onClick={() => setLukket(true)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-gray-900 mb-1">{titel}</p>
        <p className="text-sm text-gray-600 mb-3">{beskrivelse}</p>
        <Link
          href={`/priser${kravPlan === 'investor' ? '?upgrade=investor' : ''}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Se priser
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-lg font-semibold text-gray-900 mb-2">{titel}</p>
      <p className="text-gray-600 max-w-sm mb-6">{beskrivelse}</p>
      <Link
        href={`/priser${kravPlan === 'investor' ? '?upgrade=investor' : ''}`}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Se abonnementspriser
      </Link>
    </div>
  )
}
