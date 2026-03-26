'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EjendomKort } from './EjendomKort'
import { VaerdiUdvikling } from './VaerdiUdvikling'
import { TilfoejEjendomModal } from './TilfoejEjendomModal'
import { formaterKroner, formaterProcent } from '@/lib/utils/formattering'

interface Ejendom {
  id: string
  adresse: string
  postnummer: string
  by: string
  koebspris: number
  koebsdato: string
  seneste_vaerdi: number
  prognose_1_aar?: number
  prognose_3_aar?: number
  prognose_5_aar?: number
  estimeret_husleje: number
  lejeafkast_pct: number
  er_udlejningsejendom: boolean
}

export function PortefoljeOversigt() {
  const [ejendomme, setEjendomme] = useState<Ejendom[]>([])
  const [visModal, setVisModal] = useState(false)
  const [indlaeser, setIndlaeser] = useState(true)
  const [hentet, setHentet] = useState(false)

  // Hent ved første render
  if (!hentet && typeof window !== 'undefined') {
    setHentet(true)
    fetch('/api/portefolje')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEjendomme(data)
        setIndlaeser(false)
      })
      .catch(() => setIndlaeser(false))
  }

  async function tilfoejEjendom(data: Omit<Ejendom, 'id'>) {
    const svar = await fetch('/api/portefolje', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (svar.ok) {
      const ny = await svar.json()
      setEjendomme(prev => [ny, ...prev])
    }
    setVisModal(false)
  }

  async function sletEjendom(id: string) {
    await fetch(`/api/portefolje?id=${id}`, { method: 'DELETE' })
    setEjendomme(prev => prev.filter(e => e.id !== id))
  }

  const totalKoebspris = ejendomme.reduce((sum, e) => sum + e.koebspris, 0)
  const totalVaerdi = ejendomme.reduce((sum, e) => sum + e.seneste_vaerdi, 0)
  const totalStigningKr = totalVaerdi - totalKoebspris
  const totalStigningPct = totalKoebspris > 0 ? (totalStigningKr / totalKoebspris) * 100 : 0
  const udlejningsEjendomme = ejendomme.filter(e => e.er_udlejningsejendom)
  const totalMaanedslejeindtaegt = udlejningsEjendomme.reduce((sum, e) => sum + e.estimeret_husleje, 0)

  // Simpel tidslinje: købspriser og nuværende værdier
  const udviklingsData = ejendomme.length > 0
    ? [
        { label: 'Køb', vaerdi: totalKoebspris },
        ...(ejendomme[0]?.prognose_1_aar ? [{ label: '1 år', vaerdi: ejendomme.reduce((s, e) => s + (e.prognose_1_aar ?? e.seneste_vaerdi), 0) }] : []),
        { label: 'Nu', vaerdi: totalVaerdi },
        ...(ejendomme[0]?.prognose_3_aar ? [{ label: '3 år', vaerdi: ejendomme.reduce((s, e) => s + (e.prognose_3_aar ?? e.seneste_vaerdi), 0) }] : []),
        ...(ejendomme[0]?.prognose_5_aar ? [{ label: '5 år', vaerdi: ejendomme.reduce((s, e) => s + (e.prognose_5_aar ?? e.seneste_vaerdi), 0) }] : []),
      ]
    : []

  if (indlaeser) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Samlet oversigt */}
      {ejendomme.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card padding="sm">
              <p className="text-xs text-gray-500 mb-1">Samlet porteføljeværdi</p>
              <p className="text-lg font-bold text-gray-900">{formaterKroner(totalVaerdi)}</p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-gray-500 mb-1">Total værdistigning</p>
              <p className={`text-lg font-bold ${totalStigningKr >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {totalStigningKr >= 0 ? '+' : ''}{formaterKroner(totalStigningKr)}
              </p>
              <p className="text-xs text-gray-400">
                {totalStigningKr >= 0 ? '+' : ''}{totalStigningPct.toFixed(1).replace('.', ',')} %
              </p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-gray-500 mb-1">Antal ejendomme</p>
              <p className="text-lg font-bold text-gray-900">{ejendomme.length}</p>
              {udlejningsEjendomme.length > 0 && (
                <p className="text-xs text-gray-400">{udlejningsEjendomme.length} udlejning</p>
              )}
            </Card>
            {totalMaanedslejeindtaegt > 0 && (
              <Card padding="sm">
                <p className="text-xs text-gray-500 mb-1">Lejeindtægt/md</p>
                <p className="text-lg font-bold text-blue-700">{formaterKroner(totalMaanedslejeindtaegt)}</p>
              </Card>
            )}
          </div>

          {udviklingsData.length >= 2 && (
            <VaerdiUdvikling data={udviklingsData} />
          )}
        </>
      )}

      {/* Ejendomme */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {ejendomme.length === 0 ? 'Din portefølje er tom' : `${ejendomme.length} ejendom${ejendomme.length !== 1 ? 'me' : ''}`}
        </h3>
        <Button onClick={() => setVisModal(true)}>+ Tilføj ejendom</Button>
      </div>

      {ejendomme.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-2">Tilføj dine ejendomme og hold styr på din formue</p>
          <button
            onClick={() => setVisModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Tilføj din første ejendom
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ejendomme.map(e => (
            <EjendomKort key={e.id} ejendom={e} onSlet={sletEjendom} />
          ))}
        </div>
      )}

      {visModal && (
        <TilfoejEjendomModal
          onGem={tilfoejEjendom}
          onLuk={() => setVisModal(false)}
        />
      )}
    </div>
  )
}
