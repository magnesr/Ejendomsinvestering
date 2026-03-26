import Link from 'next/link'
import type { PlanType } from '@/types/database'

interface FreemiumGateProps {
  abonnementType: PlanType
  abonnementStatus: string
  analyserBrugt: number
  children: React.ReactNode
  kravPlan?: PlanType
}

export function FreemiumGate({
  abonnementType,
  abonnementStatus,
  analyserBrugt,
  children,
  kravPlan = 'boligkoeber',
}: FreemiumGateProps) {
  const erAktivAbonnent =
    abonnementType !== 'freemium' && abonnementStatus === 'aktiv'

  const harAdgang =
    erAktivAbonnent ||
    (abonnementType === 'freemium' && analyserBrugt < 3)

  if (!harAdgang) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {abonnementType === 'freemium'
            ? 'Du har brugt dine 3 gratis analyser denne måned'
            : 'Denne funktion kræver et abonnement'}
        </h3>
        <p className="text-gray-600 max-w-sm mb-6">
          {abonnementType === 'freemium'
            ? 'Opgrader til et abonnement for ubegrænset adgang, eller vent til næste måned.'
            : 'Opgrader dit abonnement for at få adgang til denne funktion.'}
        </p>
        <Link
          href={`/priser${kravPlan === 'investor' ? '?upgrade=investor' : ''}`}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Se abonnementspriser
        </Link>
      </div>
    )
  }

  return (
    <>
      {abonnementType === 'freemium' && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
          <p className="text-sm text-blue-800">
            Du har brugt <strong>{analyserBrugt} af 3</strong> gratis analyser denne måned.
          </p>
          <Link href="/priser" className="text-sm font-medium text-blue-700 hover:text-blue-800 underline">
            Opgrader
          </Link>
        </div>
      )}
      {children}
    </>
  )
}
