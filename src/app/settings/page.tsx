'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { RotateCcw, User, Monitor, BookOpen, Target, Clock, Brain } from 'lucide-react'
import { OnboardingData } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [compactLayout, setCompactLayout] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) setUserData(JSON.parse(data))
  }, [])

  const handleResetOnboarding = () => {
    localStorage.removeItem('ib_onboarding_complete')
    localStorage.removeItem('ib_onboarding_data')
    router.push('/onboarding')
  }

  const profileSections = userData ? [
    { icon: User, label: 'Programme', value: userData.programme },
    { icon: BookOpen, label: 'Subjects', value: `${userData.subjects?.length || 0} subjects` },
    { icon: Target, label: 'Target Score', value: userData.goalPoints ? `${userData.goalPoints}/45` : 'Not set' },
    { icon: Clock, label: 'Study Load', value: `${userData.studyHours || 0}h/week · ${(userData.studyTimes || []).join(', ') || 'Not set'}` },
    { icon: Monitor, label: 'Exam Timeline', value: userData.examProximity || 'Not set' },
    { icon: Brain, label: 'AI Personality', value: userData.aiPersonality || 'Friendly tutor' },
  ] : []

  return (
    <MainLayout>
      <Header title="Settings" subtitle="Manage your profile and preferences" />
      <div className="p-8 max-w-3xl space-y-6">
        {/* Appearance */}
        <div className="card p-6">
          <h2 className="font-bold text-white text-lg mb-5">Appearance</h2>
          <div className="space-y-4">
            {[
              { label: 'Reduce motion', desc: 'Disable animations and transitions', value: reduceMotion, toggle: setReduceMotion },
              { label: 'Compact layout', desc: 'Use a denser layout with less spacing', value: compactLayout, toggle: setCompactLayout },
            ].map(setting => (
              <div key={setting.label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #1a1d2e' }}>
                <div>
                  <p className="text-sm font-medium text-white">{setting.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{setting.desc}</p>
                </div>
                <button
                  onClick={() => setting.toggle(!setting.value)}
                  className="w-12 h-6 rounded-full relative transition-all duration-300"
                  style={{ background: setting.value ? '#7c3aed' : '#1e2a3a' }}
                >
                  <div
                    className="absolute w-5 h-5 rounded-full top-0.5 transition-all duration-300"
                    style={{ left: setting.value ? '26px' : '2px', background: 'white' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white text-lg">Profile Summary</h2>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#1e2a3a', color: '#64748b' }}>Read-only</span>
          </div>
          {userData ? (
            <div className="space-y-3">
              {profileSections.map(section => {
                const Icon = section.icon
                return (
                  <div key={section.label} className="flex items-center gap-4 py-2.5" style={{ borderBottom: '1px solid #1a1d2e' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)' }}>
                      <Icon className="w-4 h-4" style={{ color: '#7c3aed' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: '#64748b' }}>{section.label}</p>
                      <p className="text-sm font-medium text-white">{section.value}</p>
                    </div>
                  </div>
                )
              })}
              {userData.subjects?.length > 0 && (
                <div className="pt-3">
                  <p className="text-xs mb-2" style={{ color: '#64748b' }}>Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {userData.subjects.map(s => (
                      <span key={s.name} className="tag tag-purple text-xs">
                        {s.name.split(':')[0].split(' ').slice(0, 2).join(' ')} · {s.level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#64748b' }}>No profile data. Complete the setup quiz first.</p>
          )}
          <button
            onClick={handleResetOnboarding}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all btn-secondary"
          >
            <RotateCcw className="w-4 h-4" /> Edit full setup (questionnaire)
          </button>
        </div>

        {/* Account */}
        <div className="card p-6">
          <h2 className="font-bold text-white text-lg mb-5">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #1a1d2e' }}>
              <p className="text-sm text-white">Email</p>
              <p className="text-sm" style={{ color: '#64748b' }}>rahulkamalkassar@gmail.com</p>
            </div>
            <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #1a1d2e' }}>
              <p className="text-sm text-white">Plan</p>
              <span className="tag tag-purple text-xs">Free</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <p className="text-sm text-white">Version</p>
              <p className="text-sm" style={{ color: '#64748b' }}>IB Mentor AI v1.0</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1a1d2e' }}>
            <button className="text-sm font-medium" style={{ color: '#ef4444' }}>Delete account</button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
