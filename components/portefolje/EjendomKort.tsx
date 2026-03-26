'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { formaterKroner, formaterProcent, formaterDato } from '@/lib/utils/formattering'

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

interface EjendomKortProps {
  ejendom: Ejendom
  onSlet: (id: string) => void
}

export function EjendomKort({ ejendom, onSlet }: EjendomKortProps) {
  const vaerdiStigningKr = ejendom.seneste_vaerdi - ejendom.koebspris
  const vaerdiStigningPct = (vaerdiStigningKr / ejendom.koebspris) * 100
  const erStiget = vaerdiStigningKr >= 0

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{ejendom.adresse}</h3>
          <p className="text-sm text-gray-500">{ejendom.postnummer} {ejendom.by}</p>
          <p className="text-xs text-gray-400 mt-0.5">Købt {formaterDato(ejendom.koebsdato)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {ejendom.er_udlejningsejendom && (
            <Badge variant="blaa">Udlejning</Badge>
          )}
          <button
            onClick={() => onSlet(ejendom.id)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            title="Fjern fra portefølje"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-0.5">Købspris</p>
          <p className="text-sm font-semibold text-gray-900">{formaterKroner(ejendom.koebspris)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-0.5">Nuværende værdi</p>
          <p className="text-sm font-semibold text-gray-900">{formaterKroner(ejendom.seneste_vaerdi)}</p>
        </div>
        <div className={`rounded-xl p-3 ${erStiget ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-xs text-gray-500 mb-0.5">Værdistigning</p>
          <p className={`text-sm font-semibold ${erStiget ? 'text-green-700' : 'text-red-600'}`}>
            {erStiget ? '+' : ''}{formaterKroner(vaerdiStigningKr)}
            <span className="text-xs ml-1 font-normal">
              ({erStiget ? '+' : ''}{vaerdiStigningPct.toFixed(1).replace('.', ',')} %)
            </span>
          </p>
        </div>
        {ejendom.er_udlejningsejendom && (
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">Lejeafkast</p>
            <p className="text-sm font-semibold text-blue-700">{formaterProcent(ejendom.lejeafkast_pct)}</p>
            <p className="text-xs text-gray-500">{formaterKroner(ejendom.estimeret_husleje)}/md</p>
          </div>
        )}
        {!ejendom.er_udlejningsejendom && ejendom.prognose_3_aar && (
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">Prognose (3 år)</p>
            <p className="text-sm font-semibold text-purple-700">{formaterKroner(ejendom.prognose_3_aar)}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
