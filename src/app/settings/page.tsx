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
          <h2 className="text-lg mb-5" style={{ fontWeight: 400, color: '#0d253d' }}>Appearance</h2>
          <div className="space-y-4">
            {[
              { label: 'Reduce motion', desc: 'Disable animations and transitions', value: reduceMotion, toggle: setReduceMotion },
              { label: 'Compact layout', desc: 'Use a denser layout with less spacing', value: compactLayout, toggle: setCompactLayout },
            ].map(setting => (
              <div key={setting.label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                <div>
                  <p className="text-sm" style={{ fontWeight: 400, color: '#0d253d' }}>{setting.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748d', fontWeight: 300 }}>{setting.desc}</p>
                </div>
                <button
                  onClick={() => setting.toggle(!setting.value)}
                  className="w-12 h-6 rounded-full relative transition-all duration-300"
                  style={{ background: setting.value ? '#533afd' : '#e3e8ee' }}
                >
                  <div
                    className="absolute w-5 h-5 rounded-full top-0.5 transition-all duration-300"
                    style={{ left: setting.value ? '26px' : '2px', background: 'white', boxShadow: '0 1px 3px rgba(0,55,112,0.15)' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg" style={{ fontWeight: 400, color: '#0d253d' }}>Profile Summary</h2>
            <span className="pill-tag-soft">Read-only</span>
          </div>
          {userData ? (
            <div className="space-y-3">
              {profileSections.map(section => {
                const Icon = section.icon
                return (
                  <div key={section.label} className="flex items-center gap-4 py-2.5" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(83,58,253,0.08)' }}>
                      <Icon className="w-4 h-4" style={{ color: '#533afd' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: '#64748d', fontWeight: 300 }}>{section.label}</p>
                      <p className="text-sm" style={{ fontWeight: 400, color: '#0d253d' }}>{section.value}</p>
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
          <h2 className="text-lg mb-5" style={{ fontWeight: 400, color: '#0d253d' }}>Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
              <p className="text-sm" style={{ fontWeight: 300, color: '#273951' }}>Email</p>
              <p className="text-sm" style={{ color: '#64748d', fontWeight: 300 }}>rahulkamalkassar@gmail.com</p>
            </div>
            <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
              <p className="text-sm" style={{ fontWeight: 300, color: '#273951' }}>Plan</p>
              <span className="pill-tag-soft">Free</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <p className="text-sm" style={{ fontWeight: 300, color: '#273951' }}>Version</p>
              <p className="text-sm" style={{ color: '#64748d', fontWeight: 300 }}>IB Mentor AI v1.0</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-hairline)' }}>
            <button className="text-sm" style={{ fontWeight: 300, color: '#ea2261' }}>Delete account</button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
