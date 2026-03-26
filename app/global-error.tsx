'use client'

export default function GlobalFejl({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center font-sans">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Uventet fejl</h2>
        <p className="text-gray-600 mb-6">Noget gik galt. Siden prøver at komme online igen.</p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Prøv igen
        </button>
      </body>
    </html>
  )
}
