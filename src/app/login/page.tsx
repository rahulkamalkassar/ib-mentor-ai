'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { BookOpen, BarChart3, Brain } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="gradient-mesh-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BookOpen style={{ width: 24, height: 24, color: '#533afd' }} />
            <span style={{ fontSize: 20, fontWeight: 300, color: '#0d253d', letterSpacing: '-0.3px' }}>IB Mentor AI</span>
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '40px', boxShadow: 'rgba(0,55,112,0.1) 0 8px 24px, rgba(0,55,112,0.05) 0 2px 6px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 300, color: '#0d253d', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.22px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', fontWeight: 300, color: '#64748d', textAlign: 'center', marginBottom: '32px' }}>
            Sign in to continue your IB journey
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '11px 20px',
              borderRadius: '9999px',
              background: loading ? '#f6f9fc' : '#ffffff',
              color: loading ? '#64748d' : '#0d253d',
              border: '1px solid #e3e8ee',
              fontSize: '14px',
              fontWeight: 400,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: 'rgba(0,55,112,0.06) 0 1px 3px',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget.style.borderColor = '#a8c3de') }}
            onMouseLeave={e => { (e.currentTarget.style.borderColor = '#e3e8ee') }}
          >
            {!loading ? (
              <svg width="17" height="17" viewBox="0 0 18 18">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            ) : (
              <span style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid #e3e8ee', borderTopColor: '#533afd', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            )}
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <p style={{ fontSize: '11px', fontWeight: 300, color: '#a8c3de', textAlign: 'center', marginTop: '24px', lineHeight: 1.7 }}>
            By signing in you agree to our Terms of Service.<br />Your study data stays private.
          </p>
        </div>

        {/* Feature chips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '20px' }}>
          {[
            { icon: BookOpen, label: 'AI Tutor', color: '#533afd' },
            { icon: BarChart3, label: 'Grade Tracker', color: '#4434d4' },
            { icon: Brain, label: 'Study Plans', color: '#665efd' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
              <Icon style={{ width: 16, height: 16, color, margin: '0 auto 6px' }} />
              <p style={{ fontSize: '11px', color: '#64748d', fontWeight: 300 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
