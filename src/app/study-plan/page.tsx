'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  Sparkles, Calendar, BookOpen, Target, Clock, AlertTriangle,
  ChevronRight, RotateCcw, Download, CheckCircle2, Circle,
  Loader2, Flame, Zap, TrendingUp, Star
} from 'lucide-react'
import { OnboardingData } from '@/types'
import { gradeColor, getSubjectAccent } from '@/lib/utils'

interface StudyPlanConfig {
  hoursPerDay: number
  daysPerWeek: number
  examWeeks: number
  focusMode: 'balanced' | 'weakest' | 'highest-impact'
  includeWeekends: boolean
}

interface GeneratedPlan {
  overview: string
  weeks: WeekPlan[]
  dailyTemplate: string
  subjectPriority: { name: string; why: string; hoursPerWeek: number; color: string }[]
  milestones: { week: number; label: string; done: boolean }[]
  tips: string[]
}

interface WeekPlan {
  weekNum: number
  theme: string
  focus: string[]
  tasks: string[]
  goal: string
}

const HOURS_OPTIONS = [1, 1.5, 2, 3, 4, 5, 6]
const WEEKS_OPTIONS = [2, 4, 6, 8, 10, 12, 16, 20, 24]
const FOCUS_OPTIONS = [
  { id: 'balanced',        label: 'Balanced',        desc: 'Even coverage across all subjects',          color: '#06b6d4' },
  { id: 'weakest',         label: 'Weakest First',   desc: 'Prioritise your lowest-predicted subjects',  color: '#ef4444' },
  { id: 'highest-impact',  label: 'Highest Impact',  desc: 'Focus on subjects closest to next grade up', color: '#f59e0b' },
]

