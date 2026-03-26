'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formaterKroner } from '@/lib/utils/formattering'
import { beregnMaanedsydelse, beregnMaanedligGrundskyld } from '@/lib/engines/lejeafkast'

interface Resultat {
  koebesum: number
  udbetaling: number
  laanBeloeb: number
  maanedligYdelse: number
  maanedligGrundskyld: number
  ejendomsvaerdiSkat: number
  anslaaeteDriftsomkostninger: number
  samletMaanedligOmkostning: number
}

export function OmkostningsBeregner() {
  const [koebesum, setKoebesum] = useState('')
  const [offentligVurdering, setOffentligVurdering] = useState('')
  const [grundskyldspromille, setGrundskyldspromille] = useState('26')
  const [resultat, setResultat] = useState<Resultat | null>(null)

  function parseKr(str: string) { return parseInt(str.replace(/\D/g, '')) || 0 }
  function formaterInput(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const tal = e.target.value.replace(/\D/g, '')
      setter(tal ? parseInt(tal).toLocaleString('da-DK') : '')
    }
  }

  function beregn(e: React.FormEvent) {
    e.preventDefault()
    const pris = parseKr(koebesum)
    const vurdering = parseKr(offentligVurdering) || pris * 0.85 // Fallback: 85% af købesum
    const promille = parseFloat(grundskyldspromille) || 26

    const udbetaling = pris * 0.20
    const laanBeloeb = pris - udbetaling
    const maanedligYdelse = beregnMaanedsydelse(laanBeloeb)
    const maanedligGrundskyld = beregnMaanedligGrundskyld(vurdering, promille)
    const ejendomsvaerdiSkat = Math.round((vurdering * 0.0092) / 12) // 0,92% ejendomsværdiskat
    const driftsomkostninger = Math.round(pris * 0.01 / 12) // Ca. 1% af boligværdi per år

    setResultat({
      koebesum: pris,
      udbetaling,
      laanBeloeb,
      maanedligYdelse,
      maanedligGrundskyld,
      ejendomsvaerdiSkat,
      anslaaeteDriftsomkostninger: driftsomkostninger,
      samletMaanedligOmkostning: maanedligYdelse + maanedligGrundskyld + ejendomsvaerdiSkat + driftsomkostninger,
    })
  }

  const inputKlasse = "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={beregn} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Købesum</label>
          <input type="text" value={koebesum} onChange={formaterInput(setKoebesum)} required className={inputKlasse} placeholder="fx 3.200.000 kr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Offentlig ejendomsvurdering <span className="text-gray-400 text-xs">(lad stå tomt = 85% af købesum)</span>
          </label>
          <input type="text" value={offentligVurdering} onChange={formaterInput(setOffentligVurdering)} className={inputKlasse} placeholder="fx 2.700.000 kr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grundskyldspromille <span className="text-gray-400 text-xs">(landsgennemsnit ca. 26‰)</span>
          </label>
          <input
            type="number"
            value={grundskyldspromille}
            onChange={(e) => setGrundskyldspromille(e.target.value)}
            step="0.1"
            className={inputKlasse}
            placeholder="26"
          />
        </div>
        <Button type="submit" className="w-full">Beregn månedlig omkostning</Button>
      </form>

      {resultat && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Månedlig omkostning</h3>
          <div className="space-y-2">
            {[
              { label: 'Realkreditydelse (30 år)', value: resultat.maanedligYdelse, fremhæv: false },
              { label: 'Grundskyld', value: resultat.maanedligGrundskyld, fremhæv: false },
              { label: 'Ejendomsværdiskat', value: resultat.ejendomsvaerdiSkat, fremhæv: false },
              { label: 'Anslåede driftsomkostninger', value: resultat.anslaaeteDriftsomkostninger, fremhæv: false },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">{formaterKroner(value)}/md</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">Samlet månedlig omkostning</span>
              <span className="text-xl font-bold text-blue-700">{formaterKroner(resultat.samletMaanedligOmkostning)}/md</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Beregningen antager 20% udbetaling og nuværende realkreditrente. Alle tal er estimater.
          </p>
        </Card>
      )}
    </div>
  )
}
