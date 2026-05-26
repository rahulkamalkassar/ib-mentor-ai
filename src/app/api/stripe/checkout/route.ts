import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanId } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json() as { planId: PlanId }
    const plan = PLANS[planId]
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: plan.mode,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: { name: `IB Mentor AI — ${plan.name}` },
            ...(plan.mode === 'subscription'
              ? { recurring: { interval: plan.interval! }, unit_amount: plan.amount }
              : { unit_amount: plan.amount }
            ),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/upgrade/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
      metadata: { planId },
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
