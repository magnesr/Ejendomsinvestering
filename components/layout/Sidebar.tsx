'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PlanType } from '@/types/database'

interface SidebarProps {
  abonnementType: PlanType
}

const navPunkter = [
  {
    href: '/dashboard/oversigt',
    label: 'Oversigt',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    kravPlan: null,
  },
  {
    href: '/dashboard/boligvurdering',
    label: 'Boligvurdering',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    kravPlan: null,
  },
  {
    href: '/dashboard/boligrejse',
    label: 'Boligrejse',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    kravPlan: null,
  },
  {
    href: '/dashboard/portefolje',
    label: 'Portefølje',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    kravPlan: 'investor' as PlanType,
  },
  {
    href: '/dashboard/markedsradar',
    label: 'Markedsradar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    kravPlan: null,
  },
  {
    href: '/dashboard/skatteoverblik',
    label: 'Skatteoverblik',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    kravPlan: null,
  },
  {
    href: '/dashboard/sammenligning',
    label: 'Sammenligning',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    kravPlan: null,
  },
]

export function Sidebar({ abonnementType }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/dashboard/oversigt" className="text-xl font-bold text-gray-900">
          Boligpulsen
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navPunkter.map((punkt) => {
          const erAktiv = pathname === punkt.href || pathname.startsWith(punkt.href + '/')
          const erLaast = punkt.kravPlan === 'investor' && abonnementType !== 'investor'

          return (
            <Link
              key={punkt.href}
              href={erLaast ? '/priser?upgrade=investor' : punkt.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${erAktiv
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className={erAktiv ? 'text-blue-600' : 'text-gray-400'}>
                {punkt.icon}
              </span>
              {punkt.label}
              {erLaast && (
                <svg className="w-3.5 h-3.5 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Plan-badge */}
      <div className="px-4 py-4 border-t border-gray-100">
        {abonnementType === 'freemium' && (
          <Link href="/priser" className="block w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Opgrader konto
          </Link>
        )}
        {abonnementType === 'boligkoeber' && (
          <Link href="/priser?upgrade=investor" className="block w-full text-center py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
            Opgrader til Investor
          </Link>
        )}
        {abonnementType === 'investor' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-medium text-purple-700">Investor-plan aktiv</span>
          </div>
        )}
      </div>
    </aside>
  )
}
