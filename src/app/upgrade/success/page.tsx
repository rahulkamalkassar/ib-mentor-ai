'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'

const PLAN_LABELS: Record<string, { name: string; emoji: string }> = {
  weekly:   { name: 'Weekly',           emoji: '⚡' },
  monthly:  { name: 'Monthly',          emoji: '🌟' },
  yearly:   { name: 'Yearly',           emoji: '🏆' },
  ultimate: { name: 'Ultimate Lifetime', emoji: '👑' },
}

function SuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const planId = params.get('plan') || 'monthly'
  const plan = PLAN_LABELS[planId] ?? { name: 'Pro', emoji: '🎉' }
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    localStorage.setItem('ib_plan', planId)

    const t = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(t); router.push('/dashboard'); return 0 }
      return c - 1
    }), 1000)
    return () => clearInterval(t)
  }, [planId, router])

  return (
    <div className="gradient-mesh-hero min-h-screen flex items-center justify-center p-6">
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <CheckCircle2 style={{ width: 40, height: 40, color: '#10b981' }} />
        </div>

        <p style={{ fontSize: 36, marginBottom: 16 }}>{plan.emoji}</p>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: '#0d253d', marginBottom: 12, letterSpacing: '-0.64px' }}>
          You&apos;re now on {plan.name}!
        </h1>
        <p style={{ fontSize: 15, fontWeight: 300, color: '#64748d', marginBottom: 32, lineHeight: 1.6 }}>
          Your payment was successful. All {plan.name} features are now unlocked — go ace the IB.
        </p>

        <div className="card" style={{ padding: '16px 24px', marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 300, color: '#273951' }}>
            Redirecting to dashboard in <strong style={{ fontWeight: 400 }}>{countdown}s</strong>…
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 24px', borderRadius: 9999, background: '#533afd', color: 'white', border: 'none', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#665efd')}
          onMouseLeave={e => (e.currentTarget.style.background = '#533afd')}
        >
          Go to Dashboard <ArrowRight style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
