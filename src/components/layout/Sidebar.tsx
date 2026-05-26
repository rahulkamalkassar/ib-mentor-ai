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
        className="flex items-center gap-3 px-3 rounded-lg font-semibold transition-all duration-150 hover:bg-purple-500/10"
        style={{ color: '#a78bfa', fontSize: '14px', padding: '10px 12px' }}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: '#a78bfa' }} />
        <span>{label}</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd' }}>PRO</span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg font-semibold transition-all duration-150',
        active ? 'sidebar-active' : 'hover:bg-white/[0.05]'
      )}
      style={{ color: active ? '#fff' : 'var(--text-secondary)', fontSize: '14px', padding: '10px 12px' }}
    >
      <Icon
        className="flex-shrink-0"
        style={{ width: '18px', height: '18px', color: active ? '#a78bfa' : 'var(--text-muted)' }}
      />
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40"
      style={{ width: 'var(--sidebar-width)', background: '#0d0f1e', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Logo size="sm" variant="horizontal" />
      </div>

      {/* Main nav */}
      <nav className="px-2 pt-4 space-y-0.5">
        {mainNav.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* AI Tools section — no label, just a divider */}
      <div style={{ margin: '8px 16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
      <nav className="px-2 pt-3 space-y-0.5">
        {toolNav.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom */}
      <div className="px-2 pb-4 pt-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {bottomNav.map(item => <NavLink key={item.href} {...item} />)}
      </div>
    </aside>
  )
}
