'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
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
    // Persist plan to localStorage so UI can reflect upgrade
    localStorage.setItem('ib_plan', planId)

    const t = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(t); router.push('/dashboard'); return 0 }
      return c - 1
    }), 1000)
    return () => clearInterval(t)
  }, [planId, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0f1a' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Animated check */}
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', animation: 'pulse 2s infinite' }}>
          <CheckCircle2 style={{ width: 44, height: 44, color: '#10b981' }} />
        </div>

        <p style={{ fontSize: 40, marginBottom: 12 }}>{plan.emoji}</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 10 }}>
          You&apos;re now on {plan.name}!
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
          Your payment was successful. All {plan.name} features are now unlocked — go ace the IB.
        </p>

        <div style={{ padding: '16px 24px', borderRadius: 14, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: '#6ee7b7' }}>Redirecting to dashboard in <strong>{countdown}s</strong>…</p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Go to Dashboard <ArrowRight style={{ width: 16, height: 16 }} />
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
