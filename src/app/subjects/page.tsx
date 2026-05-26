'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { getSubjectAccent } from '@/lib/utils'
import { OnboardingData } from '@/types'
import { BookOpen, ChevronRight, Plus } from 'lucide-react'

const SUBJECT_EMOJIS: { keyword: string; emoji: string }[] = [
  { keyword: 'Mathematics: Analysis', emoji: '∑' },
  { keyword: 'Mathematics: Appli',    emoji: '📊' },
  { keyword: 'Mathematics',           emoji: '∑' },
  { keyword: 'Physics',               emoji: '⚛️' },
  { keyword: 'Chemistry',             emoji: '🧪' },
  { keyword: 'Biology',               emoji: '🧬' },
  { keyword: 'Economics',             emoji: '📈' },
  { keyword: 'History',               emoji: '📜' },
  { keyword: 'Geography',             emoji: '🌍' },
  { keyword: 'Psychology',            emoji: '🧠' },
  { keyword: 'Business',              emoji: '💼' },
  { keyword: 'English A: Lit',        emoji: '📚' },
  { keyword: 'English A: Lang',       emoji: '✍️' },
  { keyword: 'English',               emoji: '📚' },
  { keyword: 'Computer',              emoji: '💻' },
  { keyword: 'Visual Arts',           emoji: '🎨' },
  { keyword: 'Music',                 emoji: '🎵' },
  { keyword: 'Theatre',               emoji: '🎭' },
  { keyword: 'Spanish',               emoji: '🇪🇸' },
  { keyword: 'French',                emoji: '🇫🇷' },
  { keyword: 'Environmental',         emoji: '🌱' },
  { keyword: 'Philosophy',            emoji: '💭' },
  { keyword: 'Global Politics',       emoji: '🌐' },
  { keyword: 'Language',              emoji: '🗣️' },
]

function getEmoji(name: string) {
  return SUBJECT_EMOJIS.find(({ keyword }) => name.includes(keyword))?.emoji ?? '📖'
}

export default function SubjectsPage() {
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) setUserData(JSON.parse(data))
  }, [])

  const subjects = userData?.subjects || []

  return (
    <MainLayout>
      <Header title="Subjects & Revision" subtitle="Your personalised study workspace" />
      <div className="p-8">
        {subjects.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: '#64748b' }}>{subjects.length} subjects · Click to open workspace</p>
              <button
                onClick={() => router.push('/onboarding')}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors"
                style={{ background: '#161827', border: '1px solid #1e2a3a', color: '#94a3b8' }}
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {subjects.map((subject, i) => {
                const accent = getSubjectAccent(i)
                const emoji = getEmoji(subject.name)
                const weakCount = (userData?.weakTopics?.[subject.name] || []).length
                return (
                  <div
                    key={subject.name}
                    onClick={() => router.push(`/subjects/${encodeURIComponent(subject.name)}`)}
                    className="card card-hover cursor-pointer p-6 group"
                    style={{ borderLeft: `4px solid ${accent}` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      {/* Emoji in contained box — prevents overflow */}
                      <div style={{
                        width: 44, height: 44,
                        borderRadius: '12px',
                        background: `${accent}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        lineHeight: 1,
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}>
                        {emoji}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: `${accent}20`, color: accent }}
                        >
                          {subject.level}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                      </div>
                    </div>
                    <h3 className="font-bold text-white mb-1 leading-snug">{subject.name}</h3>
                    <p className="text-xs mb-4" style={{ color: '#64748b' }}>{subject.group}</p>
                    {weakCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                        <span className="text-xs" style={{ color: '#f59e0b' }}>{weakCount} weak topic{weakCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <BookOpen className="w-10 h-10" style={{ color: '#7c3aed' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No subjects yet</h3>
            <p className="text-sm text-center max-w-xs mb-6" style={{ color: '#64748b' }}>
              Complete the setup quiz to add your IB subjects
            </p>
            <button onClick={() => router.push('/onboarding')} className="btn-primary px-6 py-3">Set Up Subjects</button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
