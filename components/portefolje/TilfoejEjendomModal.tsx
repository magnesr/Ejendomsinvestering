'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AdresseInput } from '@/components/boligvurdering/AdresseInput'

interface EjendomData {
  adresse: string
  postnummer: string
  by: string
  koebspris: number
  koebsdato: string
  seneste_vaerdi: number
  estimeret_husleje: number
  lejeafkast_pct: number
  er_udlejningsejendom: boolean
}

interface Props {
  onGem: (data: EjendomData) => Promise<void>
  onLuk: () => void
}

export function TilfoejEjendomModal({ onGem, onLuk }: Props) {
  const [valgtAdresse, setValgtAdresse] = useState<{ adresseId: string; adresse: string; postnummer: string; by: string } | null>(null)
  const [koebspris, setKoebspris] = useState('')
  const [koebsdato, setKoebsdato] = useState('')
  const [erUdlejning, setErUdlejning] = useState(false)
  const [husleje, setHusleje] = useState('')
  const [gemmer, setGemmer] = useState(false)

  function parseKr(str: string) { return parseInt(str.replace(/\D/g, '')) || 0 }
  function formaterInput(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const tal = e.target.value.replace(/\D/g, '')
      setter(tal ? parseInt(tal).toLocaleString('da-DK') : '')
    }
  }

  async function haandterGem(e: React.FormEvent) {
    e.preventDefault()
    if (!valgtAdresse) return
    setGemmer(true)
    const pris = parseKr(koebspris)
    const huslejeKr = parseKr(husleje)
    await onGem({
      adresse: valgtAdresse.adresse,
      postnummer: valgtAdresse.postnummer,
      by: valgtAdresse.by,
      koebspris: pris,
      koebsdato,
      seneste_vaerdi: pris,
      estimeret_husleje: huslejeKr,
      lejeafkast_pct: pris > 0 && huslejeKr > 0 ? (huslejeKr * 12 * 0.85 / pris) * 100 : 0,
      er_udlejningsejendom: erUdlejning,
    })
    setGemmer(false)
  }

  const inputKlasse = "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tilføj ejendom</h2>
          <button onClick={onLuk} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={haandterGem} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <AdresseInput onValgt={(a) => setValgtAdresse(a as typeof valgtAdresse)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Købspris</label>
              <input
                type="text"
                value={koebspris}
                onChange={formaterInput(setKoebspris)}
                required
                placeholder="fx 2.500.000"
                className={inputKlasse}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Købsdato</label>
              <input
                type="date"
                value={koebsdato}
                onChange={e => setKoebsdato(e.target.value)}
                required
                className={inputKlasse}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="udlejning"
              checked={erUdlejning}
              onChange={e => setErUdlejning(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="udlejning" className="text-sm text-gray-700">Udlejningsejendom</label>
          </div>

          {erUdlejning && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Månedlig husleje</label>
              <input
                type="text"
                value={husleje}
                onChange={formaterInput(setHusleje)}
                placeholder="fx 12.000"
                className={inputKlasse}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onLuk}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuller
            </button>
            <Button type="submit" indlaeser={gemmer} className="flex-1" disabled={!valgtAdresse}>
              Gem ejendom
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
