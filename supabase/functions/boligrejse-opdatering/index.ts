// Supabase Edge Function — kører månedligt via Supabase cron
// Opdaterer boligrejse-planer og sender email til brugere med ændringer

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_URL = 'https://api.resend.com/emails'
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://boligpulsen.dk'
const REALKREDITRENTE = parseFloat(Deno.env.get('REALKREDITRENTE') ?? '0.0525')
const UDBETALING_PCT = 0.20

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Hent alle aktive boligrejse-planer der skal opdateres
  const idag = new Date().toISOString()
  const { data: planer, error } = await supabase
    .from('boligrejse_planer')
    .select('*, profiles!inner(email, fuldt_navn, abonnement_status)')
    .lte('naeste_opdatering', idag)
    .eq('profiles.abonnement_status', 'aktiv')

  if (error) {
    return new Response(JSON.stringify({ fejl: error.message }), { status: 500 })
  }

  let emailsSendt = 0

  for (const plan of planer ?? []) {
    const planData = plan.plan_data as {
      anbefalet_koebspris: number
      forventet_droemme_aar: string
      opsum: string
    }

    const navn = (plan.profiles as { fuldt_navn: string | null })?.fuldt_navn ?? 'Bruger'
    const email = (plan.profiles as { email: string })?.email

    if (!email || !planData) continue

    // Formater anbefalet pris
    const formatKr = (n: number) => new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(n)

    const html = `
<!DOCTYPE html><html lang="da"><head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
    <h1 style="font-size: 22px; color: #111827; margin: 0 0 8px;">Din månedlige boligrejse-opdatering</h1>
    <p style="color: #6b7280; margin: 0 0 24px;">Hej ${navn},</p>
    <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="color: #1e40af; font-size: 14px; line-height: 1.6; margin: 0;">${planData.opsum}</p>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="background: #f9fafb; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px;">Anbefalet næste køb</p>
        <p style="font-size: 20px; font-weight: 700; color: #1d4ed8; margin: 0;">${formatKr(planData.anbefalet_koebspris)}</p>
      </div>
      <div style="background: #f9fafb; border-radius: 10px; padding: 16px;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px;">Forventet år til drømmebolig</p>
        <p style="font-size: 20px; font-weight: 700; color: #7c3aed; margin: 0;">${planData.forventet_droemme_aar}</p>
      </div>
    </div>
    <a href="${APP_URL}/dashboard/boligrejse" style="display: block; background: #2563eb; color: white; text-align: center; padding: 14px; border-radius: 10px; font-weight: 600; text-decoration: none;">
      Se din fulde plan →
    </a>
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
        subject: 'Din månedlige boligrejse-opdatering 🏡',
        html,
      }),
    })

    if (emailSvar.ok) {
      emailsSendt++
      // Opdatér naeste_opdatering til om 1 måned
      const naesteMaaned = new Date()
      naesteMaaned.setMonth(naesteMaaned.getMonth() + 1)
      await supabase
        .from('boligrejse_planer')
        .update({ naeste_opdatering: naesteMaaned.toISOString(), sidst_sendt_email: new Date().toISOString() })
        .eq('id', plan.id)
    }
  }

  return new Response(JSON.stringify({ behandlet: planer?.length ?? 0, emailsSendt }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
