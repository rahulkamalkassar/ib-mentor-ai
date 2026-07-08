'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function CheckoutRedirect() {
  const params = useSearchParams()
  const plan = params.get('plan')

  useEffect(() => {
    if (!plan) { window.location.href = '/dashboard'; return }
    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan }),
    })
      .then(r => r.json())
      .then(data => { if (data.url) window.location.href = data.url; else window.location.href = '/dashboard' })
      .catch(() => { window.location.href = '/dashboard' })
  }, [plan])

  return null
}

export default function PricingCheckoutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', animation: 'bounce 0.8s infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>Setting up your payment…</p>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }`}</style>
      <Suspense>
        <CheckoutRedirect />
      </Suspense>
    </div>
  )
}
