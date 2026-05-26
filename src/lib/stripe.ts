import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  weekly: {
    name: 'Weekly',
    amount: 399,       // $3.99 in cents
    currency: 'usd',
    interval: 'week' as const,
    mode: 'subscription' as const,
  },
  monthly: {
    name: 'Monthly',
    amount: 1299,      // $12.99
    currency: 'usd',
    interval: 'month' as const,
    mode: 'subscription' as const,
  },
  yearly: {
    name: 'Yearly',
    amount: 8999,      // $89.99
    currency: 'usd',
    interval: 'year' as const,
    mode: 'subscription' as const,
  },
  ultimate: {
    name: 'Ultimate (Lifetime)',
    amount: 14900,     // $149
    currency: 'usd',
    interval: null,
    mode: 'payment' as const,
  },
}

export type PlanId = keyof typeof PLANS
