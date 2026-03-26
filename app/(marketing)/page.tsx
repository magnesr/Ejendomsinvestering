import Link from 'next/link'

export default function ForsidenSide() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigationsbar */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">Boligpulsen</span>
          <div className="flex items-center gap-4">
            <Link href="/priser" className="text-sm text-gray-600 hover:text-gray-900">Priser</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Log ind</Link>
            <Link
              href="/opret-konto"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Kom gratis i gang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Træf den rigtige<br />boligbeslutning
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          Boligpulsen analyserer boliger, beregner investeringsafkast og hjælper dig med at planlægge din vej til drømmeboligen — baseret på reelle markedsdata.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/opret-konto"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-lg"
          >
            Prøv gratis — 3 analyser inkluderet
          </Link>
          <Link
            href="/priser"
            className="px-8 py-3.5 text-gray-700 hover:text-gray-900 font-medium text-lg"
          >
            Se priser →
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">Intet kreditkort nødvendigt</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Alt hvad du behøver</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { titel: 'Boligvurdering', tekst: 'Få en investeringsscore fra 1-10 og estimeret salgspris om 3 og 5 år.' },
            { titel: 'Boligrejse-planlægning', tekst: 'Beregn den optimale vej fra din nuværende bolig til drømmeboligen.' },
            { titel: 'Portefølje-dashboard', tekst: 'Hold styr på alle dine ejendomme og se samlet værdistigning.' },
            { titel: 'Markedsradar', tekst: 'Modtag email-notifikationer når priserne i dit postnummer ændrer sig.' },
            { titel: 'Skatteoverblik', tekst: 'Se hvad boligen reelt koster per måned — ikke bare ydelsen.' },
            { titel: 'Sammenligningsværktøj', tekst: 'Sammenlign 2-3 boliger side om side og find den bedste investering.' },
          ].map((f) => (
            <div key={f.titel} className="p-6 bg-gray-50 rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-2">{f.titel}</h3>
              <p className="text-sm text-gray-600">{f.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-xs text-gray-400 max-w-2xl mx-auto">
          Alle beregninger er estimater baseret på offentligt tilgængelige markedsdata og udgør ikke finansiel rådgivning. Tal altid med en rådgiver ved store beslutninger.
        </p>
      </div>
    </div>
  )
}
