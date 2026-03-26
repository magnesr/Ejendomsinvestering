'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PLAN_METADATA } from '@/lib/stripe/plans'
import { Suspense } from 'react'

function PriserIndhold() {
  const [aarlig, setAarlig] = useState(true)
  const [indlaeser, setIndlaeser] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgrade = searchParams.get('upgrade')

  async function vaelgPlan(planNoegle: string) {
    setIndlaeser(planNoegle)
    try {
      const priceIds: Record<string, string> = {
        boligkoeber_maaned: process.env.NEXT_PUBLIC_STRIPE_PRICE_BOLIGKOEBER_MAANED ?? '',
        boligkoeber_aar: process.env.NEXT_PUBLIC_STRIPE_PRICE_BOLIGKOEBER_AAR ?? '',
        investor_maaned: process.env.NEXT_PUBLIC_STRIPE_PRICE_INVESTOR_MAANED ?? '',
        investor_aar: process.env.NEXT_PUBLIC_STRIPE_PRICE_INVESTOR_AAR ?? '',
      }
      const priceId = priceIds[planNoegle]

      const svar = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await svar.json()
      if (data.url) {
        router.push(data.url)
      } else if (svar.status === 401) {
        router.push('/opret-konto')
      }
    } finally {
      setIndlaeser(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">Boligpulsen</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Log ind</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Enkle, transparente priser</h1>
          <p className="mt-3 text-gray-600 text-lg">Start gratis. Opgrader når du er klar.</p>

          {/* Månedlig / Årlig toggle */}
          <div className="inline-flex items-center gap-3 mt-8 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setAarlig(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!aarlig ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Månedlig
            </button>
            <button
              onClick={() => setAarlig(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aarlig ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Årlig <span className="ml-1 text-xs text-green-600 font-semibold">Spar ~16%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Freemium */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900">Gratis</h3>
            <div className="mt-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">0</span>
              <span className="text-gray-500"> kr/md</span>
            </div>
            <ul className="space-y-2.5 mb-8">
              {['3 analyser per måned', 'Boligvurdering', 'Skatteoverblik', 'Sammenligning'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/opret-konto"
              className="block w-full text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Kom gratis i gang
            </Link>
          </div>

          {/* Boligkøber */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              Mest populær
            </div>
            <h3 className="font-semibold text-gray-900">{PLAN_METADATA.boligkoeber.navn}</h3>
            <div className="mt-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {aarlig ? Math.round(PLAN_METADATA.boligkoeber.aarspris / 12) : PLAN_METADATA.boligkoeber.maanedspris}
              </span>
              <span className="text-gray-500"> kr/md</span>
              {aarlig && <p className="text-xs text-gray-400 mt-0.5">faktureres {PLAN_METADATA.boligkoeber.aarspris} kr/år</p>}
            </div>
            <ul className="space-y-2.5 mb-8">
              {PLAN_METADATA.boligkoeber.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => vaelgPlan(aarlig ? 'boligkoeber_aar' : 'boligkoeber_maaned')}
              disabled={!!indlaeser}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {indlaeser === (aarlig ? 'boligkoeber_aar' : 'boligkoeber_maaned') ? 'Vent...' : 'Vælg Boligkøber'}
            </button>
          </div>

          {/* Investor */}
          <div className={`bg-white rounded-2xl border-2 p-6 ${upgrade === 'investor' ? 'border-purple-500' : 'border-gray-200'}`}>
            <h3 className="font-semibold text-gray-900">{PLAN_METADATA.investor.navn}</h3>
            <div className="mt-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {aarlig ? Math.round(PLAN_METADATA.investor.aarspris / 12) : PLAN_METADATA.investor.maanedspris}
              </span>
              <span className="text-gray-500"> kr/md</span>
              {aarlig && <p className="text-xs text-gray-400 mt-0.5">faktureres {PLAN_METADATA.investor.aarspris} kr/år</p>}
            </div>
            <ul className="space-y-2.5 mb-8">
              {PLAN_METADATA.investor.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => vaelgPlan(aarlig ? 'investor_aar' : 'investor_maaned')}
              disabled={!!indlaeser}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {indlaeser === (aarlig ? 'investor_aar' : 'investor_maaned') ? 'Vent...' : 'Vælg Investor'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Alle priser er inkl. moms. Opsig når som helst. Ingen binding.
        </p>
      </div>
    </div>
  )
}

export default function PriserSide() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PriserIndhold />
    </Suspense>
  )
}
