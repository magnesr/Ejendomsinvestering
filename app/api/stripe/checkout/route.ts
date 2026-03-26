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

    const { priceId } = await request.json()
    if (!priceId) {
      return NextResponse.json({ fejl: 'priceId mangler' }, { status: 400 })
    }

    // Hent eller opret Stripe-kunde
    const { data: profil } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, fuldt_navn')
      .eq('id', user.id)
      .single()

    let customerId = profil?.stripe_customer_id

    if (!customerId) {
      const kunde = await stripe.customers.create({
        email: profil?.email ?? user.email!,
        name: profil?.fuldt_navn ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = kunde.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/oversigt?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/priser`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      locale: 'da',
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout fejl:', error)
    return NextResponse.json({ fejl: 'Intern serverfejl' }, { status: 500 })
  }
}
