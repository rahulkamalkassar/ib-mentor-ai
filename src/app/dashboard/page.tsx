'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  TrendingUp, Calendar, BookOpen, Target, AlertTriangle,
  ArrowRight, ClipboardList, MessageCircle, Flame, Clock
} from 'lucide-react'
import { getSubjectAccent, gradeColor } from '@/lib/utils'
import { OnboardingData } from '@/types'
import Link from 'next/link'

const MOCK_GRADES: Record<string, number> = {
  'Mathematics: Analysis and Approaches': 6,
  'Physics': 5,
  'Chemistry': 4,
  'Economics': 7,
  'English A: Literature': 6,
  'Biology': 5,
  'Psychology': 5,
  'History': 6,
}

const UPCOMING = [
  { title: 'Math IA Draft Due',     type: 'IA',        date: 'Tomorrow',    dot: '#f59e0b' },
  { title: 'Physics Paper 2 Mock',  type: 'exam',      date: 'Fri, 30 May', dot: '#ef4444' },
  { title: 'Chemistry Lab Report',  type: 'summative', date: 'Mon, 2 Jun',  dot: '#7c3aed' },
]

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  return (
    <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Icon style={{ width: '22px', height: '22px', color: iconColor }} />
      </div>
      <p style={{ fontSize: '52px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 4px' }}>{label}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) setUserData(JSON.parse(data))
    const h = new Date().getHours()
    if (h >= 12 && h < 17) setGreeting('Good afternoon')
    else if (h >= 17) setGreeting('Good evening')
  }, [])

  const subjects = userData?.subjects || []
  const totalLikely = subjects.reduce((acc, s) => acc + (MOCK_GRADES[s.name] ?? 5), 0)
  const maxPoints = subjects.length ? subjects.length * 7 : 42

  return (
    <MainLayout>
      <Header title="Dashboard" subtitle={greeting} />

      <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1040 0%, #0e1830 60%, #0c0e1a 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '16px',
            padding: '28px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: 'radial-gradient(ellipse at 85% 40%, #7c3aed 0%, transparent 55%)',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {userData?.programme || 'IB Diploma Programme'} · {userData?.examProximity || '3–6 months'} to exams
              </p>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: '18px' }}>
                Welcome back,<br />
                <span style={{ background: 'linear-gradient(90deg, #a78bfa, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  IB Student
                </span>
              </h2>
              <button
                className="btn-primary"
                style={{ gap: '8px', fontSize: '13px' }}
                onClick={() => document.querySelector<HTMLButtonElement>('[data-ai-trigger]')?.click()}
              >
                <MessageCircle style={{ width: '14px', height: '14px' }} />
                Ask AI Tutor
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <Link href="/ee-helper" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
                  borderRadius: '12px', padding: '14px 18px', textAlign: 'center', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#c4b5fd' }}>EE Helper</p>
                  <p style={{ fontSize: '11px', color: '#6d5fa8', marginTop: '2px' }}>Essay support</p>
                </div>
              </Link>
              <Link href="/tok-teacher" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)',
                  borderRadius: '12px', padding: '14px 18px', textAlign: 'center', cursor: 'pointer',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#67e8f9' }}>TOK Teacher</p>
                  <p style={{ fontSize: '11px', color: '#3b7f8f', marginTop: '2px' }}>Theory of Knowledge</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          <StatCard
            label="Predicted Score" value={totalLikely || 33}
            sub={`out of ${maxPoints}`}
            icon={TrendingUp} iconBg="rgba(124,58,237,0.15)" iconColor="#a78bfa"
          />
          <StatCard
            label="Subjects" value={subjects.length || 6}
            sub="HL & SL combined"
            icon={BookOpen} iconBg="rgba(6,182,212,0.12)" iconColor="#67e8f9"
          />
          <StatCard
            label="Assessments Due" value={3}
            sub="Next: Tomorrow"
            icon={Calendar} iconBg="rgba(239,68,68,0.12)" iconColor="#f87171"
          />
          <StatCard
            label="Study Streak" value="12"
            sub="days in a row"
            icon={Flame} iconBg="rgba(245,158,11,0.12)" iconColor="#fbbf24"
          />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>

          {/* Subjects */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>My Subjects</h2>
              <Link href="/subjects" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#7c3aed', textDecoration: 'none' }}>
                View all <ArrowRight style={{ width: '12px', height: '12px' }} />
              </Link>
            </div>

            {subjects.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {subjects.slice(0, 6).map((subject, i) => {
                  const accent = getSubjectAccent(i)
                  const grade = MOCK_GRADES[subject.name] ?? 5
                  return (
                    <Link key={subject.name} href="/subjects" style={{ textDecoration: 'none' }}>
                      <div
                        className="card-hover"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderLeft: `3px solid ${accent}`,
                          borderRadius: '10px',
                          padding: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: '#fff', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {subject.name.split(':')[0].trim()}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {subject.level} · {subject.group}
                            </p>
                          </div>
                          <p style={{ fontWeight: 700, fontSize: '18px', color: gradeColor(grade), flexShrink: 0 }}>
                            {grade}<span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>/7</span>
                          </p>
                        </div>
                        <div className="progress-bar" style={{ marginTop: '10px' }}>
                          <div style={{ height: '100%', borderRadius: '10px', background: accent, width: `${(grade / 7) * 100}%`, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <BookOpen style={{ width: '22px', height: '22px', color: '#7c3aed' }} />
                </div>
                <p style={{ fontWeight: 600, color: '#fff', marginBottom: '6px' }}>No subjects yet</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Complete onboarding to add your subjects</p>
                <Link href="/onboarding">
                  <button className="btn-primary" style={{ fontSize: '13px' }}>Set up subjects</button>
                </Link>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Upcoming */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>Upcoming</h3>
                <Link href="/calendar" style={{ fontSize: '11px', color: '#7c3aed', textDecoration: 'none' }}>Calendar</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {UPCOMING.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: e.dot, marginTop: '6px', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{e.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '12px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { href: '/practice-tests', icon: ClipboardList, label: 'Practice Tests',   color: '#a78bfa' },
                  { href: '/ee-helper',      icon: Target,         label: 'EE Helper',        color: '#67e8f9' },
                  { href: '/tok-teacher',    icon: Clock,          label: 'TOK Teacher',      color: '#34d399' },
                  { href: '/grades',         icon: TrendingUp,     label: 'Grade Tracker',    color: '#fbbf24' },
                ].map(({ href, icon: Icon, label, color }) => (
                  <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                    <button
                      className="btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '9px 10px', borderRadius: '8px' }}
                    >
                      <Icon style={{ width: '14px', height: '14px', color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Priority areas */}
            {userData?.weakTopics && Object.keys(userData.weakTopics).length > 0 && (
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertTriangle style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                  <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>Priority Areas</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {subjects.slice(0, 3).map(subject => {
                    const topics = (userData.weakTopics || {})[subject.name] || []
                    if (!topics.length) return null
                    return (
                      <div key={subject.name}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                          {subject.name.split(':')[0]}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {topics.slice(0, 2).map(t => (
                            <span key={t} className="tag tag-yellow">{t}</span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
