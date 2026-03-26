const RESEND_API_URL = 'https://api.resend.com/emails'

interface SendEmailOptions {
  til: string
  emne: string
  html: string
}

export async function sendEmail({ til, emne, html }: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY ikke sat')
    return false
  }

  try {
    const svar = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Boligpulsen <notifikationer@boligpulsen.dk>',
        to: [til],
        subject: emne,
        html,
      }),
    })

    if (!svar.ok) {
      const fejl = await svar.text()
      console.error('Resend fejl:', fejl)
      return false
    }

    return true
  } catch (err) {
    console.error('Email afsendelse fejlede:', err)
    return false
  }
}

export function boligrejseEmailHtml(params: {
  navn: string
  anbefaletPris: string
  forventetAar: string
  opsum: string
  appUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="da">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
    <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px;">Din månedlige boligrejse-opdatering</h1>
    <p style="color: #6b7280; margin: 0 0 24px;">Hej ${params.navn} — her er din seneste plan:</p>

    <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="color: #1e40af; font-size: 14px; line-height: 1.6; margin: 0;">${params.opsum}</p>
    </div>

    <div style="display: grid; gap: 12px; margin-bottom: 24px;">
      <div style="background: #f9fafb; border-radius: 10px; padding: 16px;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px;">Anbefalet næste køb</p>
        <p style="font-size: 20px; font-weight: 700; color: #1d4ed8; margin: 0;">${params.anbefaletPris}</p>
      </div>
      <div style="background: #f9fafb; border-radius: 10px; padding: 16px;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px;">Forventet år til drømmebolig</p>
        <p style="font-size: 20px; font-weight: 700; color: #7c3aed; margin: 0;">${params.forventetAar}</p>
      </div>
    </div>

    <a href="${params.appUrl}/dashboard/boligrejse" style="display: block; background: #2563eb; color: white; text-align: center; padding: 14px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 15px;">
      Se din fulde plan →
    </a>

    <p style="font-size: 11px; color: #d1d5db; margin: 24px 0 0; text-align: center;">
      Boligpulsen · Du modtager disse emails fordi du har aktiveret boligrejse-planlægning.<br>
      <a href="${params.appUrl}/dashboard/boligrejse" style="color: #9ca3af;">Administrer dine indstillinger</a>
    </p>
  </div>
</body>
</html>`
}

export function markedsradarEmailHtml(params: {
  postnummer: string
  haendelser: Array<{ beskrivelse: string; type: string }>
  appUrl: string
}): string {
  const haendelserHtml = params.haendelser
    .map(h => `
      <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${h.type === 'stigning' ? '#16a34a' : h.type === 'fald' ? '#dc2626' : '#2563eb'}; flex-shrink: 0; margin-top: 5px;"></span>
        <p style="margin: 0; font-size: 14px; color: #374151;">${h.beskrivelse}</p>
      </div>
    `)
    .join('')

  return `
<!DOCTYPE html>
<html lang="da">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
    <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px;">Markedsradar: ${params.postnummer}</h1>
    <p style="color: #6b7280; margin: 0 0 24px;">Vi har registreret prisændringer i dit overvågede område:</p>

    <div style="margin-bottom: 24px;">
      ${haendelserHtml}
    </div>

    <a href="${params.appUrl}/dashboard/markedsradar" style="display: block; background: #2563eb; color: white; text-align: center; padding: 14px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 15px;">
      Se markedsradar →
    </a>

    <p style="font-size: 11px; color: #d1d5db; margin: 24px 0 0; text-align: center;">
      Boligpulsen · <a href="${params.appUrl}/dashboard/markedsradar" style="color: #9ca3af;">Administrer overvågning</a>
    </p>
  </div>
</body>
</html>`
}
