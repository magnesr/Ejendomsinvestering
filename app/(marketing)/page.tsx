import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Boligpulsen — Smarte boligbeslutninger med data',
  description: 'Analyser en bolig på sekunder. Få investeringsscore, lejeafkast og 5-årig prognose baseret på BBR, Danmarks Statistik og historiske handelspriser. Prøv gratis.',
  openGraph: {
    title: 'Boligpulsen — Smarte boligbeslutninger med data',
    description: 'Analyser en bolig på sekunder. Investeringsscore, lejeafkast og 5-årig prognose. Prøv gratis.',
    type: 'website',
    locale: 'da_DK',
  },
}

const FEATURES = [
  {
    ikon: '📊',
    titel: 'Boligvurdering',
    tekst: 'Investeringsscore 1-10, estimeret markedsværdi og 5-årig prognose baseret på BBR-data og handelspriser.',
    farve: 'bg-blue-50 border-blue-100',
  },
  {
    ikon: '🗺️',
    titel: 'Boligrejse-planlægning',
    tekst: 'Beregn den optimale vej fra din nuværende bolig til drømmeboligen — trin for trin med årstal.',
    farve: 'bg-green-50 border-green-100',
  },
  {
    ikon: '🏢',
    titel: 'Portefølje-dashboard',
    tekst: 'Samlet overblik over dine investeringsejendomme. Se total værdistigning og lejeindtægt.',
    farve: 'bg-purple-50 border-purple-100',
  },
  {
    ikon: '📡',
    titel: 'Markedsradar',
    tekst: 'Opsæt automatisk overvågning af postnumre. Få email-notifikation ved prisændringer over 2%.',
    farve: 'bg-yellow-50 border-yellow-100',
  },
  {
    ikon: '🧾',
    titel: 'Skatteoverblik',
    tekst: 'Se hvad boligen reelt koster per måned — ydelse, grundskyld, ejendomsværdiskat og drift samlet.',
    farve: 'bg-orange-50 border-orange-100',
  },
  {
    ikon: '⚖️',
    titel: 'Sammenligningsværktøj',
    tekst: 'Sammenlign 2-3 boliger side om side. Find automatisk den bedste investering.',
    farve: 'bg-indigo-50 border-indigo-100',
  },
]

const FAQ = [
  {
    q: 'Hvad er datakilden bag analyserne?',
    a: 'Vi henter data fra BBR (Bygnings- og Boligregistret), Danmarks Statistik, DAWA og historiske handelspriser via Tinglysning — alle officielle, offentligt tilgængelige registre.',
  },
  {
    q: 'Hvad er forskellen på Boligkøber og Investor?',
    a: 'Boligkøber giver ubegrænsede analyser og alle 6 features. Investor tilføjer portefølje-dashboard til at holde styr på flere ejendomme og er beregnet til dem der allerede ejer eller planlægger at eje udlejningsejendomme.',
  },
  {
    q: 'Er beregningerne præcise?',
    a: 'Alle tal er estimater baseret på statistik og historisk markedsdata — ikke officielle vurderinger. De er vejledende og udgør ikke finansiel rådgivning. Tal altid med en professionel rådgiver ved store beslutninger.',
  },
  {
    q: 'Kan jeg afmelde mit abonnement?',
    a: 'Ja — du kan opsige når som helst med øjeblikkelig virkning. Ingen binding, ingen skjulte gebyrer.',
  },
]

