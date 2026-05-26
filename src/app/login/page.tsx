'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { LogoMark } from '@/components/ui/LogoMark'
import { BookOpen, BarChart3, Brain } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', gap: '12px' }}>
          <LogoMark size={48} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>IB Mentor AI</h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Your personalised IB study companion</p>
          </div>
        </div>

        <div style={{ background: '#161827', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', padding: '36px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '6px', textAlign: 'center' }}>Welcome back</h2>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '28px' }}>Sign in to continue your IB journey</p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '13px 20px',
              borderRadius: '12px',
              background: loading ? '#1e2a3a' : 'white',
              color: loading ? '#64748b' : '#1a1a1a',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {!loading ? (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            ) : (
              <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #475569', borderTopColor: '#7c3aed', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            )}
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <p style={{ fontSize: '11px', color: '#334155', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
            By signing in you agree to our Terms of Service.<br />Your study data stays private.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '24px' }}>
          {[
            { icon: BookOpen, label: 'AI Tutor', color: '#a78bfa' },
            { icon: BarChart3, label: 'Grade Tracker', color: '#22d3ee' },
            { icon: Brain, label: 'Study Plans', color: '#10b981' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Icon style={{ width: 18, height: 18, color, margin: '0 auto 6px' }} />
              <p style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
