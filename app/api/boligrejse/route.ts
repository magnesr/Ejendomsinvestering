import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { beregnBoligrejse } from '@/lib/engines/boligrejse'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ fejl: 'Ikke autoriseret' }, { status: 401 })

    const input = await request.json()

    const plan = beregnBoligrejse(input)

    // Gem eller opdater plan
    const naesteMaaned = new Date()
    naesteMaaned.setMonth(naesteMaaned.getMonth() + 1)

    await supabase.from('boligrejse_planer').upsert({
      bruger_id: user.id,
      nuvaerende_budget: input.nuvaerende_budget,
      nuvaerende_bolig_vaerdi: input.nuvaerende_bolig_vaerdi,
      nuvaerende_gaeld: input.nuvaerende_gaeld,
      droemme_type: input.droemme_type,
      droemme_omraade: input.droemme_omraade,
      droemme_pris_min: input.droemme_pris_min,
      droemme_pris_max: input.droemme_pris_max,
      plan_data: plan as unknown as import('@/types/database').Json,
      naeste_opdatering: naesteMaaned.toISOString().split('T')[0],
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Boligrejse fejl:', error)
    return NextResponse.json({ fejl: 'Intern serverfejl' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ fejl: 'Ikke autoriseret' }, { status: 401 })

    const { data } = await supabase
      .from('boligrejse_planer')
      .select('*')
      .eq('bruger_id', user.id)
      .order('oprettet_den', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json(data ?? null)
  } catch {
    return NextResponse.json(null)
  }
}
