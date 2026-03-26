import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hentPrisindeks } from '@/lib/api/dst'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ fejl: 'Ikke logget ind' }, { status: 401 })

  const { data: opsaetninger, error } = await supabase
    .from('markedsradar_opsaetninger')
    .select('*, markedsradar_haendelser(*)')
    .eq('bruger_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 })
  return NextResponse.json(opsaetninger)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ fejl: 'Ikke logget ind' }, { status: 401 })

  const body = await req.json()

  // Hent aktuelt prisindeks for postnummer
  let senestePrisIndex = 100
  try {
    const prisdata = await hentPrisindeks(body.postnummer)
    if (prisdata.length > 0) {
      senestePrisIndex = prisdata[prisdata.length - 1].indeks
    }
  } catch {
    // brug default
  }

  const { data, error } = await supabase
    .from('markedsradar_opsaetninger')
    .insert({
      bruger_id: user.id,
      postnummer: body.postnummer,
      boligtype: body.boligtype ?? 'alle',
      seneste_pris_index: senestePrisIndex,
      notifikation_email: body.notifikation_email ?? true,
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
    .from('markedsradar_opsaetninger')
    .delete()
    .eq('id', id)
    .eq('bruger_id', user.id)

  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
