'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function GlemtKodeordSide() {
  const [email, setEmail] = useState('')
  const [sendt, setSendt] = useState(false)
  const [fejl, setFejl] = useState<string | null>(null)
  const [indlaeser, setIndlaeser] = useState(false)

  async function haandterNulstil(e: React.FormEvent) {
    e.preventDefault()
    setFejl(null)
    setIndlaeser(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/skift-kodeord`,
    })

    if (error) {
      setFejl('Noget gik galt. Prøv igen.')
      setIndlaeser(false)
      return
    }

    setSendt(true)
  }

  if (sendt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email sendt</h2>
            <p className="text-gray-600 mb-6">
              Hvis <strong>{email}</strong> er registreret, har vi sendt et link til nulstilling af kodeord.
            </p>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
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
          <p className="mt-2 text-gray-600">Nulstil dit kodeord</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={haandterNulstil} className="space-y-5">
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

            {fejl && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fejl}</p>
            )}

            <button
              type="submit"
              disabled={indlaeser}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {indlaeser ? 'Sender...' : 'Send nulstillingslink'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Tilbage til log ind
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
