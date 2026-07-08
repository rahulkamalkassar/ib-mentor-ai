'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Search, LogOut, User } from 'lucide-react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/login' })
  }

  const avatarUrl = session?.user?.image ?? undefined
  const name = session?.user?.name ?? session?.user?.email ?? 'IB'
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header
      className="flex items-center justify-between px-7"
      style={{
        height: '60px',
        borderBottom: '1px solid var(--color-hairline)',
        background: 'var(--color-canvas)',
        boxShadow: 'rgba(0,55,112,0.06) 0 1px 3px',
      }}
    >
      <div className="flex items-baseline gap-3">
        <h1 style={{ fontSize: '15px', fontWeight: 400, color: 'var(--color-ink)', letterSpacing: '-0.15px' }}>{title}</h1>
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--color-ink-mute)', fontWeight: 300 }}>{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-ink-mute)' }} />
          <input
            type="text"
            placeholder="Search..."
            className="input-dark"
            style={{ paddingLeft: '34px', height: '32px', width: '180px', borderRadius: '9999px', fontSize: '13px' }}
          />
        </div>

        <button
          className="relative w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ border: '1px solid var(--color-hairline)', background: 'var(--color-canvas)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-canvas-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-canvas)')}
        >
          <Bell className="w-4 h-4" style={{ color: 'var(--color-ink-mute)' }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
        </button>

        {/* Avatar + dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-primary)', cursor: 'pointer', padding: 0, background: 'none', flexShrink: 0 }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #533afd, #4434d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 400, color: 'white' }}>
                {initials}
              </div>
            )}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: '40px', right: 0, width: '220px',
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-hairline)',
              borderRadius: '12px',
              boxShadow: 'rgba(0,55,112,0.1) 0 8px 24px, rgba(0,55,112,0.05) 0 2px 6px',
              zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #533afd, #4434d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 400, color: 'white', flexShrink: 0 }}>
                      {initials}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user?.email}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => { setMenuOpen(false); router.push('/settings') }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-mute)', fontSize: '13px', fontWeight: 300, textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-canvas-soft)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <User style={{ width: 14, height: 14 }} /> Account Settings
                </button>
                <button
                  onClick={signOut}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ruby)', fontSize: '13px', fontWeight: 300, textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(234,34,97,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut style={{ width: 14, height: 14 }} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