function parsePlan(raw: string, subjects: string[]): GeneratedPlan {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

  // Extract weekly sections
  const weeks: WeekPlan[] = []
  let currentWeek: WeekPlan | null = null
  const milestones: { week: number; label: string; done: boolean }[] = []
  const tips: string[] = []
  let overviewLines: string[] = []
  let dailyLines: string[] = []
  let subjectPriorityLines: string[] = []
  let section: 'overview' | 'priority' | 'weeks' | 'daily' | 'tips' | 'milestones' = 'overview'

  for (const line of lines) {
    const lower = line.toLowerCase()
    if (lower.includes('subject priorit')) { section = 'priority'; continue }
    if (lower.includes('week-by-week') || lower.includes('weekly plan') || lower.match(/^#+\s*week\s+1\b/i)) { section = 'weeks' }
    if (lower.includes('daily template') || lower.includes('daily schedule')) { section = 'daily'; continue }
    if (lower.includes('key milestone') || lower.includes('milestone')) { section = 'milestones'; continue }
    if (lower.includes('top tip') || lower.includes('study tip') || lower.match(/^tips/i)) { section = 'tips'; continue }

    if (section === 'overview') overviewLines.push(line)
    else if (section === 'priority') subjectPriorityLines.push(line)
    else if (section === 'weeks') {
      const weekMatch = line.match(/week\s+(\d+)/i)
      if (weekMatch) {
        if (currentWeek) weeks.push(currentWeek)
        currentWeek = { weekNum: parseInt(weekMatch[1]), theme: line.replace(/^#+\s*/, '').replace(/week\s+\d+:?\s*/i, '').trim() || `Week ${weekMatch[1]}`, focus: [], tasks: [], goal: '' }
      } else if (currentWeek) {
        if (lower.startsWith('goal:') || lower.startsWith('- goal:')) currentWeek.goal = line.replace(/^-?\s*goal:\s*/i, '')
        else if (line.startsWith('-') || line.startsWith('•')) currentWeek.tasks.push(line.replace(/^[-•]\s*/, ''))
        else if (currentWeek.theme && !currentWeek.goal && line.length < 100) currentWeek.goal = currentWeek.goal || line
      }
    }
    else if (section === 'daily') dailyLines.push(line)
    else if (section === 'milestones') {
      const wm = line.match(/week\s*(\d+)/i)
      milestones.push({ week: wm ? parseInt(wm[1]) : milestones.length + 1, label: line.replace(/^[-•]\s*/, '').replace(/week\s*\d+:?\s*/i, ''), done: false })
    }
    else if (section === 'tips') {
      if (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line)) tips.push(line.replace(/^[-•\d.]\s*/, ''))
    }
  }
  if (currentWeek) weeks.push(currentWeek)

  const subjectPriority = subjects.slice(0, 6).map((name, i) => {
    const matched = subjectPriorityLines.find(l => l.toLowerCase().includes(name.split(':')[0].toLowerCase().slice(0, 8)))
    return {
      name: name.split(':')[0].trim(),
      why: matched ? matched.replace(/^[-•\d.]\s*/, '') : 'Based on your current predicted grade',
      hoursPerWeek: Math.max(2, 10 - i),
      color: getSubjectAccent(i),
    }
  })

  return {
    overview: overviewLines.slice(0, 6).join(' ') || raw.slice(0, 400),
    weeks: weeks.length ? weeks : [],
    dailyTemplate: dailyLines.join('\n') || '',
    subjectPriority,
    milestones: milestones.slice(0, 8),
    tips: tips.slice(0, 6),
  }
}

export default function StudyPlanPage() {
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [config, setConfig] = useState<StudyPlanConfig>({
    hoursPerDay: 3,
    daysPerWeek: 5,
    examWeeks: 12,
    focusMode: 'highest-impact',
    includeWeekends: false,
  })
  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<GeneratedPlan | null>(null)
  const [rawPlan, setRawPlan] = useState('')
  const [milestones, setMilestones] = useState<{ week: number; label: string; done: boolean }[]>([])
  const [activeWeek, setActiveWeek] = useState(1)

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) {
      const parsed: OnboardingData = JSON.parse(data)
      setUserData(parsed)
      // pre-fill exam weeks from proximity
      const prox = parsed.examProximity || ''
      if (prox.includes('1–2')) setConfig(c => ({ ...c, examWeeks: 6 }))
      else if (prox.includes('3–6')) setConfig(c => ({ ...c, examWeeks: 16 }))
      else if (prox.includes('6–12')) setConfig(c => ({ ...c, examWeeks: 24 }))
    }
    const saved = localStorage.getItem('ib_study_plan')
    if (saved) {
      const { raw, cfg } = JSON.parse(saved)
      setRawPlan(raw)
      setConfig(cfg)
      const parsed = parsePlan(raw, [])
      setPlan(parsed)
      setMilestones(parsed.milestones)
    }
  }, [])

  const generatePlan = async () => {
    if (!userData) return
    setGenerating(true)
    setPlan(null)

    const subjects = userData.subjects || []
    const weakTopics = userData.weakTopics || {}
    const goalPoints = userData.goalPoints || 38
    const examProximity = userData.examProximity || '3–6 months'

    const totalHours = config.hoursPerDay * config.daysPerWeek * config.examWeeks
    const focusLabel = FOCUS_OPTIONS.find(f => f.id === config.focusMode)?.label || 'Balanced'

    const prompt = `Create a detailed, personalised IB study plan for this student. Be specific and actionable.

STUDENT PROFILE:
- Programme: ${userData.programme || 'IB Diploma'}
- Exam proximity: ${examProximity}
- Goal: ${goalPoints} points
- University aim: ${userData.universityAim || 'Not specified'}
- Subjects: ${subjects.map(s => `${s.name} (${s.level})`).join(', ')}
- Weak areas: ${Object.entries(weakTopics).map(([subj, topics]) => `${subj.split(':')[0]}: ${(topics as string[]).join(', ')}`).join(' | ') || 'None specified'}

SCHEDULE CONSTRAINTS:
- ${config.hoursPerDay} hours/day, ${config.daysPerWeek} days/week
- ${config.examWeeks} weeks until exams
- Total study hours available: ${totalHours}
- Focus mode: ${focusLabel}
- Weekends: ${config.includeWeekends ? 'included' : 'excluded'}

OUTPUT STRUCTURE (follow exactly):

## Overview
[2-3 sentences summarising the plan's approach and the student's key priorities]

## Subject Priority
[Rank subjects in order of priority with a brief reason for each. Format: - Subject Name: reason]

## Week-by-Week Plan
[Create ${Math.min(config.examWeeks, 12)} week entries in this format:]
### Week N: [Theme]
- [Specific task 1]
- [Specific task 2]
- [Specific task 3]
Goal: [Measurable weekly goal]

## Daily Template
[A suggested daily schedule broken into time blocks, e.g. 17:00–18:00: [Subject] — [task type]]

## Key Milestones
[6-8 milestone checkpoints with week numbers, e.g:]
- Week 2: Complete all flashcard decks for [subject]
- Week 4: First full mock paper under timed conditions

## Top Tips
- [5-6 specific, actionable study tips tailored to this student's subjects and weak areas]

Be concrete, specific to IB, and reference the student's actual subjects and weak topics throughout.`

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const raw = data.content || ''
      setRawPlan(raw)
      const parsed = parsePlan(raw, subjects.map(s => s.name))
      setPlan(parsed)
      setMilestones(parsed.milestones)
      localStorage.setItem('ib_study_plan', JSON.stringify({ raw, cfg: config }))
      setActiveWeek(1)
    } catch {
      setRawPlan('Failed to generate plan. Please check your API key.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleMilestone = (i: number) => {
    setMilestones(ms => ms.map((m, j) => j === i ? { ...m, done: !m.done } : m))
  }

  const totalHours = config.hoursPerDay * config.daysPerWeek * config.examWeeks
  const subjects = userData?.subjects || []
  const doneMilestones = milestones.filter(m => m.done).length

  return (
    <MainLayout>
      <Header title="Study Plan" subtitle="AI-generated personalised revision schedule" />
      <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Config card */}
        <div className="card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '16px', marginBottom: '4px' }}>Build Your Plan</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Configure your schedule and Claude will create a fully personalised revision plan.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Hours per day */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Hours per day</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {HOURS_OPTIONS.map(h => (
                      <button key={h} onClick={() => setConfig(c => ({ ...c, hoursPerDay: h }))} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: config.hoursPerDay === h ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)', border: `1px solid ${config.hoursPerDay === h ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`, color: config.hoursPerDay === h ? '#c4b5fd' : 'var(--text-secondary)' }}>
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days per week */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Days per week</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[3,4,5,6,7].map(d => (
                      <button key={d} onClick={() => setConfig(c => ({ ...c, daysPerWeek: d }))} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: config.daysPerWeek === d ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${config.daysPerWeek === d ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)'}`, color: config.daysPerWeek === d ? '#67e8f9' : 'var(--text-secondary)' }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weeks to exam */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Weeks to exams</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {WEEKS_OPTIONS.map(w => (
                      <button key={w} onClick={() => setConfig(c => ({ ...c, examWeeks: w }))} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: config.examWeeks === w ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${config.examWeeks === w ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`, color: config.examWeeks === w ? '#34d399' : 'var(--text-secondary)' }}>
                        {w}w
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus mode */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Focus mode</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {FOCUS_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setConfig(c => ({ ...c, focusMode: f.id as StudyPlanConfig['focusMode'] }))} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', cursor: 'pointer', background: config.focusMode === f.id ? `${f.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${config.focusMode === f.id ? `${f.color}50` : 'rgba(255,255,255,0.07)'}`, textAlign: 'left' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.focusMode === f.id ? f.color : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: config.focusMode === f.id ? '#fff' : 'var(--text-secondary)', marginBottom: '1px' }}>{f.label}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary + generate */}
            <div style={{ width: '240px', flexShrink: 0 }}>
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Plan Summary</p>
                {[
                  { label: 'Total hours', value: `${totalHours}h`, icon: Clock, color: '#a78bfa' },
                  { label: 'Weeks', value: `${config.examWeeks}`, icon: Calendar, color: '#67e8f9' },
                  { label: 'Per day', value: `${config.hoursPerDay}h`, icon: Flame, color: '#fbbf24' },
                  { label: 'Subjects', value: `${subjects.length || 6}`, icon: BookOpen, color: '#34d399' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon style={{ width: '13px', height: '13px', color }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={generatePlan}
                disabled={generating || !userData}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '14px', fontWeight: 800, gap: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (!userData || generating) ? 0.7 : 1 }}
              >
                {generating
                  ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Generating...</>
                  : <><Sparkles style={{ width: '16px', height: '16px' }} /> {plan ? 'Regenerate Plan' : 'Generate My Plan'}</>}
              </button>
              {!userData && <p style={{ fontSize: '11px', color: '#f59e0b', textAlign: 'center', marginTop: '8px' }}>Complete onboarding first</p>}
              {plan && <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>Plan saved automatically</p>}
            </div>
          </div>
        </div>

        {/* Generating animation */}
        {generating && (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sparkles style={{ width: '28px', height: '28px', color: '#fff', animation: 'pulse 1.5s infinite' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Building your personalised plan...</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Claude is analysing your subjects, weak topics, and schedule to create the most effective revision path to your goal.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '24px' }}>
              {['Analysing subjects', 'Prioritising topics', 'Building schedule', 'Adding milestones'].map((step, i) => (
                <div key={step} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)', animation: `fadeIn 0.4s ${i * 0.3}s both` }}>{step}</div>
              ))}
            </div>
          </div>
        )}

        {/* Generated plan */}
        {plan && !generating && (
          <>
            {/* Overview banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '6px' }}>Your Plan Overview</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>{plan.overview}</p>
                </div>
              </div>
            </div>

            {/* Main grid: weeks + right sidebar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

              {/* Weekly plan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Calendar style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                    <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Week-by-Week Schedule</h3>
                  </div>

                  {/* Week tabs */}
                  {plan.weeks.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {plan.weeks.map(w => (
                          <button key={w.weekNum} onClick={() => setActiveWeek(w.weekNum)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: activeWeek === w.weekNum ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeWeek === w.weekNum ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`, color: activeWeek === w.weekNum ? '#c4b5fd' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                            W{w.weekNum}
                          </button>
                        ))}
                      </div>

                      {plan.weeks.filter(w => w.weekNum === activeWeek).map(week => (
                        <div key={week.weekNum}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: '#a78bfa' }}>W{week.weekNum}</span>
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{week.theme || `Week ${week.weekNum}`}</p>
                              {week.goal && <p style={{ fontSize: '12px', color: '#a78bfa', marginTop: '2px' }}>Goal: {week.goal}</p>}
                            </div>
                          </div>

                          {week.tasks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {week.tasks.map((task, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                  <ChevronRight style={{ width: '14px', height: '14px', color: '#7c3aed', flexShrink: 0, marginTop: '1px' }} />
                                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{task}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{rawPlan.split(/###?\s*Week\s+/i)[week.weekNum]?.split(/###?\s*Week\s+/i)[0]?.slice(0, 600) || 'See full plan below.'}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    /* Raw plan fallback — markdown-style render */
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                      {rawPlan.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) return <h3 key={i} style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '20px', marginBottom: '8px' }}>{line.replace(/^#+\s*/, '')}</h3>
                        if (line.startsWith('### ')) return <h4 key={i} style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', marginTop: '14px', marginBottom: '6px' }}>{line.replace(/^#+\s*/, '')}</h4>
                        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}><span style={{ color: '#7c3aed', flexShrink: 0 }}>›</span><span>{line.replace(/^[-•]\s*/, '')}</span></div>
                        if (!line.trim()) return <div key={i} style={{ height: '6px' }} />
                        return <p key={i} style={{ marginBottom: '4px' }}>{line}</p>
                      })}
                    </div>
                  )}
                </div>

                {/* Daily template */}
                {plan.dailyTemplate && (
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <Clock style={{ width: '16px', height: '16px', color: '#67e8f9' }} />
                      <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Daily Schedule Template</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {plan.dailyTemplate.split('\n').filter(l => l.trim()).map((line, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <Clock style={{ width: '12px', height: '12px', color: '#67e8f9', flexShrink: 0 }} />
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{line.replace(/^[-•]\s*/, '')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Subject priority */}
                {plan.subjectPriority.length > 0 && (
                  <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Target style={{ width: '14px', height: '14px', color: '#a78bfa' }} />
                      <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Subject Priority</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {plan.subjectPriority.map((s, i) => (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', width: '18px', flexShrink: 0 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>{s.hoursPerWeek}h/wk</span>
                            </div>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                              <div style={{ height: '100%', borderRadius: '2px', background: s.color, width: `${(s.hoursPerWeek / 10) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {milestones.length > 0 && (
                  <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
                        <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Milestones</h3>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doneMilestones}/{milestones.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {milestones.map((m, i) => (
                        <button key={i} onClick={() => toggleMilestone(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '9px', background: m.done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${m.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                          {m.done
                            ? <CheckCircle2 style={{ width: '14px', height: '14px', color: '#34d399', flexShrink: 0, marginTop: '1px' }} />
                            : <Circle style={{ width: '14px', height: '14px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '1px' }} />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: m.done ? '#34d399' : '#fff', textDecoration: m.done ? 'line-through' : 'none', lineHeight: 1.4 }}>{m.label}</p>
                            {m.week > 0 && <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Week {m.week}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {plan.tips.length > 0 && (
                  <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <Zap style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
                      <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Top Tips</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {plan.tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fbbf24', flexShrink: 0 }}>{i + 1}</span>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}

      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </MainLayout>
  )
}
