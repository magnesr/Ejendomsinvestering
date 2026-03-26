'use client'

import { useState } from 'react'
import { SituationsFormular } from '@/components/boligrejse/SituationsFormular'
import { RejsePlan } from '@/components/boligrejse/RejsePlan'
import type { BoligrejseInput, BoligrejsePlan } from '@/lib/engines/boligrejse'

export default function BoligrejseSide() {
  const [plan, setPlan] = useState<BoligrejsePlan | null>(null)
  const [fejl, setFejl] = useState<string | null>(null)
  const [indlaeser, setIndlaeser] = useState(false)

  async function beregnPlan(input: BoligrejseInput) {
    setFejl(null)
    setIndlaeser(true)
    try {
      const svar = await fetch('/api/boligrejse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await svar.json()
      if (!svar.ok) {
        setFejl(data.fejl ?? 'Noget gik galt')
        return
      }
      setPlan(data)
    } catch {
      setFejl('Kunne ikke forbinde til serveren')
    } finally {
      setIndlaeser(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boligrejse-planlægning</h1>
        <p className="mt-1 text-gray-600">
          Fortæl os om din økonomi og drømmebolig — vi beregner den optimale vej dertil.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SituationsFormular onBeregn={beregnPlan} indlaeser={indlaeser} />
        {fejl && <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{fejl}</p>}
      </div>

      {plan && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Din boligrejse</h2>
          <RejsePlan plan={plan} />
        </div>
      )}
    </div>
  )
}
