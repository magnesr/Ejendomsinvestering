import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { udfoerBoligvurdering } from '@/lib/engines/boligvurdering'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ fejl: 'Ikke autoriseret' }, { status: 401 })
    }

    const { adresseId, adresse, postnummer, by, kommunekode, listepris } = await request.json()

    if (!adresseId || !adresse || !postnummer) {
      return NextResponse.json({ fejl: 'Manglende felter' }, { status: 400 })
    }

    // Tjek freemium-grænse via DB-funktion
    const serviceClient = await createServiceClient()
    const { data: tilladt } = await serviceClient.rpc('tjek_og_opret_vurdering_tilladelse', {
      p_bruger_id: user.id,
    })

    if (!tilladt) {
      return NextResponse.json(
        { fejl: 'FREEMIUM_LIMIT', besked: 'Du har brugt dine 3 gratis analyser denne måned' },
        { status: 403 }
      )
    }

    // Udfør vurdering
    const resultat = await udfoerBoligvurdering({
      adresseId,
      adresse,
      postnummer,
      by: by ?? '',
      kommunekode: kommunekode ?? '',
      listepris: listepris ?? undefined,
    })

    // Gem i database
    const { data: gemt, error } = await supabase
      .from('boligvurderinger')
      .insert({
        bruger_id: user.id,
        adresse: resultat.adresse,
        postnummer: resultat.postnummer,
        by: resultat.by,
        bbr_data: resultat.bbr as unknown as import('@/types/database').Json,
        beregnet_vaerdi: resultat.beregnet_vaerdi,
        investerings_score: resultat.investerings_score,
        anbefalings_tekst: resultat.anbefalings_tekst,
        prognose_3_aar: resultat.prognose_3_aar,
        prognose_5_aar: resultat.prognose_5_aar,
        lejeafkast_pct: resultat.lejeafkast_pct,
        sammenligning_data: resultat.sammenlignelige_salg as unknown as import('@/types/database').Json,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Gem vurdering fejl:', error)
    }

    return NextResponse.json({ ...resultat, id: gemt?.id })
  } catch (error) {
    console.error('Boligvurdering fejl:', error)
    return NextResponse.json({ fejl: 'Intern serverfejl' }, { status: 500 })
  }
}

// Hent brugerens seneste vurderinger
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ fejl: 'Ikke autoriseret' }, { status: 401 })
    }

    const { data: vurderinger } = await supabase
      .from('boligvurderinger')
      .select('id, adresse, by, postnummer, investerings_score, beregnet_vaerdi, oprettet_den')
      .eq('bruger_id', user.id)
      .order('oprettet_den', { ascending: false })
      .limit(20)

    return NextResponse.json(vurderinger ?? [])
  } catch {
    return NextResponse.json({ fejl: 'Intern serverfejl' }, { status: 500 })
  }
}
