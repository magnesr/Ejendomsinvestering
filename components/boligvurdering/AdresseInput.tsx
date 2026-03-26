'use client'

import { useState, useRef, useEffect } from 'react'
import { erBoligURL, parseBoligURL } from '@/lib/utils/adresseParser'

interface Forslag {
  tekst: string
  id: string
  adgangsadresse_id: string
  postnr: string
  postnrnavn: string
}

interface ValgtAdresse {
  adresseId: string
  adresse: string
  postnummer: string
  by: string
}

interface AdresseInputProps {
  onValgt: (adresse: ValgtAdresse) => void
  indlaeser?: boolean
}

export function AdresseInput({ onValgt, indlaeser = false }: AdresseInputProps) {
  const [vaerdi, setVaerdi] = useState('')
  const [forslag, setForslag] = useState<Forslag[]>([])
  const [visForslag, setVisForslag] = useState(false)
  const [soeger, setSoeger] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (vaerdi.length < 3) {
      setForslag([])
      return
    }

    if (erBoligURL(vaerdi)) {
      // URL-input: parse adresse og søg
      const parsedAdresse = parseBoligURL(vaerdi)
      if (parsedAdresse) soegAdresse(parsedAdresse)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => soegAdresse(vaerdi), 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [vaerdi])

  async function soegAdresse(tekst: string) {
    setSoeger(true)
    try {
      const svar = await fetch(
        `https://api.dataforsyningen.dk/autocomplete?q=${encodeURIComponent(tekst)}&type=adresse&per_side=8`
      )
      if (!svar.ok) return

      const data = await svar.json()
      const resultater: Forslag[] = data.map((item: Record<string, unknown>) => {
        const adresseData = item.data as Record<string, unknown>
        const adgangs = adresseData?.adgangsadresse as Record<string, unknown>
        const postnummer = adgangs?.postnummer as Record<string, unknown>
        return {
          tekst: item.tekst as string,
          id: adresseData?.id as string ?? '',
          adgangsadresse_id: adgangs?.id as string ?? '',
          postnr: postnummer?.nr as string ?? '',
          postnrnavn: postnummer?.navn as string ?? '',
        }
      })
      setForslag(resultater)
      setVisForslag(resultater.length > 0)
    } finally {
      setSoeger(false)
    }
  }

  function vaelgForslag(forslag: Forslag) {
    setVaerdi(forslag.tekst)
    setVisForslag(false)
    onValgt({
      adresseId: forslag.adgangsadresse_id,
      adresse: forslag.tekst,
      postnummer: forslag.postnr,
      by: forslag.postnrnavn,
    })
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={vaerdi}
          onChange={(e) => setVaerdi(e.target.value)}
          onFocus={() => forslag.length > 0 && setVisForslag(true)}
          onBlur={() => setTimeout(() => setVisForslag(false), 150)}
          disabled={indlaeser}
          placeholder="Indtast adresse eller URL fra Boligsiden/Ejendomstorvet..."
          className="w-full px-4 py-3.5 pr-12 text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {soeger || indlaeser ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Forslagsliste */}
      {visForslag && forslag.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {forslag.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onMouseDown={() => vaelgForslag(f)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
              >
                <span className="text-gray-900">{f.tekst}</span>
                {f.postnr && (
                  <span className="ml-1 text-gray-400">{f.postnr} {f.postnrnavn}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
