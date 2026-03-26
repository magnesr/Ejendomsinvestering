import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ fejl: 'Ikke logget ind' }, { status: 401 })

  const { data, error } = await supabase
    .from('portefolje_ejendomme')
    .select('*')
    .eq('bruger_id', user.id)
    .order('koebsdato', { ascending: false })

  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ fejl: 'Ikke logget ind' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase
    .from('portefolje_ejendomme')
    .insert({
      bruger_id: user.id,
      adresse: body.adresse,
      postnummer: body.postnummer,
      by: body.by,
      koebspris: body.koebspris,
      koebsdato: body.koebsdato,
      seneste_vaerdi: body.seneste_vaerdi ?? body.koebspris,
      estimeret_husleje: body.estimeret_husleje ?? 0,
      lejeafkast_pct: body.lejeafkast_pct ?? 0,
      er_udlejningsejendom: body.er_udlejningsejendom ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ fejl: 'Ikke logget ind' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ fejl: 'Mangler id' }, { status: 400 })

  const { error } = await supabase
    .from('portefolje_ejendomme')
    .delete()
    .eq('id', id)
    .eq('bruger_id', user.id)

  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
