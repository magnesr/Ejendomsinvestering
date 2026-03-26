'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginSide() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [kodeord, setKodeord] = useState('')
  const [fejl, setFejl] = useState<string | null>(null)
  const [indlaeser, setIndlaeser] = useState(false)

  async function haandterLogin(e: React.FormEvent) {
    e.preventDefault()
    setFejl(null)
    setIndlaeser(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: kodeord,
    })

    if (error) {
      setFejl('Forkert email eller kodeord. Prøv igen.')
      setIndlaeser(false)
      return
    }

    router.push('/dashboard/oversigt')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Boligpulsen</h1>
          <p className="mt-2 text-gray-600">Log ind på din konto</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={haandterLogin} className="space-y-5">
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
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="kodeord" className="block text-sm font-medium text-gray-700">
                  Kodeord
                </label>
                <Link
                  href="/glemt-kodeord"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Glemt kodeord?
                </Link>
              </div>
              <input
                id="kodeord"
                type="password"
                value={kodeord}
                onChange={(e) => setKodeord(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
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
              {indlaeser ? 'Logger ind...' : 'Log ind'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Har du ikke en konto?{' '}
            <Link href="/opret-konto" className="text-blue-600 hover:text-blue-700 font-medium">
              Opret gratis konto
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
