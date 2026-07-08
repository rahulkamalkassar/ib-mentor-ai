'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, BookOpen,
  ClipboardList, BarChart3, Settings, Zap, Scroll, Brain, ListChecks, GraduationCap, Library
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'

const mainNav = [
  { href: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/calendar',       label: 'Calendar',        icon: Calendar },
  { href: '/subjects',       label: 'Subjects',        icon: BookOpen },
  { href: '/practice-tests', label: 'Practice Tests',  icon: ClipboardList },
  { href: '/past-papers',    label: 'Past Papers',     icon: Library },
  { href: '/grades',         label: 'Grades',          icon: BarChart3 },
  { href: '/study-plan',     label: 'Study Plan',      icon: ListChecks },
]

const toolNav = [
  { href: '/ee-helper',        label: 'EE Helper',       icon: Scroll },
  { href: '/tok-teacher',      label: 'TOK Teacher',     icon: Brain },
  { href: '/uni-counsellor',   label: 'Uni Counsellor',  icon: GraduationCap },
]

const bottomNav = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/upgrade',  label: 'Upgrade',  icon: Zap, isPro: true },
]

function NavLink({ href, label, icon: Icon, isPro }: { href: string; label: string; icon: React.ElementType; isPro?: boolean }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  if (isPro) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 rounded-lg transition-all duration-150"
        style={{
          color: '#b9b9f9',
          fontSize: '13.5px',
          fontWeight: 300,
          padding: '9px 12px',
          background: 'rgba(185,185,249,0.1)',
        }}
      >
        <Icon className="w-[17px] h-[17px] flex-shrink-0" style={{ color: '#b9b9f9' }} />
        <span>{label}</span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(83,58,253,0.4)', color: '#b9b9f9', letterSpacing: '0.05em' }}>PRO</span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg transition-all duration-150',
        active ? 'sidebar-active' : ''
      )}
      style={{
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        fontSize: '13.5px',
        fontWeight: 300,
        padding: '9px 12px',
        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <Icon
        className="flex-shrink-0"
        style={{ width: '17px', height: '17px', color: active ? '#b9b9f9' : 'rgba(255,255,255,0.35)' }}
      />
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40"
      style={{ width: 'var(--sidebar-width)', background: '#1c1e54', borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: '60px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Logo size="sm" variant="horizontal" />
      </div>

      {/* Main nav */}
      <nav className="px-2 pt-4 space-y-0.5">
        {mainNav.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* AI Tools divider */}
      <div style={{ margin: '10px 16px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
      <nav className="px-2 pt-3 space-y-0.5">
        {toolNav.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      <div className="flex-1" />

      {/* Bottom */}
      <div className="px-2 pb-4 pt-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {bottomNav.map(item => <NavLink key={item.href} {...item} />)}
      </div>
    </aside>
  )
}
