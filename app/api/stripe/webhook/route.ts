import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { getPlanTypeFromPriceId } from '@/lib/stripe/plans'
import { createServiceClient } from '@/lib/supabase/service'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signatur fejl:', err)
    return NextResponse.json({ fejl: 'Ugyldig signatur' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const subId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id
        if (!subId) break

        const subscription = await stripe.subscriptions.retrieve(subId)
        const priceId = subscription.items.data[0]?.price.id
        const planType = getPlanTypeFromPriceId(priceId)
        const userId = subscription.metadata.supabase_user_id

        if (!userId) break

        await supabase.from('profiles').update({
          abonnement_type: planType,
          abonnement_status: 'aktiv',
          stripe_subscription_id: subscription.id,
          abonnement_slutter: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        }).eq('id', userId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const planType = getPlanTypeFromPriceId(priceId)
        const userId = subscription.metadata.supabase_user_id

        if (!userId) break

        let status: 'aktiv' | 'annulleret' | 'udloebet' = 'aktiv'
        if (subscription.status === 'canceled') status = 'annulleret'
        else if (subscription.status === 'past_due' || subscription.status === 'unpaid') status = 'udloebet'

        await supabase.from('profiles').update({
          abonnement_type: planType,
          abonnement_status: status,
          abonnement_slutter: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        }).eq('id', userId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabase_user_id

        if (!userId) break

        await supabase.from('profiles').update({
          abonnement_type: 'freemium' as const,
          abonnement_status: 'annulleret' as const,
          stripe_subscription_id: null,
          abonnement_slutter: null,
        }).eq('id', userId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
        const subId = invoice.subscription
        if (!subId) break

        const subscription = await stripe.subscriptions.retrieve(subId)
        const userId = subscription.metadata.supabase_user_id
        if (!userId) break

        await supabase.from('profiles').update({
          abonnement_status: 'udloebet' as const,
        }).eq('id', userId)

        break
      }
    }
  } catch (error) {
    console.error(`Webhook håndtering fejlede for ${event.type}:`, error)
    return NextResponse.json({ fejl: 'Intern serverfejl' }, { status: 500 })
  }

  return NextResponse.json({ modtaget: true })
}
