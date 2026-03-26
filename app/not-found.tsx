import Link from 'next/link'

export default function IkkeFundet() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6">
        <span className="text-4xl">🏠</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Side ikke fundet</h1>
      <p className="text-gray-600 mb-8 max-w-sm">Den side du leder efter eksisterer ikke eller er blevet flyttet.</p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
        >
          Forside
        </Link>
        <Link
          href="/dashboard/oversigt"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Gå til dashboard
        </Link>
      </div>
    </div>
  )
}
