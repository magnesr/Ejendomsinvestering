'use client'

import { useState } from 'react'
import { AdresseInput } from './AdresseInput'
import { VurderingsResultat } from './VurderingsResultat'
import { Button } from '@/components/ui/Button'
import type { VurderingsResultat as VurderingsResultatType } from '@/types/api'

interface ValgtAdresse {
  adresseId: string
  adresse: string
  postnummer: string
  by: string
}

export function BoligvurderingFormular() {
  const [valgtAdresse, setValgtAdresse] = useState<ValgtAdresse | null>(null)
  const [listepris, setListepris] = useState('')
  const [resultat, setResultat] = useState<VurderingsResultatType | null>(null)
  const [fejl, setFejl] = useState<string | null>(null)
  const [indlaeser, setIndlaeser] = useState(false)

  async function udfoerVurdering() {
    if (!valgtAdresse) return
    setFejl(null)
    setResultat(null)
    setIndlaeser(true)

    try {
      const svar = await fetch('/api/boligvurdering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...valgtAdresse,
          listepris: listepris ? parseInt(listepris.replace(/\D/g, '')) : undefined,
        }),
      })

      const data = await svar.json()

      if (!svar.ok) {
        if (data.fejl === 'FREEMIUM_LIMIT') {
          setFejl('Du har brugt dine 3 gratis analyser denne måned. Opgrader for ubegrænset adgang.')
        } else {
          setFejl(data.besked ?? 'Noget gik galt. Prøv igen.')
        }
        return
      }

      setResultat(data)
    } catch {
      setFejl('Kunne ikke forbinde til serveren. Prøv igen.')
    } finally {
      setIndlaeser(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Input-formular */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <AdresseInput onValgt={setValgtAdresse} indlaeser={indlaeser} />

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={listepris}
              onChange={(e) => {
                const kun_tal = e.target.value.replace(/\D/g, '')
                setListepris(kun_tal ? parseInt(kun_tal).toLocaleString('da-DK') : '')
              }}
              placeholder="Listepris (valgfrit) — fx 3.200.000 kr"
              className="w-full px-3.5 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={udfoerVurdering}
            disabled={!valgtAdresse || indlaeser}
            indlaeser={indlaeser}
            size="lg"
          >
            Analyser
          </Button>
        </div>

        {valgtAdresse && !resultat && !indlaeser && (
          <p className="text-sm text-green-600">
            Adresse valgt: <strong>{valgtAdresse.adresse}</strong>
          </p>
        )}

        {fejl && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{fejl}</p>
        )}

        {indlaeser && (
          <div className="py-8 text-center">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Henter bygningsdata og markedsdata...</span>
            </div>
          </div>
        )}
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <VurderingsResultat resultat={resultat} />
        </div>
      )}
    </div>
  )
}