export default function ForsidenSide() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigationsbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">Boligpulsen</span>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/priser" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">Priser</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Log ind</Link>
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Baseret på BBR, DST og historiske handelspriser
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
          Analysér en bolig<br className="hidden sm:block" /> på sekunder
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Boligpulsen beregner investeringsscore, lejeafkast og prisprognose — og hjælper dig med at planlægge den optimale vej til drømmeboligen.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/opret-konto"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-base shadow-sm"
          >
            Prøv gratis — 3 analyser inkluderet
          </Link>
          <Link
            href="/priser"
            className="w-full sm:w-auto px-8 py-3.5 text-gray-700 hover:text-gray-900 font-medium text-base border border-gray-200 hover:border-gray-300 rounded-xl transition-colors"
          >
            Se priser →
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">Intet kreditkort nødvendigt · Opsig når som helst</p>
      </section>

      {/* Mockup / Demo-illustration */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-gray-400">Eksempel: Østerbrogade 42, 2100 København</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Investeringsscore', vaerdi: '8,4/10', farve: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Estimeret værdi', vaerdi: '4.350.000 kr', farve: 'text-gray-900', bg: 'bg-white' },
              { label: 'Prognose (3 år)', vaerdi: '+487.000 kr', farve: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Lejeafkast', vaerdi: '4,2 %', farve: 'text-purple-700', bg: 'bg-purple-50' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-xl p-4 border border-gray-100`}>
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.farve}`}>{item.vaerdi}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>God investering.</strong> Boligen handles under markedsværdi og området har haft stabil prisvækst de seneste 3 år. Lejeafkastet på 4,2% overstiger benchmark på 4%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Alt hvad du behøver</h2>
          <p className="mt-3 text-gray-600">Fra første analyse til fuldt investerings-overblik.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.titel} className={`p-6 rounded-2xl border ${f.farve}`}>
              <span className="text-2xl mb-3 block">{f.ikon}</span>
              <h3 className="font-semibold text-gray-900 mb-2">{f.titel}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Priser — kort oversigt */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Enkle, transparente priser</h2>
          <p className="text-gray-600 mb-10">Start gratis. Opgrader når du er klar.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { plan: 'Gratis', pris: '0', enhed: 'kr/md', features: ['3 analyser/md', 'Boligvurdering', 'Skatteoverblik', 'Sammenligning'], cta: 'Kom gratis i gang', href: '/opret-konto', fremhaev: false },
              { plan: 'Boligkøber', pris: '83', enhed: 'kr/md', sub: 'faktureres 990 kr/år', features: ['Ubegrænsede analyser', 'Alle 6 features', 'Markedsradar', 'Email-notifikationer'], cta: 'Vælg Boligkøber', href: '/priser', fremhaev: true },
              { plan: 'Investor', pris: '249', enhed: 'kr/md', sub: 'faktureres 2.990 kr/år', features: ['Alt i Boligkøber', 'Portefølje-dashboard', 'Udlejningsanalyse', 'Prioriteret support'], cta: 'Vælg Investor', href: '/priser', fremhaev: false },
            ].map(p => (
              <div key={p.plan} className={`bg-white rounded-2xl p-5 border ${p.fremhaev ? 'border-blue-500 shadow-sm' : 'border-gray-200'}`}>
                {p.fremhaev && (
                  <div className="text-xs font-semibold text-blue-600 mb-2">Mest populær</div>
                )}
                <div className="font-semibold text-gray-900 mb-1">{p.plan}</div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{p.pris}</span>
                  <span className="text-sm text-gray-500 ml-1">{p.enhed}</span>
                  {p.sub && <p className="text-xs text-gray-400 mt-0.5">{p.sub}</p>}
                </div>
                <ul className="space-y-1.5 mb-5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${p.fremhaev ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Ofte stillede spørgsmål</h2>
        <div className="space-y-6">
          {FAQ.map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Klar til at træffe bedre boligbeslutninger?</h2>
          <p className="text-blue-100 mb-8">Start med 3 gratis analyser. Intet kreditkort.</p>
          <Link
            href="/opret-konto"
            className="inline-block px-8 py-3.5 bg-white hover:bg-gray-50 text-blue-700 font-semibold rounded-xl transition-colors text-base shadow-sm"
          >
            Opret gratis konto
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-gray-900">Boligpulsen</span>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/priser" className="hover:text-gray-900 transition-colors">Priser</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">Log ind</Link>
            <Link href="/opret-konto" className="hover:text-gray-900 transition-colors">Opret konto</Link>
          </div>
          <p className="text-xs text-gray-400 text-center sm:text-right">
            © {new Date().getFullYear()} Boligpulsen · Alle beregninger er estimater og udgør ikke finansiel rådgivning
          </p>
        </div>
      </footer>
    </div>
  )
}
