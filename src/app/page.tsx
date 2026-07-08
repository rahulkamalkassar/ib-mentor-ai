'use client'

import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { ArrowRight, Sparkles, BarChart3, Brain, ClipboardList, Calendar, GraduationCap, Star, Zap, BookOpen } from 'lucide-react'

const FEATURES = [
  { icon: Sparkles,      label: 'AI Tutor',         desc: 'Get instant help on any IB topic, explained at your level, 24/7.' },
  { icon: BarChart3,     label: 'Grade Tracker',    desc: 'Track every subject and predict your diploma score in real time.' },
  { icon: ClipboardList, label: 'Practice Papers',  desc: 'AI-generated IB-style exam papers with full mark schemes.' },
  { icon: Brain,         label: 'TOK & EE Helper',  desc: 'Guided support that sharpens your argument without writing it for you.' },
  { icon: Calendar,      label: 'Study Planner',    desc: 'Personalised revision schedule built around your subjects and life.' },
  { icon: GraduationCap, label: 'Uni Counsellor',  desc: 'Tailored university application advice matched to your profile.' },
]

const STATS = [
  { value: '45', label: 'IB Subjects covered' },
  { value: '7', label: 'Avg points improvement' },
  { value: '24/7', label: 'AI available' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', programme: 'DP Year 2 · Chemistry HL', text: 'I went from a predicted 5 to a 7 in Chemistry using the practice papers. The AI feedback is genuinely better than my teacher\'s comments.' },
  { name: 'Marcus T.', programme: 'DP Year 1 · Mathematics AA HL', text: 'The study planner accounts for my football schedule. My mocks went up 8 points overall. No other app does that.' },
  { name: 'Priya R.', programme: 'DP Year 2 · Biology HL', text: 'The EE helper got me an A. It asked the right questions to push my argument further without writing it for me.' },
]

export default function Home() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0d253d', fontFamily: 'var(--font-inter), Inter, SF Pro Display, system-ui, sans-serif', fontWeight: 300 }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px',
        borderBottom: '1px solid #e3e8ee',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Logo size="sm" variant="horizontal" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/login')}
            style={{ padding: '7px 18px', borderRadius: 9999, background: 'transparent', border: '1px solid #e3e8ee', color: '#273951', fontSize: 14, fontWeight: 300, cursor: 'pointer' }}
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/onboarding')}
            style={{ padding: '7px 18px', borderRadius: 9999, background: '#533afd', border: 'none', color: 'white', fontSize: 14, fontWeight: 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#665efd')}
            onMouseLeave={e => (e.currentTarget.style.background = '#533afd')}
          >
            Get started <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </nav>

      {/* ── Hero with gradient mesh ── */}
      <section className="gradient-mesh-hero" style={{ padding: '96px 24px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>

          {/* Eyebrow tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 28 }}>
            <span className="pill-tag-soft">
              <Zap style={{ width: 10, height: 10 }} />
              Powered by Claude AI
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 300,
            lineHeight: 1.03,
            letterSpacing: '-1.4px',
            color: '#0d253d',
            margin: '0 auto 22px',
            fontFeatureSettings: '"ss01"',
          }}>
            Ace your IB exams<br />with your AI mentor
          </h1>

          <p style={{ fontSize: 18, fontWeight: 300, color: '#64748d', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Personalised study plans, AI-generated practice papers, grade tracking, and expert guidance — all in one place.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/onboarding')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 9999,
                background: '#533afd', border: 'none',
                color: 'white', fontSize: 16, fontWeight: 400,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#665efd')}
              onMouseLeave={e => (e.currentTarget.style.background = '#533afd')}
            >
              <Sparkles style={{ width: 16, height: 16 }} />
              Start your quiz
              <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 9999,
                background: '#ffffff', border: '1px solid #533afd',
                color: '#533afd', fontSize: 16, fontWeight: 400,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(83,58,253,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
            >
              Sign in
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#a8c3de', marginTop: 16, fontWeight: 300 }}>Free to start · Takes 3 minutes · No credit card needed</p>
        </div>

        {/* Stats */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: 64, marginTop: 72, flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 300, color: '#533afd', letterSpacing: '-0.96px', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748d', marginTop: 6, fontWeight: 300 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '96px 24px', background: '#f6f9fc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="pill-tag-soft" style={{ marginBottom: 18, display: 'inline-flex' }}>Features</p>
            <h2 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.64px', color: '#0d253d', lineHeight: 1.1, marginBottom: 14 }}>
              Everything you need to score a 7
            </h2>
            <p style={{ color: '#64748d', fontSize: 16, fontWeight: 300 }}>Built specifically for IB students, by people who&apos;ve been there.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <div
                key={f.label}
                className="card card-hover"
                style={{ padding: '32px' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(83,58,253,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon style={{ width: 20, height: 20, color: '#533afd' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 300, color: '#0d253d', marginBottom: 10, letterSpacing: '-0.22px' }}>{f.label}</h3>
                <p style={{ fontSize: 14, color: '#64748d', lineHeight: 1.65, margin: 0, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials (cream band) ── */}
      <section style={{ padding: '96px 24px', background: '#f5e9d4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.64px', color: '#0d253d', lineHeight: 1.1, marginBottom: 12 }}>
              Students love it
            </h2>
            <p style={{ color: '#64748d', fontSize: 15, fontWeight: 300 }}>Real results from real IB students.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
                  {[0,1,2,3,4].map(i => <Star key={i} style={{ width: 13, height: 13, fill: '#9b6829', color: '#9b6829' }} />)}
                </div>
                <p style={{ fontSize: 14, color: '#273951', lineHeight: 1.7, marginBottom: 22, fontWeight: 300 }}>&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 400, color: '#0d253d', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: '#64748d', margin: '3px 0 0', fontWeight: 300 }}>{t.programme}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ textAlign: 'center', padding: '96px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '-0.96px', color: '#0d253d', lineHeight: 1.1, marginBottom: 18 }}>
            Ready to score your best?
          </h2>
          <p style={{ fontSize: 16, color: '#64748d', marginBottom: 40, lineHeight: 1.6, fontWeight: 300 }}>
            Take a 3-minute quiz and get a fully personalised IB study plan built around your subjects, goals, and schedule.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '10px 28px', borderRadius: 9999,
              background: '#533afd', border: 'none',
              color: 'white', fontSize: 16, fontWeight: 400,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#665efd')}
            onMouseLeave={e => (e.currentTarget.style.background = '#533afd')}
          >
            <Sparkles style={{ width: 16, height: 16 }} />
            Take the quiz — it&apos;s free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #e3e8ee', padding: '40px 40px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen style={{ width: 16, height: 16, color: '#533afd' }} />
            <span style={{ fontSize: 13, fontWeight: 400, color: '#0d253d' }}>IB Mentor AI</span>
          </div>
          <p style={{ fontSize: 12, color: '#64748d', margin: 0, fontWeight: 300 }}>© 2026 IB Mentor AI. Independent study platform — not affiliated with IBO.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ fontSize: 12, color: '#64748d', cursor: 'pointer', fontWeight: 300 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#533afd')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748d')}
              >{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
