'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  onTilfoej: (postnummer: string, boligtype: string, notifikationEmail: boolean) => Promise<void>
}

const BOLIGTYPER = [
  { value: 'alle', label: 'Alle typer' },
  { value: 'villa', label: 'Villa / Hus' },
  { value: 'ejerlejlighed', label: 'Ejerlejlighed' },
  { value: 'raekkehus', label: 'Rækkehus' },
]

export function PostnummerOpsaetning({ onTilfoej }: Props) {
  const [postnummer, setPostnummer] = useState('')
  const [boligtype, setBoligtype] = useState('alle')
  const [notifikationEmail, setNotifikationEmail] = useState(true)
  const [tilfojer, setTilfojer] = useState(false)
  const [fejl, setFejl] = useState<string | null>(null)

  async function haandterTilfoej(e: React.FormEvent) {
    e.preventDefault()
    if (postnummer.length !== 4 || !/^\d{4}$/.test(postnummer)) {
      setFejl('Indtast et gyldigt 4-cifret postnummer')
      return
    }
    setFejl(null)
    setTilfojer(true)
    await onTilfoej(postnummer, boligtype, notifikationEmail)
    setPostnummer('')
    setBoligtype('alle')
    setTilfojer(false)
  }

  return (
    <form onSubmit={haandterTilfoej} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h3 className="font-medium text-gray-900">Tilføj postnummer til overvågning</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postnummer</label>
          <input
            type="text"
            value={postnummer}
            onChange={e => setPostnummer(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="fx 2200"
            maxLength={4}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Boligtype</label>
          <select
            value={boligtype}
            onChange={e => setBoligtype(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {BOLIGTYPER.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button type="submit" indlaeser={tilfojer} className="w-full">
            Tilføj radar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="emailNotif"
          checked={notifikationEmail}
          onChange={e => setNotifikationEmail(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="emailNotif" className="text-sm text-gray-600">
          Send email ved prisændringer over 2%
        </label>
      </div>

      {fejl && <p className="text-sm text-red-600">{fejl}</p>}
    </form>
  )
}
