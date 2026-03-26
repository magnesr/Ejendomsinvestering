import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ fejl: 'Ikke autoriseret' }, { status: 401 })
    }

    const { data: profil } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profil?.stripe_customer_id) {
      return NextResponse.json({ fejl: 'Ingen Stripe-kunde fundet' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profil.stripe_customer_id,
      return_url: `${appUrl}/dashboard/oversigt`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Stripe portal fejl:', error)
    return NextResponse.json({ fejl: 'Intern serverfejl' }, { status: 500 })
  }
}
