'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { Check, Zap, Crown, Star, Shield, Loader2 } from 'lucide-react'
import { UPGRADE_PLANS } from '@/data/ib-data'

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
    else console.error('Checkout error:', data.error)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(null)
  }
}

const PLAN_META: Record<string, { icon: React.ReactNode; color: string; desc: string; featured?: boolean }> = {
  free:     { icon: <Shield style={{ width: 18, height: 18 }} />, color: '#64748d', desc: 'Get started with the basics' },
  weekly:   { icon: <Zap style={{ width: 18, height: 18 }} />,   color: '#0e7490', desc: 'Perfect for exam crunch time' },
  monthly:  { icon: <Star style={{ width: 18, height: 18 }} />,  color: '#533afd', desc: 'Best for ongoing IB support', featured: true },
  yearly:   { icon: <Crown style={{ width: 18, height: 18 }} />, color: '#065f46', desc: 'Maximum value all year' },
  ultimate: { icon: <Crown style={{ width: 22, height: 22, color: '#9b6829' }} />, color: '#9b6829', desc: 'Everything, forever' },
}

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const mainPlans = UPGRADE_PLANS.slice(0, 4)
  const ultimatePlan = UPGRADE_PLANS[4]

  return (
    <MainLayout>
      <Header title="Upgrade" subtitle="Unlock your full IB potential" />

      <div style={{ padding: '48px 40px', maxWidth: '1060px', margin: '0 auto' }}>

        {/* Hero text */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="pill-tag-soft" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <Zap style={{ width: 10, height: 10 }} />
            Plans &amp; Pricing
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 300, color: '#0d253d', marginBottom: '12px', lineHeight: 1.1, letterSpacing: '-0.64px', display: 'block' }}>
            Start free, upgrade anytime.
          </h1>
          <p style={{ fontSize: '15px', fontWeight: 300, color: '#64748d' }}>No hidden fees. Cancel anytime.</p>
        </div>

        {/* 4 main plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
          {mainPlans.map(plan => {
            const meta = PLAN_META[plan.id]
            const isFree = plan.id === 'free'
            const isFeatured = meta.featured
            return (
              <div
                key={plan.id}
                style={{
                  background: isFeatured ? '#1c1e54' : '#ffffff',
                  borderRadius: '12px',
                  border: isFeatured ? '2px solid #533afd' : '1px solid #e3e8ee',
                  boxShadow: isFeatured
                    ? 'rgba(83,58,253,0.15) 0 8px 24px, rgba(0,55,112,0.04) 0 2px 6px'
                    : 'rgba(0,55,112,0.08) 0 1px 3px',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {isFeatured && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: '9999px', fontSize: '10px', fontWeight: 400, color: 'white', background: '#533afd', whiteSpace: 'nowrap', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Most Popular
                  </div>
                )}

                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isFeatured ? 'rgba(255,255,255,0.12)' : `${meta.color}12`, color: isFeatured ? '#b9b9f9' : meta.color, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 400, color: isFeatured ? '#ffffff' : '#0d253d', fontSize: '15px' }}>{plan.name}</div>
                    <div style={{ fontSize: '11px', fontWeight: 300, color: isFeatured ? 'rgba(255,255,255,0.55)' : '#64748d' }}>{meta.desc}</div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '24px' }}>
                  <span className="tabular" style={{ fontSize: '32px', fontWeight: 300, color: isFeatured ? '#ffffff' : '#0d253d', lineHeight: 1, letterSpacing: '-0.96px' }}>${plan.price}</span>
                  <span style={{ fontSize: '12px', fontWeight: 300, color: isFeatured ? 'rgba(255,255,255,0.45)' : '#64748d', marginLeft: '4px' }}>/{plan.period}</span>
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features.map(feature => (
                    <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Check style={{ width: 13, height: 13, flexShrink: 0, marginTop: 2, color: isFeatured ? '#b9b9f9' : meta.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 300, color: isFeatured ? 'rgba(255,255,255,0.7)' : '#273951', lineHeight: 1.5 }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  disabled={isFree || loading === plan.id}
                  onClick={() => !isFree && startCheckout(plan.id, setLoading)}
                  style={
                    isFree
                      ? { width: '100%', padding: '9px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 300, background: '#f6f9fc', color: '#64748d', border: '1px solid #e3e8ee', cursor: 'default' }
                      : isFeatured
                        ? { width: '100%', padding: '9px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 400, background: '#533afd', color: 'white', border: 'none', cursor: loading === plan.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s' }
                        : { width: '100%', padding: '9px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 400, background: 'transparent', color: '#533afd', border: '1px solid #533afd', cursor: loading === plan.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s' }
                  }
                >
                  {loading === plan.id && <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />}
                  {isFree ? 'Current Plan' : loading === plan.id ? 'Redirecting…' : `Get ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Ultimate — featured wide card (canvas-cream band) */}
        {ultimatePlan && (
          <div style={{ borderRadius: '12px', border: '1px solid #e3e8ee', background: '#f5e9d4', padding: '32px', position: 'relative', overflow: 'hidden', marginBottom: '40px', boxShadow: 'rgba(0,55,112,0.06) 0 1px 3px' }}>
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(155,104,41,0.12)', flexShrink: 0 }}>
                    <Crown style={{ width: 22, height: 22, color: '#9b6829' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 300, color: '#0d253d', letterSpacing: '-0.26px' }}>Ultimate</div>
                    <div style={{ fontSize: '12px', fontWeight: 300, color: '#9b6829' }}>Lifetime access · One-time payment</div>
                  </div>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 300, color: '#273951', marginBottom: '20px', maxWidth: '520px', lineHeight: 1.6 }}>
                  Everything you need to ace the IB. Premium AI models, custom study plans, and direct university application support.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px' }}>
                  {ultimatePlan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check style={{ width: 13, height: 13, flexShrink: 0, color: '#9b6829' }} />
                      <span style={{ fontSize: '12px', fontWeight: 300, color: '#273951' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '160px' }}>
                <div className="tabular" style={{ fontSize: '44px', fontWeight: 300, color: '#0d253d', lineHeight: 1, letterSpacing: '-0.96px' }}>${ultimatePlan.price}</div>
                <div style={{ fontSize: '12px', fontWeight: 300, color: '#64748d', marginBottom: '20px', marginTop: '4px' }}>one-time</div>
                <button
                  onClick={() => startCheckout('ultimate', setLoading)}
                  disabled={loading === 'ultimate'}
                  style={{ padding: '9px 24px', borderRadius: '9999px', fontSize: '14px', fontWeight: 400, color: 'white', background: '#9b6829', border: 'none', cursor: loading === 'ultimate' ? 'wait' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}
                >
                  {loading === 'ultimate' && <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />}
                  {loading === 'ultimate' ? 'Redirecting…' : 'Get Ultimate →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trust strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '🔒', title: 'Secure Payments', desc: 'All payments processed securely via Stripe. Your data is never shared.' },
            { icon: '↩️', title: 'Cancel Anytime', desc: 'No lock-in contracts. Cancel your subscription at any time.' },
            { icon: '💬', title: 'Student Support', desc: 'Our team is available to help with any issues you encounter.' },
          ].map(item => (
            <div key={item.title} className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <span style={{ fontSize: '26px', display: 'block', marginBottom: '12px' }}>{item.icon}</span>
              <h4 style={{ fontWeight: 400, color: '#0d253d', fontSize: '14px', marginBottom: '8px' }}>{item.title}</h4>
              <p style={{ fontSize: '12px', fontWeight: 300, color: '#64748d', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  )
}
