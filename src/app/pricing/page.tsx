'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Check, Zap, Star, Crown, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '',
    color: '#475569',
    icon: Shield,
    desc: 'Try it out',
    badge: null,
    features: [
      '2 AI tool uses per month',
      'Practice paper generator (2/month)',
      'AI chat tutor (2/month)',
      'Grade tracker',
      'Calendar',
      'Study planner (basic)',
    ],
    cta: 'Start for free',
    ctaStyle: { background: '#1e2a3a', border: '1px solid #2d3748', color: '#94a3b8' },
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: 3.99,
    period: '/ week',
    color: '#06b6d4',
    icon: Zap,
    desc: 'Exam crunch',
    badge: null,
    features: [
      'Unlimited AI tool uses',
      'Unlimited practice papers',
      'Full AI chat tutor',
      'Grade tracker + predictions',
      'EE / TOK / Uni Counsellor',
      'Personalised study plan',
    ],
    cta: 'Start weekly',
    ctaStyle: { background: 'linear-gradient(135deg, #0891b2, #06b6d4)', border: 'none', color: 'white' },
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 12.99,
    period: '/ month',
    color: '#7c3aed',
    icon: Star,
    desc: 'Most popular',
    badge: 'MOST POPULAR',
    features: [
      'Everything in Weekly',
      'Essay feedback & grading',
      'Past paper library access',
      'AI study notes generator',
      'Predicted grade reports',
      'Priority support',
    ],
    cta: 'Start monthly',
    ctaStyle: { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: 'white', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' },
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 89.99,
    period: '/ year',
    color: '#10b981',
    icon: Crown,
    desc: 'Best value',
    badge: 'SAVE 40%',
    features: [
      'Everything in Monthly',
      'Advanced analytics dashboard',
      'Personalised revision packs',
      'Exam countdown alerts',
      'Weak topic AI drilling',
      '2 months free vs monthly',
    ],
    cta: 'Start yearly',
    ctaStyle: { background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', color: 'white' },
  },
]

async function startCheckout(planId: string, setLoading: (id: string | null) => void) {
  setLoading(planId)
  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(null)
  }
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelect = async (planId: string) => {
    if (planId === 'free') {
      // Save free plan, go straight to Google sign-in
      localStorage.setItem('ib_plan', 'free')
      localStorage.setItem('ib_onboarding_complete', 'true')
      await signIn('google', { callbackUrl: '/dashboard' })
    } else {
      // Save plan choice, sign in first then go to checkout
      localStorage.setItem('ib_plan', planId)
      localStorage.setItem('ib_onboarding_complete', 'true')
      // For paid: sign in then redirect to checkout
      await signIn('google', { callbackUrl: `/pricing/checkout?plan=${planId}` })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', color: 'white', padding: '40px 24px' }}>

      {/* Glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <Logo size="md" variant="stacked" />
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 20 }}>
            <Sparkles style={{ width: 13, height: 13 }} />
            ALMOST THERE — CHOOSE YOUR PLAN
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Start free, upgrade anytime
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
            Pick a plan and sign in with Google to activate your personalised IB study workspace.
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 40 }}>
          {PLANS.map(plan => {
            const Icon = plan.icon
            const isLoading = loading === plan.id
            const isPopular = plan.id === 'monthly'

            return (
              <div key={plan.id}
                style={{
                  padding: 28, borderRadius: 20,
                  background: isPopular ? 'rgba(124,58,237,0.12)' : '#161827',
                  border: `1px solid ${isPopular ? '#7c3aed' : 'rgba(255,255,255,0.06)'}`,
                  position: 'relative',
                  transition: 'transform 0.15s, border-color 0.15s',
                  boxShadow: isPopular ? '0 0 40px rgba(124,58,237,0.2)' : 'none',
                }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: isPopular ? '#7c3aed' : '#10b981', color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', padding: '4px 12px', borderRadius: 99 }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${plan.color}20`, border: `1px solid ${plan.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon style={{ width: 20, height: 20, color: plan.color }} />
                </div>

                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{plan.name}</span>
                  <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>{plan.desc}</span>
                </div>

                <div style={{ marginBottom: 20 }}>
                  {plan.price === 0 ? (
                    <span style={{ fontSize: 32, fontWeight: 900 }}>Free</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 32, fontWeight: 900 }}>${plan.price}</span>
                      <span style={{ fontSize: 13, color: '#475569' }}>{plan.period}</span>
                    </>
                  )}
                </div>

                <div style={{ marginBottom: 24 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <Check style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2, color: plan.color }} />
                      <span style={{ fontSize: 13, color: i === 0 && plan.id === 'free' ? '#ef4444' : '#94a3b8', lineHeight: 1.4 }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={!!loading}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading && !isLoading ? 0.5 : 1,
                    transition: 'all 0.15s',
                    ...plan.ctaStyle,
                  }}
                >
                  {isLoading ? (
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <>
                      {plan.id === 'free' ? (
                        <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                      ) : (
                        <ArrowRight style={{ width: 16, height: 16 }} />
                      )}
                      {plan.id === 'free' ? 'Sign in with Google' : plan.cta}
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#334155' }}>
          All paid plans include a 3-day money-back guarantee · Secure payments via Stripe · Cancel anytime
        </p>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
