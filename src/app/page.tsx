'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('ib_onboarding_complete')
    if (onboardingComplete === 'true') {
      router.push('/dashboard')
    } else {
      router.push('/onboarding')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0d0f1a' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
          <span className="text-white text-xl">✦</span>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7c3aed', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
