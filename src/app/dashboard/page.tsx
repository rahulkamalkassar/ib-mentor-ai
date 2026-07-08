'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  TrendingUp, Calendar, BookOpen, AlertTriangle,
  ArrowRight, ClipboardList, MessageCircle, Flame, Clock,
  CheckSquare, Square, Plus, Target
} from 'lucide-react'
import { getSubjectAccent, gradeColor } from '@/lib/utils'
import { OnboardingData } from '@/types'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { animate, useMotionValue, useTransform } from 'framer-motion'

interface CalendarEvent {
  id: string
  title: string
  type: string
  date: string
  time?: string
  description?: string
  subjectColor?: string
}

const TYPE_COLOR: Record<string, string> = {
  exam: '#ea2261',
  IA: '#9b6829',
  mock: '#f97316',
  summative: '#533afd',
  homework: '#06b6d4',
  revision: '#10b981',
  other: '#64748d',
}

const ASSESSMENT_TYPES = new Set(['exam', 'IA', 'summative', 'mock', 'oral'])

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatUpcomingDate(dateStr: string): string {
  const today = todayStr()
  const d = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((d.getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= 6) return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function getOrSetStreak(): number {
  const today = todayStr()
  const lastDate = localStorage.getItem('ib_streak_date')
  const streak = parseInt(localStorage.getItem('ib_streak_count') || '0', 10)

  if (!lastDate) {
    localStorage.setItem('ib_streak_date', today)
    localStorage.setItem('ib_streak_count', '1')
    return 1
  }
  if (lastDate === today) return streak

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  if (lastDate === yStr) {
    const next = streak + 1
    localStorage.setItem('ib_streak_date', today)
    localStorage.setItem('ib_streak_count', String(next))
    return next
  }

  localStorage.setItem('ib_streak_date', today)
  localStorage.setItem('ib_streak_count', '1')
  return 1
}

function AnimatedNumber({ target, duration = 0.9 }: { target: number; duration?: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true
    const controls = animate(count, target, { duration, ease: 'easeOut' })
    return controls.stop
  }, [target, count, duration])

  return <motion.span>{rounded}</motion.span>
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, animate: shouldAnimate }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  animate?: boolean;
}) {
  return (
    <div className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <Icon style={{ width: '18px', height: '18px', color: iconColor }} />
      </div>
      <p className="tabular" style={{ fontSize: '40px', fontWeight: 300, color: '#0d253d', lineHeight: 1, letterSpacing: '-0.96px' }}>
        {(shouldAnimate && typeof value === 'number') ? <AnimatedNumber target={value} /> : value}
      </p>
      <p style={{ fontSize: '12px', fontWeight: 400, color: '#273951', margin: '10px 0 3px' }}>{label}</p>
      <p style={{ fontSize: '11px', color: '#64748d', fontWeight: 300 }}>{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [greeting, setGreeting] = useState('Good morning')
  const [todayTasks, setTodayTasks] = useState<CalendarEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)
  const [assessmentsDueCount, setAssessmentsDueCount] = useState(0)

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) setUserData(JSON.parse(data))

    const h = new Date().getHours()
    if (h >= 12 && h < 17) setGreeting('Good afternoon')
    else if (h >= 17) setGreeting('Good evening')

    setStreak(getOrSetStreak())

    const raw = localStorage.getItem('ib_calendar_events')
    if (raw) {
      const events: CalendarEvent[] = JSON.parse(raw)
      const today = todayStr()

      setTodayTasks(events.filter(e => e.date === today))

      const next7 = events
        .filter(e => e.date > today)
        .sort((a, b) => a.date.localeCompare(b.date))

      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() + 7)
      const weekEndStr = weekEnd.toISOString().slice(0, 10)
      setAssessmentsDueCount(next7.filter(e => ASSESSMENT_TYPES.has(e.type) && e.date <= weekEndStr).length)

      setUpcomingEvents(next7.slice(0, 5))
    }

    const doneRaw = localStorage.getItem('ib_todo_done')
    if (doneRaw) setDoneTasks(new Set(JSON.parse(doneRaw)))
  }, [])

  const toggleDone = (id: string) => {
    setDoneTasks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      localStorage.setItem('ib_todo_done', JSON.stringify([...next]))
      return next
    })
  }

  const subjects = userData?.subjects || []
  const grades = userData?.mockGrades && Object.keys(userData.mockGrades).length > 0
    ? userData.mockGrades
    : userData?.subjectGoalGrades || {}
  const usingGoals = !userData?.mockGrades || Object.keys(userData.mockGrades).length === 0
  const totalLikely = subjects.reduce((acc, s) => acc + (grades[s.name] ?? 5), 0)
  const maxPoints = subjects.length ? subjects.length * 7 : 42

  const firstName = session?.user?.name?.split(' ')[0] ?? null

  const heroSubtext = assessmentsDueCount > 0
    ? `${assessmentsDueCount} assessment${assessmentsDueCount === 1 ? '' : 's'} due this week`
    : 'No assessments due this week — study ahead'

  return (
    <MainLayout>
      <Header title="Dashboard" subtitle={greeting} />

      <div style={{ padding: '28px 36px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            background: '#ffffff',
            border: '1px solid #e3e8ee',
            borderRadius: '12px',
            padding: '28px 32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'rgba(0,55,112,0.08) 0 1px 3px',
          }}
        >
          {/* Subtle indigo glow */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '280px', height: '100%', background: 'radial-gradient(ellipse at 100% 50%, rgba(83,58,253,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#64748d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 400 }}>
                {userData?.programme || 'IB Diploma Programme'} · {userData?.examProximity || '3–6 months'} to exams
              </p>
              <h2 style={{ fontSize: '26px', fontWeight: 300, color: '#0d253d', lineHeight: 1.12, marginBottom: '6px', letterSpacing: '-0.26px' }}>
                {greeting}{firstName ? `, ${firstName}` : ''}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748d', marginBottom: '20px', fontWeight: 300 }}>
                {heroSubtext}
              </p>
              <button
                className="btn-primary"
                style={{ gap: '8px', fontSize: '14px' }}
                onClick={() => document.querySelector<HTMLButtonElement>('[data-ai-trigger]')?.click()}
              >
                <MessageCircle style={{ width: '14px', height: '14px' }} />
                Ask AI Tutor
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <Link href="/ee-helper" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(83,58,253,0.15)',
                  borderRadius: '10px', padding: '12px 18px', textAlign: 'center', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(83,58,253,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(83,58,253,0.06)')}
                >
                  <p style={{ fontSize: '12px', fontWeight: 400, color: '#533afd' }}>EE Helper</p>
                  <p style={{ fontSize: '11px', color: '#64748d', marginTop: '2px', fontWeight: 300 }}>Essay support</p>
                </div>
              </Link>
              <Link href="/tok-teacher" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '10px', padding: '12px 18px', textAlign: 'center', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.06)')}
                >
                  <p style={{ fontSize: '12px', fontWeight: 400, color: '#065f46' }}>TOK Teacher</p>
                  <p style={{ fontSize: '11px', color: '#64748d', marginTop: '2px', fontWeight: 300 }}>Theory of Knowledge</p>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}
        >
          {[
            {
              label: usingGoals ? 'Target Score' : 'Predicted Score',
              value: subjects.length ? totalLikely : '--',
              sub: subjects.length ? `out of ${maxPoints}` : 'Add subjects to track',
              icon: TrendingUp, iconBg: 'rgba(83,58,253,0.08)', iconColor: '#533afd',
              animate: !!subjects.length,
            },
            {
              label: 'Subjects',
              value: subjects.length || 0,
              sub: subjects.length ? 'HL & SL combined' : 'Complete onboarding',
              icon: BookOpen, iconBg: 'rgba(6,182,212,0.08)', iconColor: '#0e7490',
              animate: true,
            },
            {
              label: 'Tasks Today',
              value: todayTasks.length,
              sub: todayTasks.length === 0 ? 'Nothing scheduled' : `${todayTasks.filter(t => !doneTasks.has(t.id)).length} remaining`,
              icon: Calendar, iconBg: 'rgba(234,34,97,0.08)', iconColor: '#ea2261',
              animate: true,
            },
            {
              label: 'Study Streak',
              value: streak,
              sub: streak === 1 ? 'Day 1 — keep going' : `${streak} days in a row`,
              icon: Flame, iconBg: 'rgba(155,104,41,0.1)', iconColor: '#9b6829',
              animate: true,
            },
          ].map(card => (
            <motion.div key={card.label} variants={cardVariants}>
              <StatCard {...card} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px' }}>

          {/* Subjects */}
          <motion.div
            className="card"
            style={{ padding: '22px' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.18 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontWeight: 400, color: '#0d253d', fontSize: '14px' }}>My Subjects</h2>
              <Link href="/subjects" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#533afd', textDecoration: 'none', fontWeight: 300 }}>
                View all <ArrowRight style={{ width: '11px', height: '11px' }} />
              </Link>
            </div>

            {subjects.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
              >
                {subjects.slice(0, 6).map((subject, i) => {
                  const accent = getSubjectAccent(i)
                  const grade = grades[subject.name] ?? null
                  return (
                    <motion.div key={subject.name} variants={cardVariants}>
                      <Link href="/subjects" style={{ textDecoration: 'none' }}>
                        <div
                          className="card-hover"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e3e8ee',
                            borderLeft: `3px solid ${accent}`,
                            borderRadius: '10px',
                            padding: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 400, color: '#0d253d', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {subject.name.split(':')[0].trim()}
                              </p>
                              <p style={{ fontSize: '10px', color: '#64748d', marginTop: '2px', fontWeight: 300 }}>
                                {subject.level} · {subject.group}
                              </p>
                            </div>
                            {grade !== null && (
                              <p className="tabular" style={{ fontWeight: 300, fontSize: '17px', color: gradeColor(grade), flexShrink: 0 }}>
                                {grade}<span style={{ fontSize: '10px', color: '#64748d', fontWeight: 300 }}>/7</span>
                              </p>
                            )}
                          </div>
                          {grade !== null && (
                            <div className="progress-bar" style={{ marginTop: '10px' }}>
                              <motion.div
                                style={{ height: '100%', borderRadius: '10px', background: accent }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(grade / 7) * 100}%` }}
                                transition={{ duration: 0.7, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                              />
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <BookOpen style={{ width: '20px', height: '20px', color: '#533afd' }} />
                </div>
                <p style={{ fontWeight: 400, color: '#0d253d', marginBottom: '5px' }}>No subjects yet</p>
                <p style={{ fontSize: '13px', color: '#64748d', marginBottom: '18px', fontWeight: 300 }}>Complete onboarding to add your subjects</p>
                <Link href="/onboarding">
                  <button className="btn-primary" style={{ fontSize: '13px' }}>Set up subjects</button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.24 }}
          >

            {/* Today's To-Do */}
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare style={{ width: 13, height: 13, color: '#533afd' }} />
                  <h3 style={{ fontWeight: 400, color: '#0d253d', fontSize: '12px' }}>Today&apos;s Tasks</h3>
                  {todayTasks.length > 0 && (
                    <span className="pill-tag-soft" style={{ fontSize: '10px' }}>
                      {todayTasks.filter(t => !doneTasks.has(t.id)).length} left
                    </span>
                  )}
                </div>
                <Link href="/calendar" style={{ fontSize: '11px', color: '#533afd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 300 }}>
                  <Plus style={{ width: 10, height: 10 }} />Add
                </Link>
              </div>

              {todayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: '12px', color: '#64748d', marginBottom: 6, fontWeight: 300 }}>Nothing scheduled for today</p>
                  <Link href="/calendar" style={{ fontSize: '11px', color: '#533afd', textDecoration: 'none', fontWeight: 300 }}>
                    Add to calendar →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {todayTasks.map(task => {
                    const done = doneTasks.has(task.id)
                    const color = task.subjectColor || TYPE_COLOR[task.type] || TYPE_COLOR.other
                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleDone(task.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px',
                          padding: '8px 9px', borderRadius: 8, cursor: 'pointer',
                          background: done ? '#f6f9fc' : 'rgba(83,58,253,0.05)',
                          border: `1px solid ${done ? '#e3e8ee' : 'rgba(83,58,253,0.12)'}`,
                          transition: 'all 0.15s',
                          opacity: done ? 0.55 : 1,
                        }}
                      >
                        {done
                          ? <CheckSquare style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                          : <Square style={{ width: 14, height: 14, color: '#64748d', flexShrink: 0, marginTop: 1 }} />
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: 300, color: done ? '#64748d' : '#0d253d', textDecoration: done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <span style={{ fontSize: '10px', fontWeight: 400, color }}>{task.type}</span>
                            {task.time && <span style={{ fontSize: '10px', color: '#64748d', fontWeight: 300 }}>· {task.time}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Upcoming */}
            {upcomingEvents.length > 0 && (
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontWeight: 400, color: '#0d253d', fontSize: '12px' }}>Coming Up</h3>
                  <Link href="/calendar" style={{ fontSize: '11px', color: '#533afd', textDecoration: 'none', fontWeight: 300 }}>Calendar</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {upcomingEvents.map(e => {
                    const color = e.subjectColor || TYPE_COLOR[e.type] || TYPE_COLOR.other
                    return (
                      <div key={e.id} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, marginTop: '6px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: 300, color: '#0d253d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
                          <p style={{ fontSize: '10px', color: '#64748d', marginTop: '1px', fontWeight: 300 }}>{formatUpcomingDate(e.date)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="card" style={{ padding: '18px' }}>
              <h3 style={{ fontWeight: 400, color: '#0d253d', fontSize: '12px', marginBottom: '10px' }}>Quick Access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { href: '/practice-tests', icon: ClipboardList, label: 'Practice Tests',   color: '#533afd' },
                  { href: '/ee-helper',      icon: Target,         label: 'EE Helper',        color: '#4434d4' },
                  { href: '/tok-teacher',    icon: Clock,          label: 'TOK Teacher',      color: '#10b981' },
                  { href: '/grades',         icon: TrendingUp,     label: 'Grade Tracker',    color: '#9b6829' },
                ].map(({ href, icon: Icon, label, color }) => (
                  <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                    <button
                      className="btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: '9px', padding: '8px 9px', borderRadius: '6px' }}
                    >
                      <Icon style={{ width: '13px', height: '13px', color, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: '#273951', fontWeight: 300 }}>{label}</span>
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Priority areas */}
            {userData?.weakTopics && Object.keys(userData.weakTopics).length > 0 && (
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                  <AlertTriangle style={{ width: '13px', height: '13px', color: '#9b6829' }} />
                  <h3 style={{ fontWeight: 400, color: '#0d253d', fontSize: '12px' }}>Priority Areas</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {subjects.slice(0, 3).map(subject => {
                    const topics = (userData.weakTopics || {})[subject.name] || []
                    if (!topics.length) return null
                    return (
                      <div key={subject.name}>
                        <p style={{ fontSize: '10px', fontWeight: 400, color: '#273951', marginBottom: '4px' }}>
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
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}
