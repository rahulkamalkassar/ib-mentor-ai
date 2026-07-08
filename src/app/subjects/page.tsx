'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { getSubjectAccent } from '@/lib/utils'
import { OnboardingData } from '@/types'
import {
  BookOpen, ChevronRight, Plus,
  Calculator, FlaskConical, Microscope, TrendingUp, BookMarked,
  Map, Brain, Briefcase, Code2, Palette, Music, Globe, Leaf,
  Lightbulb, Globe2, Drama, Atom, Film, Languages
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const SUBJECT_ICONS: { keyword: string; icon: LucideIcon }[] = [
  { keyword: 'Mathematics: Analysis', icon: Calculator },
  { keyword: 'Mathematics: Appli',    icon: Calculator },
  { keyword: 'Mathematics',           icon: Calculator },
  { keyword: 'Physics',               icon: Atom },
  { keyword: 'Chemistry',             icon: FlaskConical },
  { keyword: 'Biology',               icon: Microscope },
  { keyword: 'Economics',             icon: TrendingUp },
  { keyword: 'History',               icon: BookMarked },
  { keyword: 'Geography',             icon: Map },
  { keyword: 'Psychology',            icon: Brain },
  { keyword: 'Business',              icon: Briefcase },
  { keyword: 'English A',             icon: BookOpen },
  { keyword: 'English B',             icon: Languages },
  { keyword: 'English',               icon: BookOpen },
  { keyword: 'Computer',              icon: Code2 },
  { keyword: 'Visual Arts',           icon: Palette },
  { keyword: 'Music',                 icon: Music },
  { keyword: 'Theatre',               icon: Drama },
  { keyword: 'Film',                  icon: Film },
  { keyword: 'Spanish',               icon: Globe },
  { keyword: 'French',                icon: Globe },
  { keyword: 'German',                icon: Globe },
  { keyword: 'Environmental',         icon: Leaf },
  { keyword: 'Philosophy',            icon: Lightbulb },
  { keyword: 'Global Politics',       icon: Globe2 },
  { keyword: 'Language',              icon: Languages },
]

function getSubjectIcon(name: string): LucideIcon {
  return SUBJECT_ICONS.find(({ keyword }) => name.includes(keyword))?.icon ?? BookOpen
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
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
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · Click to open workspace
              </p>
              <button
                onClick={() => router.push('/onboarding')}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 gap-4"
            >
              {subjects.map((subject, i) => {
                const accent = getSubjectAccent(i)
                const SubjectIcon = getSubjectIcon(subject.name)
                const weakCount = (userData?.weakTopics?.[subject.name] || []).length
                return (
                  <motion.div key={subject.name} variants={cardVariants}>
                    <div
                      onClick={() => router.push(`/subjects/${encodeURIComponent(subject.name)}`)}
                      className="card card-hover cursor-pointer p-5 group"
                      style={{ borderLeft: `3px solid ${accent}` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div style={{
                          width: 40, height: 40,
                          borderRadius: '10px',
                          background: `${accent}18`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <SubjectIcon style={{ width: 18, height: 18, color: accent }} />
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-md"
                            style={{ background: `${accent}18`, color: accent }}
                          >
                            {subject.level}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                        </div>
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm leading-snug">{subject.name}</h3>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{subject.group}</p>
                      {weakCount > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
                          <span className="text-xs" style={{ color: '#f59e0b' }}>{weakCount} weak topic{weakCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--accent-purple-dim)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <BookOpen className="w-8 h-8" style={{ color: 'var(--accent-purple)' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No subjects yet</h3>
            <p className="text-sm text-center max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              Complete the setup quiz to add your IB subjects
            </p>
            <button onClick={() => router.push('/onboarding')} className="btn-primary px-6 py-2.5">Set Up Subjects</button>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}
