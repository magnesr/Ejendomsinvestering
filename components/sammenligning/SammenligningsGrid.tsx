'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { AdresseInput } from '@/components/boligvurdering/AdresseInput'
import { formaterKroner, formaterProcent } from '@/lib/utils/formattering'
import type { VurderingsResultat } from '@/types/api'

interface ValgtBolig {
  adresseId: string
  adresse: string
  postnummer: string
  by: string
  listepris?: number
}

export function SammenligningsGrid() {
  const [boliger, setBoliger] = useState<ValgtBolig[]>([{}] as ValgtBolig[])
  const [listeprisInput, setListeprisInput] = useState<string[]>([''])
  const [resultater, setResultater] = useState<(VurderingsResultat | null)[]>([])
  const [indlaeser, setIndlaeser] = useState(false)
  const [fejl, setFejl] = useState<string | null>(null)

  function tilfoejBolig() {
    if (boliger.length >= 3) return
    setBoliger([...boliger, {} as ValgtBolig])
    setListeprisInput([...listeprisInput, ''])
  }

  function opdaterAdresse(index: number, adresse: ValgtBolig) {
    const nyeBoliger = [...boliger]
    nyeBoliger[index] = adresse
    setBoliger(nyeBoliger)
  }

  async function sammenlign() {
    const gyldige = boliger.filter(b => b.adresseId)
    if (gyldige.length < 2) {
      setFejl('Vælg mindst 2 boliger for at sammenligne')
      return
    }

    setFejl(null)
    setIndlaeser(true)

    const svar = await Promise.all(
      gyldige.map((b, i) =>
        fetch('/api/boligvurdering', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...b,
            listepris: listeprisInput[i] ? parseInt(listeprisInput[i].replace(/\D/g, '')) : undefined,
          }),
        }).then(r => r.ok ? r.json() : null)
      )
    )

    setResultater(svar)
    setIndlaeser(false)
  }

  const bedsteScore = resultater.length > 0
    ? Math.max(...resultater.filter(Boolean).map(r => r!.investerings_score))
    : 0

  return (
    <div className="space-y-6">
      {/* Adresse-inputs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-medium text-gray-900">Tilføj boliger til sammenligning (2-3 stk.)</h3>
        {boliger.map((_, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bolig {i + 1}</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <AdresseInput onValgt={(a) => opdaterAdresse(i, a as ValgtBolig)} />
              </div>
              <input
                type="text"
                placeholder="Listepris"
                value={listeprisInput[i]}
                onChange={(e) => {
                  const ny = [...listeprisInput]
                  ny[i] = e.target.value.replace(/\D/g, '')
                    ? parseInt(e.target.value.replace(/\D/g, '')).toLocaleString('da-DK')
                    : ''
                  setListeprisInput(ny)
                }}
                className="w-36 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3">
          {boliger.length < 3 && (
            <button
              type="button"
              onClick={tilfoejBolig}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Tilføj endnu en bolig
            </button>
          )}
          <Button onClick={sammenlign} indlaeser={indlaeser} className="ml-auto">
            Sammenlign boliger
          </Button>
        </div>

        {fejl && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{fejl}</p>}
      </div>

      {/* Sammenligningstabel */}
      {resultater.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Kategori</th>
                {resultater.filter(Boolean).map((r, i) => (
                  <th key={i} className="text-left px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-32">{r!.adresse.split(',')[0]}</span>
                      {r!.investerings_score === bedsteScore && (
                        <Badge variant="groen">Bedste</Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Investeringsscore</td>
                {resultater.filter(Boolean).map((r, i) => (
                  <td key={i} className="px-4 py-3">
                    <ScoreRing score={r!.investerings_score} size="sm" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Estimeret markedsværdi</td>
                {resultater.filter(Boolean).map((r, i) => (
                  <td key={i} className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formaterKroner(r!.beregnet_vaerdi)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Forventet stigning (3 år)</td>
                {resultater.filter(Boolean).map((r, i) => (
                  <td key={i} className="px-4 py-3 text-sm text-green-700 font-medium">
                    +{formaterKroner(r!.prognose_3_aar - r!.beregnet_vaerdi)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Lejeafkast</td>
                {resultater.filter(Boolean).map((r, i) => (
                  <td key={i} className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formaterProcent(r!.lejeafkast_pct)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Estimeret husleje</td>
                {resultater.filter(Boolean).map((r, i) => (
                  <td key={i} className="px-4 py-3 text-sm text-gray-900">
                    {formaterKroner(r!.estimeret_husleje)}/md
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Boligtype</td>
                {resultater.filter(Boolean).map((r, i) => (
                  <td key={i} className="px-4 py-3 text-sm text-gray-600">
                    {r!.bbr.boligtype} · {r!.bbr.areal_kvm} m²
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700">Anbefaling</td>
                {resultater.filter(Boolean).map((r, i) => (
                  <td key={i} className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                    {r!.anbefalings_tekst?.slice(0, 120)}...
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
