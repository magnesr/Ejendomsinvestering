'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PlanType } from '@/types/database'

interface TopBarProps {
  email: string
  fuldt_navn: string | null
  abonnementType: PlanType
}

const navPunkter = [
  { href: '/dashboard/oversigt', label: 'Oversigt' },
  { href: '/dashboard/boligvurdering', label: 'Boligvurdering' },
  { href: '/dashboard/boligrejse', label: 'Boligrejse' },
  { href: '/dashboard/portefolje', label: 'Portefølje', kravPlan: 'investor' as PlanType },
  { href: '/dashboard/markedsradar', label: 'Markedsradar' },
  { href: '/dashboard/skatteoverblik', label: 'Skatteoverblik' },
  { href: '/dashboard/sammenligning', label: 'Sammenligning' },
]

export function TopBar({ email, fuldt_navn, abonnementType }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuAaben, setMenuAaben] = useState(false)

  async function logUd() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initialer = fuldt_navn
    ? fuldt_navn.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email[0].toUpperCase()

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
        {/* Mobil: hamburger-knap */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          onClick={() => setMenuAaben(v => !v)}
          aria-label="Åbn menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuAaben
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>

        {/* Mobil: logo */}
        <Link href="/dashboard/oversigt" className="md:hidden font-bold text-gray-900">
          Boligpulsen
        </Link>

        {/* Desktop: tom venstre side (sidebar er synlig) */}
        <div className="hidden md:block" />

        {/* Højre side: bruger + log ud */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{fuldt_navn || email}</p>
            {fuldt_navn && <p className="text-xs text-gray-500">{email}</p>}
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-700">{initialer}</span>
          </div>
          <button
            onClick={logUd}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            title="Log ud"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobil dropdown-menu */}
      {menuAaben && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 space-y-0.5">
          {navPunkter.map(punkt => {
            const erLaast = punkt.kravPlan === 'investor' && abonnementType !== 'investor'
            const erAktiv = pathname === punkt.href || pathname.startsWith(punkt.href + '/')
            return (
              <Link
                key={punkt.href}
                href={erLaast ? '/priser?upgrade=investor' : punkt.href}
                onClick={() => setMenuAaben(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  erAktiv ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {punkt.label}
                {erLaast && (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <button onClick={logUd} className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              Log ud
            </button>
          </div>
        </div>
      )}
    </>
  )
}
