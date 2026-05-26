'use client'

import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { Check, Zap, Crown, Star, Shield } from 'lucide-react'
import { UPGRADE_PLANS } from '@/data/ib-data'

const PLAN_META: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  free:     { icon: <Shield style={{ width: 20, height: 20 }} />,                                   color: '#475569', desc: 'Get started with the basics' },
  weekly:   { icon: <Zap style={{ width: 20, height: 20 }} />,                                      color: '#06b6d4', desc: 'Perfect for exam crunch time' },
  monthly:  { icon: <Star style={{ width: 20, height: 20 }} />,                                     color: '#7c3aed', desc: 'Best for ongoing IB support' },
  yearly:   { icon: <Crown style={{ width: 20, height: 20 }} />,                                    color: '#10b981', desc: 'Maximum value all year' },
  ultimate: { icon: <Crown style={{ width: 24, height: 24, color: '#f59e0b' }} />,                  color: '#f59e0b', desc: 'Everything, forever' },
}

export default function UpgradePage() {
  const mainPlans = UPGRADE_PLANS.slice(0, 4)
  const ultimatePlan = UPGRADE_PLANS[4]

  return (
    <MainLayout>
      <Header title="Upgrade" subtitle="Unlock your full IB potential" />

      <div style={{ padding: '40px 40px', maxWidth: '1060px', margin: '0 auto' }}>

        {/* Hero text */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', fontSize: '13px', marginBottom: '16px' }}>
            <Zap style={{ width: 14, height: 14 }} />
            Plans & Pricing
          </div>
          <h1 style={{ fontSize: '34px', fontWeight: 700, color: 'white', marginBottom: '10px', lineHeight: 1.2 }}>
            Start free, upgrade anytime.
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b' }}>No hidden fees. Cancel anytime.</p>
        </div>

        {/* 4 main plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
          {mainPlans.map(plan => {
            const meta = PLAN_META[plan.id]
            const isFree = plan.id === 'free'
            const isPopular = (plan as typeof plan & { popular?: boolean }).popular
            return (
              <div
                key={plan.id}
                style={{
                  background: '#161827',
                  borderRadius: '16px',
                  border: isPopular ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isPopular ? '0 0 30px rgba(124,58,237,0.15)' : 'none',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {isPopular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}

                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${meta.color}20`, color: meta.color, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>{plan.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{meta.desc}</div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1 }}>${plan.price}</span>
                  <span style={{ fontSize: '13px', color: '#475569', marginLeft: '4px' }}>/{plan.period}</span>
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features.map(feature => (
                    <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Check style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2, color: meta.color }} />
                      <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  style={
                    isFree
                      ? { width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: '#1e2a3a', color: '#475569', border: '1px solid #2d3748', cursor: 'default' }
                      : isPopular
                        ? { width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', cursor: 'pointer' }
                        : { width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}40`, cursor: 'pointer' }
                  }
                >
                  {isFree ? 'Current Plan' : `Get ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Ultimate — wide card */}
        {ultimatePlan && (
          <div style={{ borderRadius: '16px', border: '1px solid rgba(245,158,11,0.3)', background: 'linear-gradient(135deg, #1a1208 0%, #161827 100%)', padding: '32px', position: 'relative', overflow: 'hidden', marginBottom: '40px' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'center' }}>
              {/* Left */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.15)', flexShrink: 0 }}>
                    <Crown style={{ width: 24, height: 24, color: '#f59e0b' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>Ultimate</div>
                    <div style={{ fontSize: '13px', color: '#f59e0b' }}>Lifetime access · One-time payment</div>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px', maxWidth: '520px', lineHeight: 1.6 }}>
                  Everything you need to ace the IB. Premium AI models, custom study plans, and direct university application support.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px' }}>
                  {ultimatePlan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check style={{ width: 14, height: 14, flexShrink: 0, color: '#f59e0b' }} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div style={{ textAlign: 'center', minWidth: '160px' }}>
                <div style={{ fontSize: '52px', fontWeight: 800, color: 'white', lineHeight: 1 }}>${ultimatePlan.price}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', marginTop: '4px' }}>one-time</div>
                <button style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.3)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Get Ultimate →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trust strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '🔒', title: 'Secure Payments', desc: 'All payments processed securely. Your data is never shared.' },
            { icon: '↩️', title: 'Cancel Anytime', desc: 'No lock-in contracts. Cancel your subscription at any time.' },
            { icon: '💬', title: 'Student Support', desc: 'Our team is available 24/7 via chat to help with any issues.' },
          ].map(item => (
            <div key={item.title} style={{ textAlign: 'center', padding: '24px', borderRadius: '14px', background: '#161827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }}>{item.icon}</span>
              <h4 style={{ fontWeight: 700, color: 'white', fontSize: '14px', marginBottom: '8px' }}>{item.title}</h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </MainLayout>
  )
}
