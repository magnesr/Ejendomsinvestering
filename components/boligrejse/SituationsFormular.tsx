'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { BoligrejseInput } from '@/lib/engines/boligrejse'

interface SituationsFormularProps {
  onBeregn: (input: BoligrejseInput) => void
  indlaeser: boolean
}

export function SituationsFormular({ onBeregn, indlaeser }: SituationsFormularProps) {
  const [harNuvaerende, setHarNuvaerende] = useState(false)
  const [budget, setBudget] = useState('')
  const [boligVaerdi, setBoligVaerdi] = useState('')
  const [gaeld, setGaeld] = useState('')
  const [dreommePrisMin, setDreommePrisMin] = useState('')
  const [dreommePrisMax, setDreommePrisMax] = useState('')
  const [droemmeOmraade, setDroemmeOmraade] = useState('')
  const [droemmeType, setDroemmeType] = useState('villa')

  function parseKr(str: string): number {
    return parseInt(str.replace(/\D/g, '')) || 0
  }

  function formaterInput(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const tal = e.target.value.replace(/\D/g, '')
      setter(tal ? parseInt(tal).toLocaleString('da-DK') : '')
    }
  }

  function haandterIndsend(e: React.FormEvent) {
    e.preventDefault()
    onBeregn({
      nuvaerende_budget: parseKr(budget),
      nuvaerende_bolig_vaerdi: harNuvaerende ? parseKr(boligVaerdi) : undefined,
      nuvaerende_gaeld: harNuvaerende ? parseKr(gaeld) : undefined,
      droemme_pris_min: parseKr(dreommePrisMin),
      droemme_pris_max: parseKr(dreommePrisMax),
      droemme_omraade: droemmeOmraade || undefined,
      droemme_type: droemmeType,
    })
  }

  const inputKlasse = "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <form onSubmit={haandterIndsend} className="space-y-6">
      {/* Nuværende situation */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Din nuværende situation</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tilgængeligt budget til udbetaling
            </label>
            <input
              type="text"
              value={budget}
              onChange={formaterInput(setBudget)}
              required
              className={inputKlasse}
              placeholder="fx 500.000 kr"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="har-nuvaerende"
              checked={harNuvaerende}
              onChange={(e) => setHarNuvaerende(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="har-nuvaerende" className="text-sm text-gray-700">
              Jeg ejer allerede en bolig
            </label>
          </div>

          {harNuvaerende && (
            <div className="grid grid-cols-2 gap-3 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boligens værdi</label>
                <input
                  type="text"
                  value={boligVaerdi}
                  onChange={formaterInput(setBoligVaerdi)}
                  className={inputKlasse}
                  placeholder="fx 2.500.000 kr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restgæld</label>
                <input
                  type="text"
                  value={gaeld}
                  onChange={formaterInput(setGaeld)}
                  className={inputKlasse}
                  placeholder="fx 1.800.000 kr"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drømmebolig */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Din drømmebolig</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mindstepris</label>
              <input
                type="text"
                value={dreommePrisMin}
                onChange={formaterInput(setDreommePrisMin)}
                required
                className={inputKlasse}
                placeholder="fx 3.000.000 kr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maksimumspris</label>
              <input
                type="text"
                value={dreommePrisMax}
                onChange={formaterInput(setDreommePrisMax)}
                required
                className={inputKlasse}
                placeholder="fx 4.500.000 kr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boligtype</label>
            <select
              value={droemmeType}
              onChange={(e) => setDroemmeType(e.target.value)}
              className={inputKlasse}
            >
              <option value="villa">Villa / Parcelhus</option>
              <option value="raekke">Rækkehus / Kædehus</option>
              <option value="lejlighed">Ejerlejlighed</option>
              <option value="sommerhus">Sommerhus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ønsket område (valgfrit)</label>
            <input
              type="text"
              value={droemmeOmraade}
              onChange={(e) => setDroemmeOmraade(e.target.value)}
              className={inputKlasse}
              placeholder="fx Nordsjælland, Aarhus, København..."
            />
          </div>
        </div>
      </div>

      <Button type="submit" indlaeser={indlaeser} size="lg" className="w-full">
        Beregn min boligrejse
      </Button>
    </form>
  )
}
