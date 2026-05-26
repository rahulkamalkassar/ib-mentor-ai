'use client'

import Sidebar from './Sidebar'
import AIHelper from '@/components/ai/AIHelper'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-width)', minHeight: '100vh', flex: 1 }}>
        {children}
      </main>
      <AIHelper />
    </div>
  )
}
