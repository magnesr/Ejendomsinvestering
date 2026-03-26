// Supabase Edge Function — kører ugentligt via Supabase cron
// Tjekker DST prisindeks for overvågede postnumre og sender email ved >2% ændring

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_URL = 'https://api.resend.com/emails'
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://boligpulsen.dk'
const DST_API = 'https://api.statbank.dk/v1/data'

async function hentPrisindeksForPostnummer(postnummer: string): Promise<number | null> {
  try {
    const body = {
      table: 'EJENDOM6',
      format: 'JSON',
      variables: [
        { code: 'POSTNR', values: [postnummer] },
        { code: 'Tid', values: ['*'] },
      ],
    }
    const svar = await fetch(DST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!svar.ok) return null
    const data = await svar.json()

    if (!data.data || data.data.length === 0) return null
    const sidsteVaerdi = data.data[data.data.length - 1]?.values?.[0]
    return sidsteVaerdi ? parseFloat(sidsteVaerdi) : null
  } catch {
    return null
  }
}

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: opsaetninger, error } = await supabase
    .from('markedsradar_opsaetninger')
    .select('*, profiles!inner(email, fuldt_navn)')

  if (error) {
    return new Response(JSON.stringify({ fejl: error.message }), { status: 500 })
  }

  let haendelserOprettet = 0
  let emailsSendt = 0

  for (const ops of opsaetninger ?? []) {
    const nytIndeks = await hentPrisindeksForPostnummer(ops.postnummer)
    if (!nytIndeks) continue

    const gamlIndeks = ops.seneste_pris_index as number
    const aendringPct = ((nytIndeks - gamlIndeks) / gamlIndeks) * 100

    if (Math.abs(aendringPct) < 2) continue // Under tærskel — skip

    const erStiget = aendringPct > 0
    const haendelseType = erStiget ? 'stigning' : 'fald'
    const beskrivelse = `Prisindeks for ${ops.postnummer} er ${erStiget ? 'steget' : 'faldet'} med ${Math.abs(aendringPct).toFixed(1)}% (fra ${gamlIndeks.toFixed(1)} til ${nytIndeks.toFixed(1)})`

    // Opret hændelse
    await supabase.from('markedsradar_haendelser').insert({
      radar_id: ops.id,
      haendelse_type: haendelseType,
      beskrivelse,
      vaerdi: aendringPct,
    })
    haendelserOprettet++

    // Opdatér seneste indeks
    await supabase
      .from('markedsradar_opsaetninger')
      .update({ seneste_pris_index: nytIndeks })
      .eq('id', ops.id)

    // Send email hvis aktiveret
    if (!ops.notifikation_email) continue

    const email = (ops.profiles as { email: string })?.email
    const navn = (ops.profiles as { fuldt_navn: string | null })?.fuldt_navn ?? 'Bruger'
    if (!email) continue

    const html = `
<!DOCTYPE html><html lang="da"><head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
    <h1 style="font-size: 22px; color: #111827; margin: 0 0 8px;">Markedsradar: ${ops.postnummer}</h1>
    <p style="color: #6b7280; margin: 0 0 24px;">Hej ${navn} — vi har registreret en prisændring i dit overvågede område:</p>
    <div style="background: ${erStiget ? '#f0fdf4' : '#fef2f2'}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="color: ${erStiget ? '#16a34a' : '#dc2626'}; font-size: 16px; font-weight: 600; margin: 0;">${beskrivelse}</p>
    </div>
    <a href="${APP_URL}/dashboard/markedsradar" style="display: block; background: #2563eb; color: white; text-align: center; padding: 14px; border-radius: 10px; font-weight: 600; text-decoration: none;">
      Se markedsradar →
    </a>
    <p style="font-size: 11px; color: #d1d5db; margin: 24px 0 0; text-align: center;">
      <a href="${APP_URL}/dashboard/markedsradar" style="color: #9ca3af;">Administrer overvågning</a>
    </p>
  </div>
</body></html>`

    const emailSvar = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Boligpulsen <notifikationer@boligpulsen.dk>',
        to: [email],
        subject: `Prisændring i ${ops.postnummer}: ${aendringPct > 0 ? '↑' : '↓'} ${Math.abs(aendringPct).toFixed(1)}%`,
        html,
      }),
    })

    if (emailSvar.ok) emailsSendt++
  }

  return new Response(JSON.stringify({ behandlet: opsaetninger?.length ?? 0, haendelserOprettet, emailsSendt }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
