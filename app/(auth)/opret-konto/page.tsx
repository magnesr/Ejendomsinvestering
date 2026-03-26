'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function OpretKontoSide() {
  const [navn, setNavn] = useState('')
  const [email, setEmail] = useState('')
  const [kodeord, setKodeord] = useState('')
  const [fejl, setFejl] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)
  const [indlaeser, setIndlaeser] = useState(false)

  async function haandterOpret(e: React.FormEvent) {
    e.preventDefault()
    setFejl(null)
    setIndlaeser(true)

    if (kodeord.length < 8) {
      setFejl('Kodeordet skal være mindst 8 tegn.')
      setIndlaeser(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password: kodeord,
      options: {
        data: { fuldt_navn: navn },
        emailRedirectTo: `${window.location.origin}/dashboard/oversigt`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setFejl('Denne email er allerede registreret. Prøv at logge ind.')
      } else {
        setFejl('Noget gik galt. Prøv igen.')
      }
      setIndlaeser(false)
      return
    }

    setSucces(true)
  }

  if (succes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tjek din indbakke</h2>
            <p className="text-gray-600 mb-6">
              Vi har sendt en bekræftelsesmail til <strong>{email}</strong>. Klik på linket i emailen for at aktivere din konto.
            </p>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Tilbage til log ind
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Boligpulsen</h1>
          <p className="mt-2 text-gray-600">Opret gratis konto — 3 analyser inkluderet</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={haandterOpret} className="space-y-5">
            <div>
              <label htmlFor="navn" className="block text-sm font-medium text-gray-700 mb-1.5">
                Fuldt navn
              </label>
              <input
                id="navn"
                type="text"
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jens Jensen"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="din@email.dk"
              />
            </div>

            <div>
              <label htmlFor="kodeord" className="block text-sm font-medium text-gray-700 mb-1.5">
                Kodeord
              </label>
              <input
                id="kodeord"
                type="password"
                value={kodeord}
                onChange={(e) => setKodeord(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mindst 8 tegn"
              />
            </div>

            {fejl && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fejl}</p>
            )}

            <button
              type="submit"
              disabled={indlaeser}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {indlaeser ? 'Opretter konto...' : 'Opret gratis konto'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Ved at oprette en konto accepterer du vores{' '}
            <Link href="/vilkaar" className="text-blue-600 hover:text-blue-700">
              vilkår og betingelser
            </Link>
            .
          </p>

          <p className="mt-4 text-center text-sm text-gray-600">
            Har du allerede en konto?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log ind
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
