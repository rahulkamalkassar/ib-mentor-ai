'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { ArrowRight, Sparkles, BarChart3, Brain, ClipboardList, Calendar, GraduationCap, Zap, Star } from 'lucide-react'

const FEATURES = [
  { icon: Sparkles,      color: '#a78bfa', label: 'AI Tutor',         desc: 'Get instant help on any IB topic, 24/7' },
  { icon: BarChart3,     color: '#22d3ee', label: 'Grade Tracker',    desc: 'Track every subject and predict your diploma score' },
  { icon: ClipboardList, color: '#10b981', label: 'Practice Papers',  desc: 'AI-generated IB-style exam papers with mark schemes' },
  { icon: Brain,         color: '#f59e0b', label: 'TOK & EE Helper',  desc: 'Guided support for your extended essays' },
  { icon: Calendar,      color: '#ec4899', label: 'Study Planner',    desc: 'Personalised revision schedule around your life' },
  { icon: GraduationCap, color: '#8b5cf6', label: 'Uni Counsellor',  desc: 'Tailored advice for your university applications' },
]

const STATS = [
  { value: '45', label: 'IB Subjects covered' },
  { value: '7', label: 'Avg points improvement' },
  { value: '24/7', label: 'AI available' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', programme: 'DP Year 2 · Chemistry HL', text: 'I went from a predicted 5 to a 7 in Chemistry using the practice papers. The AI feedback is genuinely better than my teacher\'s comments.' },
  { name: 'Marcus T.', programme: 'DP Year 1 · Mathematics AA HL', text: 'The study planner actually accounts for my football schedule. No other app does that. My mocks went up 8 points overall.' },
  { name: 'Priya R.', programme: 'DP Year 2 · Biology HL', text: 'The EE helper got me an A. It asked the right questions to push my argument further without writing it for me.' },
]

export default function Home() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem('ib_onboarding_complete')
    if (done === 'true') {
      router.push('/dashboard')
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0d0f1a' }}>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7c3aed', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', color: 'white', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(13,15,26,0.9)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <Logo size="sm" variant="horizontal" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/login')}
            style={{ padding: '8px 20px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/onboarding')}
            style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Get started <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', position: 'relative' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 28 }}>
          <Zap style={{ width: 13, height: 13, color: '#a78bfa' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd', letterSpacing: '0.05em' }}>POWERED BY CLAUDE AI</span>
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 auto 24px', maxWidth: 800 }}>
          Ace your IB exams<br />
          <span style={{ background: 'linear-gradient(90deg, #a78bfa 0%, #38bdf8 50%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            with your AI mentor
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
          Personalised study plans, AI-generated practice papers, grade tracking, and expert guidance for every IB subject — all in one place.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', color: 'white', fontSize: 17, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(124,58,237,0.55)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(124,58,237,0.4)' }}
          >
            <Sparkles style={{ width: 20, height: 20 }} />
            Start your personalised quiz
            <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
          <p style={{ fontSize: 12, color: '#334155' }}>Free to start · Takes 3 minutes · No credit card needed</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 72, flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Everything you need to score a 7</h2>
        <p style={{ textAlign: 'center', color: '#475569', marginBottom: 56, fontSize: 16 }}>Built specifically for IB students, by people who've been there.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{ padding: '28px', borderRadius: 16, background: '#161827', border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.35)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon style={{ width: 22, height: 22, color: f.color }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.label}</h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Students love it</h2>
          <p style={{ textAlign: 'center', color: '#475569', marginBottom: 48, fontSize: 15 }}>Real results from real IB students.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding: 28, borderRadius: 16, background: '#161827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[0,1,2,3,4].map(i => <Star key={i} style={{ width: 14, height: 14, fill: '#f59e0b', color: '#f59e0b' }} />)}
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: '#475569', margin: '2px 0 0' }}>{t.programme}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </div>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
          Ready to score your best?
        </h2>
        <p style={{ fontSize: 17, color: '#475569', marginBottom: 48, maxWidth: 480, margin: '0 auto 48px' }}>
          Take a 3-minute quiz and get a fully personalised IB study plan built around your subjects, goals, and schedule.
        </p>
        <button
          onClick={() => router.push('/onboarding')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 40px', borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            border: 'none', color: 'white', fontSize: 17, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}
        >
          <Sparkles style={{ width: 20, height: 20 }} />
          Take the quiz — it&apos;s free
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Logo size="sm" variant="horizontal" />
        <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>© 2026 IB Mentor AI. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 12, color: '#334155', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
