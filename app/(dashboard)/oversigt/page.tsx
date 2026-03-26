import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default async function OversigtSide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profiles')
    .select('fuldt_navn, abonnement_type, gratis_analyser_brugt')
    .eq('id', user!.id)
    .single()

  const { count: antalVurderinger } = await supabase
    .from('boligvurderinger')
    .select('*', { count: 'exact', head: true })
    .eq('bruger_id', user!.id)

  const velkomstNavn = profil?.fuldt_navn?.split(' ')[0] || 'der'

  const features = [
    { href: '/dashboard/boligvurdering', titel: 'Boligvurdering', beskrivelse: 'Analyser en bolig og få investeringsscore', farve: 'bg-blue-50 border-blue-100' },
    { href: '/dashboard/boligrejse', titel: 'Boligrejse', beskrivelse: 'Planlæg din optimale vej til drømmeboligen', farve: 'bg-green-50 border-green-100' },
    { href: '/dashboard/markedsradar', titel: 'Markedsradar', beskrivelse: 'Overvåg prisudviklingen i dit postnummer', farve: 'bg-yellow-50 border-yellow-100' },
    { href: '/dashboard/skatteoverblik', titel: 'Skatteoverblik', beskrivelse: 'Beregn den reelle månedlige boligomkostning', farve: 'bg-orange-50 border-orange-100' },
    { href: '/dashboard/sammenligning', titel: 'Sammenligning', beskrivelse: 'Sammenlign 2-3 boliger side om side', farve: 'bg-purple-50 border-purple-100' },
    ...(profil?.abonnement_type === 'investor' ? [{ href: '/dashboard/portefolje', titel: 'Portefølje', beskrivelse: 'Overblik over dine investeringsejendomme', farve: 'bg-indigo-50 border-indigo-100' }] : []),
  ]

  return (
    <div className="space-y-8">
      {/* Velkomst */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hej, {velkomstNavn}</h1>
        <p className="mt-1 text-gray-600">Hvad vil du analysere i dag?</p>
      </div>

      {/* Status-kort */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-sm text-gray-500 mb-1">Abonnement</p>
          <div className="flex items-center gap-2">
            <Badge variant={profil?.abonnement_type === 'investor' ? 'lilla' : profil?.abonnement_type === 'boligkoeber' ? 'blaa' : 'graa'}>
              {profil?.abonnement_type === 'investor' ? 'Investor' : profil?.abonnement_type === 'boligkoeber' ? 'Boligkøber' : 'Freemium'}
            </Badge>
          </div>
        </Card>
        <Card padding="md">
          <p className="text-sm text-gray-500 mb-1">Analyser dette kvartal</p>
          <p className="text-2xl font-bold text-gray-900">{antalVurderinger ?? 0}</p>
        </Card>
        {profil?.abonnement_type === 'freemium' && (
          <Card padding="md">
            <p className="text-sm text-gray-500 mb-1">Gratis analyser tilbage</p>
            <p className="text-2xl font-bold text-gray-900">{Math.max(0, 3 - (profil.gratis_analyser_brugt ?? 0))}</p>
            <p className="text-xs text-gray-400 mt-0.5">af 3 denne måned</p>
          </Card>
        )}
      </div>

      {/* Feature-gitter */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Hvad vil du gøre?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={`p-5 rounded-2xl border ${f.farve} hover:shadow-sm transition-all group`}
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{f.titel}</h3>
              <p className="text-sm text-gray-600 mt-1">{f.beskrivelse}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Freemium opgradering */}
      {profil?.abonnement_type === 'freemium' && (
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Opgrader til Boligkøber</h3>
              <p className="text-sm text-gray-600 mt-0.5">Ubegrænsede analyser fra kun 99 kr/md</p>
            </div>
            <Link
              href="/priser"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Se priser
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
