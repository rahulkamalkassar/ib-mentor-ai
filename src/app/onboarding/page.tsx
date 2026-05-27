'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DP_SUBJECTS, MYP_SUBJECTS, IB_TOPICS } from '@/data/ib-data'
import { OnboardingData } from '@/types'
import { Logo } from '@/components/ui/Logo'

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

// Steps — step 5 (IA/EE/TOK) only shown for DP users
const ALL_STEPS = [
  'Programme',       // 0
  'Subjects',        // 1
  'Goals',           // 2
  'Academic',        // 3
  'Schedule',        // 4
  'IA · EE · TOK',   // 5  (DP only)
  'Weak Topics',     // 6
  'Exam Prep',       // 7
  'Resources',       // 8
  'AI Setup',        // 9
  'Confirm',         // 10
]

const initialData: OnboardingData = {
  programme: '', subjects: [], subjectGoalGrades: {},
  goalPoints: 38, universityAim: '', backupUniversity: '', careerInterest: '', challenges: [],
  selfAssessment: '', biggestWorries: [],
  studyHours: 10, studyTimes: [], sessionLength: 45, studyEnvironment: [], examProximity: '',
  iaStatus: {}, eeSubject: '', eeStatus: '', tokEssayStatus: '', casHours: 0,
  weakTopics: {},
  examTimeManagement: '', examFears: [], mockGrades: {},
  learningStyles: [], resourcePreferences: [], noteTakingStyle: '',
  aiPersonality: 'Friendly tutor', motivationStyle: '', responseLength: '', checkInFrequency: '',
}

const GROUP_LABELS: Record<string, string> = {
  'Group 1': 'Studies in Language & Literature',
  'Group 2': 'Language Acquisition',
  'Group 3': 'Individuals & Societies',
  'Group 4': 'Sciences',
  'Group 3/4': 'Sciences / Individuals & Societies',
  'Group 5': 'Mathematics',
  'Group 6': 'The Arts',
}

function SubjectsStep({ isDP, subjectList, subjects, subjectGoalGrades, onToggle, onSetLevel, onSetGoalGrade }: {
  isDP: boolean
  subjectList: { name: string; group: string; icon: string }[]
  subjects: import('@/types').OnboardingSubject[]
  subjectGoalGrades: Record<string, number>
  onToggle: (name: string, group: string) => void
  onSetLevel: (name: string, level: 'HL' | 'SL') => void
  onSetGoalGrade: (name: string, grade: number) => void
}) {
  const [search, setSearch] = React.useState('')
  const groups = [...new Set(subjectList.map(s => s.group))]
  const filtered = subjectList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Select your subjects</h2>
      <p className="text-slate-400 mb-3">{isDP ? 'Pick 3 HL and 3 SL subjects — set a target grade for each' : 'Select your MYP subject groups'}</p>
      {isDP && (
        <div className="flex gap-3 mb-3">
          <span className="tag tag-purple">HL: {subjects.filter(s => s.level === 'HL').length}/3</span>
          <span className="tag tag-cyan">SL: {subjects.filter(s => s.level === 'SL').length}/3</span>
          <span className="tag" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>Selected: {subjects.length}/6</span>
        </div>
      )}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search subjects…"
        className="input-dark w-full text-sm mb-4"
      />
      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {(search ? [null] : groups).map(group => {
          const list = search ? filtered : subjectList.filter(s => s.group === group)
          if (!list.length) return null
          return (
            <div key={group ?? 'search'}>
              {!search && <p className="text-xs font-bold tracking-widest uppercase mb-2 px-1" style={{ color: '#475569' }}>{GROUP_LABELS[group!] ?? group}</p>}
              <div className="space-y-1.5">
                {list.map(subject => {
                  const sel = subjects.find(s => s.name === subject.name)
                  const goalGrade = subjectGoalGrades[subject.name] ?? 6
                  return (
                    <div key={subject.name}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer"
                      style={{ background: sel ? 'rgba(124,58,237,0.1)' : '#161827', border: `1px solid ${sel ? '#7c3aed' : '#1e2a3a'}` }}
                      onClick={() => onToggle(subject.name, subject.group)}>
                      <span className="text-lg w-7 text-center flex-shrink-0">{subject.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{subject.name}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{subject.group}</p>
                      </div>
                      {sel && (
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          {isDP && (['HL', 'SL'] as const).map(lvl => (
                            <button key={lvl} onClick={() => onSetLevel(subject.name, lvl)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                              style={{ background: sel.level === lvl ? '#7c3aed' : '#1e2a3a', color: sel.level === lvl ? 'white' : '#64748b', border: `1px solid ${sel.level === lvl ? '#7c3aed' : '#2d3748'}` }}>
                              {lvl}
                            </button>
                          ))}
                          {isDP && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#1e2a3a' }}>
                              <span className="text-xs" style={{ color: '#64748b' }}>Target:</span>
                              <select value={goalGrade}
                                onChange={e => onSetGoalGrade(subject.name, Number(e.target.value))}
                                style={{ background: 'none', border: 'none', outline: 'none', color: '#a78bfa', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                {[7, 6, 5, 4, 3, 2, 1].map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                              <span className="text-xs" style={{ color: '#475569' }}>/7</span>
                            </div>
                          )}
                          {!isDP && <Check className="w-4 h-4" style={{ color: '#7c3aed' }} />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Pill toggle helper
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        background: active ? 'rgba(124,58,237,0.2)' : '#161827',
        border: `1px solid ${active ? '#7c3aed' : '#1e2a3a'}`,
        color: active ? '#c4b5fd' : '#94a3b8',
      }}
    >
      {label}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [showConfetti, setShowConfetti] = useState(false)
  const [launching, setLaunching] = useState(false)

  const isDP = data.programme.startsWith('DP')
  const steps = isDP ? ALL_STEPS : ALL_STEPS.filter(s => s !== 'IA · EE · TOK')
  const lastStep = steps.length - 1
  const progress = ((step + 1) / steps.length) * 100
  const currentStepName = steps[step]

  const next = () => setStep(s => Math.min(s + 1, lastStep))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const subjectList = isDP ? DP_SUBJECTS : MYP_SUBJECTS

  const toggle = <K extends keyof OnboardingData>(key: K, val: string) => {
    setData(d => {
      const arr = (d[key] as string[]) ?? []
      return { ...d, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }

  const toggleSubject = (name: string, group: string) => {
    setData(d => {
      const exists = d.subjects.find(s => s.name === name)
      if (exists) return { ...d, subjects: d.subjects.filter(s => s.name !== name) }
      return { ...d, subjects: [...d.subjects, { name, group, level: 'SL', selected: true }] }
    })
  }

  const setSubjectLevel = (name: string, level: 'HL' | 'SL') =>
    setData(d => ({ ...d, subjects: d.subjects.map(s => s.name === name ? { ...s, level } : s) }))

  const toggleWeakTopic = (subject: string, topic: string) => {
    setData(d => {
      const cur = d.weakTopics[subject] || []
      return { ...d, weakTopics: { ...d.weakTopics, [subject]: cur.includes(topic) ? cur.filter(t => t !== topic) : [...cur, topic] } }
    })
  }

  const launch = async () => {
    setLaunching(true)
    setShowConfetti(true)
    localStorage.setItem('ib_onboarding_data', JSON.stringify(data))
    // Send to pricing — sign-in happens there after plan selection
    setTimeout(() => router.push('/pricing'), 2500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0f1a' }}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={400} colors={['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']} />}

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" variant="horizontal" />
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#64748b' }}>Step {step + 1} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: i === step ? '20px' : '8px', background: i <= step ? '#7c3aed' : '#1e2a3a' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar mb-8">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}>

            {/* ── STEP 0: Programme ─────────────────────────────── */}
            {currentStepName === 'Programme' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Which IB programme are you in?</h2>
                <p className="text-slate-400 mb-8">We&apos;ll personalise everything based on your programme</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'MYP Year 4', icon: '🌱', desc: 'Middle Years Programme — Year 4' },
                    { label: 'MYP Year 5', icon: '🌿', desc: 'Middle Years Programme — Year 5' },
                    { label: 'DP Year 1', icon: '🎓', desc: 'Diploma Programme — First Year' },
                    { label: 'DP Year 2', icon: '🏆', desc: 'Diploma Programme — Final Year' },
                  ].map(p => (
                    <button key={p.label} onClick={() => setData(d => ({ ...d, programme: p.label }))}
                      className="card card-hover p-6 text-left transition-all duration-200 relative"
                      style={data.programme === p.label ? { borderColor: '#7c3aed', background: 'rgba(124,58,237,0.1)' } : {}}>
                      <div className="text-4xl mb-3">{p.icon}</div>
                      <h3 className="font-bold text-white text-lg">{p.label}</h3>
                      <p className="text-sm mt-1" style={{ color: '#64748b' }}>{p.desc}</p>
                      {data.programme === p.label && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#7c3aed' }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 1: Subjects ──────────────────────────────── */}
            {currentStepName === 'Subjects' && (
              <SubjectsStep
                isDP={isDP}
                subjectList={subjectList}
                subjects={data.subjects}
                subjectGoalGrades={data.subjectGoalGrades}
                onToggle={toggleSubject}
                onSetLevel={setSubjectLevel}
                onSetGoalGrade={(name, grade) => setData(d => ({ ...d, subjectGoalGrades: { ...d.subjectGoalGrades, [name]: grade } }))}
              />
            )}

            {/* ── STEP 2: Goals ─────────────────────────────────── */}
            {currentStepName === 'Goals' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Set your goals</h2>
                <p className="text-slate-400 mb-6">Tell us what you&apos;re aiming for</p>
                <div className="space-y-6">
                  {isDP && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-white font-semibold">Target Diploma Score</label>
                        <span className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{data.goalPoints}</span>
                      </div>
                      <input type="range" min={24} max={45} value={data.goalPoints}
                        onChange={e => setData(d => ({ ...d, goalPoints: Number(e.target.value) }))}
                        className="w-full accent-purple-600" />
                      <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
                        <span>24 (Pass)</span><span>38 (Competitive)</span><span>45 (Max)</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Dream university / programme</label>
                    <input value={data.universityAim}
                      onChange={e => setData(d => ({ ...d, universityAim: e.target.value }))}
                      placeholder="e.g. UCL Computer Science, Imperial Medicine…"
                      className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-2 block">Backup university / programme</label>
                    <input value={data.backupUniversity}
                      onChange={e => setData(d => ({ ...d, backupUniversity: e.target.value }))}
                      placeholder="e.g. King's College London, Edinburgh…"
                      className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-2 block">Career / field interest</label>
                    <input value={data.careerInterest}
                      onChange={e => setData(d => ({ ...d, careerInterest: e.target.value }))}
                      placeholder="e.g. Medicine, Software Engineering, Finance…"
                      className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Biggest challenges right now</label>
                    <div className="flex flex-wrap gap-2">
                      {['Time management', 'Understanding content', 'Exam technique', 'Essay writing', 'Motivation', 'Stress & anxiety', 'Language barrier', 'Balancing ECAs'].map(c => (
                        <Pill key={c} label={c} active={data.challenges.includes(c)} onClick={() => toggle('challenges', c)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Academic Standing ─────────────────────── */}
            {currentStepName === 'Academic' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Academic standing</h2>
                <p className="text-slate-400 mb-6">Be honest — we use this to calibrate your plan</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block">How would you describe your current performance?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Struggling', icon: '😓', desc: 'Falling behind in most subjects' },
                        { label: 'Average', icon: '😐', desc: 'Keeping up but not excelling' },
                        { label: 'Doing well', icon: '😊', desc: 'Solid grades, room to improve' },
                        { label: 'Excellent', icon: '🚀', desc: 'Top of the class, aiming higher' },
                      ].map(s => (
                        <button key={s.label} onClick={() => setData(d => ({ ...d, selfAssessment: s.label }))}
                          className="p-4 rounded-xl text-left transition-all duration-200"
                          style={{ background: data.selfAssessment === s.label ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.selfAssessment === s.label ? '#7c3aed' : '#1e2a3a'}` }}>
                          <span className="text-2xl">{s.icon}</span>
                          <p className="text-white font-semibold text-sm mt-2">{s.label}</p>
                          <p className="text-xs mt-1" style={{ color: '#64748b' }}>{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {data.subjects.length > 0 && (
                    <div>
                      <label className="text-white font-semibold mb-3 block">Current mock / predicted grade per subject</label>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {data.subjects.map(s => (
                          <div key={s.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#161827', border: '1px solid #1e2a3a' }}>
                            <span className="text-sm text-white truncate flex-1 mr-4">{s.name.split(':')[0]}</span>
                            <div className="flex gap-1">
                              {[1,2,3,4,5,6,7].map(g => (
                                <button key={g} onClick={() => setData(d => ({ ...d, mockGrades: { ...d.mockGrades, [s.name]: g } }))}
                                  className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                                  style={{ background: data.mockGrades[s.name] === g ? '#7c3aed' : '#1e2a3a', color: data.mockGrades[s.name] === g ? 'white' : '#64748b', border: `1px solid ${data.mockGrades[s.name] === g ? '#7c3aed' : '#2d3748'}` }}>
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-white font-semibold mb-3 block">What worries you most? (select all)</label>
                    <div className="flex flex-wrap gap-2">
                      {['Running out of time in exams', 'Forgetting content under pressure', 'IAs not being good enough', 'EE quality', 'TOK', 'Specific subject grades', 'University offers', 'Overall diploma passing'].map(w => (
                        <Pill key={w} label={w} active={data.biggestWorries.includes(w)} onClick={() => toggle('biggestWorries', w)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Schedule ──────────────────────────────── */}
            {currentStepName === 'Schedule' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Study schedule</h2>
                <p className="text-slate-400 mb-6">Help us build a plan that actually fits your life</p>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-white font-semibold">Study hours per week</label>
                      <span className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{data.studyHours}h</span>
                    </div>
                    <input type="range" min={2} max={40} value={data.studyHours}
                      onChange={e => setData(d => ({ ...d, studyHours: Number(e.target.value) }))}
                      className="w-full accent-purple-600" />
                    <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
                      <span>2h</span><span>20h (recommended)</span><span>40h</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Preferred study times</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Early morning', icon: '🌄', time: '5–8am' },
                        { label: 'Morning', icon: '🌅', time: '8am–12pm' },
                        { label: 'Afternoon', icon: '☀️', time: '12–5pm' },
                        { label: 'Evening', icon: '🌆', time: '5–9pm' },
                        { label: 'Late night', icon: '🌙', time: '9pm+' },
                        { label: 'Weekends only', icon: '📅', time: 'Sat & Sun' },
                      ].map(t => (
                        <button key={t.label} onClick={() => toggle('studyTimes', t.label)}
                          className="p-3 rounded-xl text-left transition-all duration-200"
                          style={{ background: data.studyTimes.includes(t.label) ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.studyTimes.includes(t.label) ? '#7c3aed' : '#1e2a3a'}` }}>
                          <span className="text-xl">{t.icon}</span>
                          <p className="text-white font-medium text-sm mt-1">{t.label}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{t.time}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Preferred session length</label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { min: 25, label: '25 min', desc: 'Pomodoro' },
                        { min: 45, label: '45 min', desc: 'Standard' },
                        { min: 60, label: '1 hour', desc: 'Focused' },
                        { min: 90, label: '90 min', desc: 'Deep work' },
                        { min: 120, label: '2+ hours', desc: 'Marathon' },
                      ].map(s => (
                        <button key={s.min} onClick={() => setData(d => ({ ...d, sessionLength: s.min }))}
                          className="px-4 py-3 rounded-xl text-center transition-all duration-200 flex-1"
                          style={{ background: data.sessionLength === s.min ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.sessionLength === s.min ? '#7c3aed' : '#1e2a3a'}` }}>
                          <p className="font-bold text-white text-sm">{s.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Study environment</label>
                    <div className="flex flex-wrap gap-2">
                      {['Silent library', 'Background music', 'Café', 'Bedroom', 'School', 'With friends', 'Nature / outside'].map(e => (
                        <Pill key={e} label={e} active={data.studyEnvironment.includes(e)} onClick={() => toggle('studyEnvironment', e)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Time until final exams</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['6+ months', '3–6 months', '1–3 months', 'Under 1 month'].map(e => (
                        <button key={e} onClick={() => setData(d => ({ ...d, examProximity: e }))}
                          className="p-3 rounded-xl text-sm transition-all duration-200"
                          style={{ background: data.examProximity === e ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.examProximity === e ? '#7c3aed' : '#1e2a3a'}`, color: data.examProximity === e ? '#c4b5fd' : '#94a3b8' }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: IA / EE / TOK (DP only) ─────────────── */}
            {currentStepName === 'IA · EE · TOK' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">IA · EE · TOK status</h2>
                <p className="text-slate-400 mb-6">Track your core component progress</p>
                <div className="space-y-6">
                  {data.subjects.length > 0 && (
                    <div>
                      <label className="text-white font-semibold mb-3 block">Internal Assessment status per subject</label>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {data.subjects.map(s => (
                          <div key={s.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#161827', border: '1px solid #1e2a3a' }}>
                            <span className="text-sm text-white truncate flex-1 mr-3">{s.name.split(':')[0]}</span>
                            <div className="flex gap-1">
                              {['Not started', 'Planning', 'Drafting', 'Submitted'].map(status => (
                                <button key={status} onClick={() => setData(d => ({ ...d, iaStatus: { ...d.iaStatus, [s.name]: status } }))}
                                  className="px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                                  style={{
                                    background: data.iaStatus[s.name] === status ? 'rgba(124,58,237,0.3)' : '#1e2a3a',
                                    border: `1px solid ${data.iaStatus[s.name] === status ? '#7c3aed' : '#2d3748'}`,
                                    color: data.iaStatus[s.name] === status ? '#c4b5fd' : '#64748b',
                                  }}>
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white font-semibold mb-2 block">EE Subject</label>
                      <input value={data.eeSubject} onChange={e => setData(d => ({ ...d, eeSubject: e.target.value }))}
                        placeholder="e.g. History, Chemistry…" className="input-dark w-full" />
                    </div>
                    <div>
                      <label className="text-white font-semibold mb-2 block">EE Status</label>
                      <select value={data.eeStatus} onChange={e => setData(d => ({ ...d, eeStatus: e.target.value }))}
                        className="input-dark w-full">
                        <option value="">Select…</option>
                        {['Not started', 'Topic chosen', 'Research underway', 'First draft', 'Final draft', 'Submitted'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white font-semibold mb-2 block">TOK Essay status</label>
                      <select value={data.tokEssayStatus} onChange={e => setData(d => ({ ...d, tokEssayStatus: e.target.value }))}
                        className="input-dark w-full">
                        <option value="">Select…</option>
                        {['Not started', 'Title chosen', 'Outline done', 'First draft', 'Final draft', 'Submitted'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white font-semibold mb-2 block">CAS hours completed</label>
                      <input type="number" min={0} max={200} value={data.casHours}
                        onChange={e => setData(d => ({ ...d, casHours: Number(e.target.value) }))}
                        placeholder="e.g. 75" className="input-dark w-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 6: Weak Topics ───────────────────────────── */}
            {currentStepName === 'Weak Topics' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Weak topics</h2>
                <p className="text-slate-400 mb-6">Select topics you find difficult — we&apos;ll prioritise them</p>
                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
                  {data.subjects.map(subject => {
                    const topics = IB_TOPICS[subject.name] || ['General concepts', 'Exam technique', 'Internal assessment']
                    const selected = data.weakTopics[subject.name] || []
                    return (
                      <div key={subject.name}>
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: '#7c3aed' }} />
                          {subject.name} {subject.level && `(${subject.level})`}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {topics.map(topic => (
                            <button key={topic} onClick={() => toggleWeakTopic(subject.name, topic)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                              style={{
                                background: selected.includes(topic) ? 'rgba(124,58,237,0.3)' : '#1e2a3a',
                                border: `1px solid ${selected.includes(topic) ? '#7c3aed' : '#2d3748'}`,
                                color: selected.includes(topic) ? '#c4b5fd' : '#64748b',
                              }}>
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {data.subjects.length === 0 && (
                    <p className="text-center py-12" style={{ color: '#64748b' }}>No subjects selected — go back and add subjects first</p>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 7: Exam Prep ─────────────────────────────── */}
            {currentStepName === 'Exam Prep' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Exam preparation</h2>
                <p className="text-slate-400 mb-6">Tell us about your exam technique</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block">How do you manage time in exams?</label>
                    <div className="space-y-2">
                      {[
                        { val: 'Always run out', icon: '😱', desc: 'Never finish on time' },
                        { val: 'Sometimes struggle', icon: '😟', desc: 'Tight on a few papers' },
                        { val: 'Usually fine', icon: '😊', desc: 'Finish with a few minutes to spare' },
                        { val: 'Lots of time left', icon: '😎', desc: 'Always finish early' },
                      ].map(o => (
                        <button key={o.val} onClick={() => setData(d => ({ ...d, examTimeManagement: o.val }))}
                          className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                          style={{ background: data.examTimeManagement === o.val ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.examTimeManagement === o.val ? '#7c3aed' : '#1e2a3a'}` }}>
                          <span className="text-2xl">{o.icon}</span>
                          <div>
                            <p className="text-white font-semibold text-sm">{o.val}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{o.desc}</p>
                          </div>
                          {data.examTimeManagement === o.val && <Check className="w-4 h-4 ml-auto" style={{ color: '#7c3aed' }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Biggest exam fears</label>
                    <div className="flex flex-wrap gap-2">
                      {['Going blank', 'Running out of time', 'Misreading questions', 'Not knowing content', 'Poor essay structure', 'Data / graph questions', 'Multiple choice tricks', 'Oral exams'].map(f => (
                        <Pill key={f} label={f} active={data.examFears.includes(f)} onClick={() => toggle('examFears', f)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 8: Resources ─────────────────────────────── */}
            {currentStepName === 'Resources' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Learning resources</h2>
                <p className="text-slate-400 mb-6">What works best for you?</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block">Preferred study methods</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'YouTube videos', icon: '🎥' },
                        { label: 'Textbooks', icon: '📖' },
                        { label: 'Practice questions', icon: '✏️' },
                        { label: 'Flashcards', icon: '🃏' },
                        { label: 'Past papers', icon: '📄' },
                        { label: 'Revision notes', icon: '📝' },
                        { label: 'Mind maps', icon: '🗺️' },
                        { label: 'Group study', icon: '👥' },
                        { label: 'Teaching others', icon: '🎓' },
                      ].map(s => (
                        <button key={s.label} onClick={() => toggle('resourcePreferences', s.label)}
                          className="p-3 rounded-xl text-center transition-all duration-200"
                          style={{ background: data.resourcePreferences.includes(s.label) ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.resourcePreferences.includes(s.label) ? '#7c3aed' : '#1e2a3a'}` }}>
                          <span className="text-2xl">{s.icon}</span>
                          <p className="text-white font-medium text-xs mt-2 leading-tight">{s.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Note-taking style</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Cornell method', icon: '📐', desc: 'Split page with cues + summary' },
                        { label: 'Mind maps', icon: '🗺️', desc: 'Visual branching diagrams' },
                        { label: 'Bullet points', icon: '•', desc: 'Quick lists and outlines' },
                        { label: 'Full sentences', icon: '📝', desc: 'Detailed written notes' },
                        { label: 'Highlighting only', icon: '🖊️', desc: 'Annotate textbooks directly' },
                        { label: 'Digital notes', icon: '💻', desc: 'Apps like Notion / Obsidian' },
                      ].map(n => (
                        <button key={n.label} onClick={() => setData(d => ({ ...d, noteTakingStyle: n.label }))}
                          className="p-3 rounded-xl text-left transition-all duration-200"
                          style={{ background: data.noteTakingStyle === n.label ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.noteTakingStyle === n.label ? '#7c3aed' : '#1e2a3a'}` }}>
                          <span className="text-lg">{n.icon}</span>
                          <p className="text-white font-semibold text-sm mt-1">{n.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{n.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Learning methods that work for you</label>
                    <div className="flex flex-wrap gap-2">
                      {['Active recall', 'Spaced repetition', 'Pomodoro technique', 'Interleaving subjects', 'Retrieval practice', 'Elaborative interrogation'].map(m => (
                        <Pill key={m} label={m} active={data.learningStyles.includes(m)} onClick={() => toggle('learningStyles', m)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 9: AI Setup ──────────────────────────────── */}
            {currentStepName === 'AI Setup' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Set up your AI tutor</h2>
                <p className="text-slate-400 mb-6">Customise how your AI mentor communicates with you</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block">AI personality</label>
                    <div className="space-y-2">
                      {[
                        { label: 'Strict exam coach', icon: '⚡', desc: 'Focused on marks, mark schemes, and exam technique. No fluff.' },
                        { label: 'Friendly tutor', icon: '😊', desc: 'Warm and encouraging — explains concepts step by step.' },
                        { label: 'Concise and fast', icon: '⚡', desc: 'Quick bullet-point answers, no lengthy explanations.' },
                        { label: 'Socratic mentor', icon: '🤔', desc: 'Guides you to answers with questions, doesn\'t just tell you.' },
                      ].map(p => (
                        <button key={p.label} onClick={() => setData(d => ({ ...d, aiPersonality: p.label }))}
                          className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                          style={{ background: data.aiPersonality === p.label ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.aiPersonality === p.label ? '#7c3aed' : '#1e2a3a'}` }}>
                          <span className="text-2xl">{p.icon}</span>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{p.label}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{p.desc}</p>
                          </div>
                          {data.aiPersonality === p.label && <Check className="w-4 h-4" style={{ color: '#7c3aed' }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Motivation style</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Tough love', icon: '💪', desc: 'Push me hard' },
                        { label: 'Encouragement', icon: '🌟', desc: 'Celebrate progress' },
                        { label: 'Data-driven', icon: '📊', desc: 'Show me the numbers' },
                      ].map(m => (
                        <button key={m.label} onClick={() => setData(d => ({ ...d, motivationStyle: m.label }))}
                          className="p-4 rounded-xl text-center transition-all duration-200"
                          style={{ background: data.motivationStyle === m.label ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.motivationStyle === m.label ? '#7c3aed' : '#1e2a3a'}` }}>
                          <span className="text-2xl">{m.icon}</span>
                          <p className="text-white font-semibold text-sm mt-2">{m.label}</p>
                          <p className="text-xs mt-1" style={{ color: '#64748b' }}>{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Response length preference</label>
                    <div className="flex gap-3">
                      {[
                        { label: 'Brief', desc: '2–3 sentences max', val: 'brief' },
                        { label: 'Balanced', desc: 'Concise but complete', val: 'balanced' },
                        { label: 'Detailed', desc: 'Full explanations', val: 'detailed' },
                      ].map(r => (
                        <button key={r.val} onClick={() => setData(d => ({ ...d, responseLength: r.val }))}
                          className="flex-1 p-3 rounded-xl text-center transition-all duration-200"
                          style={{ background: data.responseLength === r.val ? 'rgba(124,58,237,0.2)' : '#161827', border: `1px solid ${data.responseLength === r.val ? '#7c3aed' : '#1e2a3a'}` }}>
                          <p className="text-white font-semibold text-sm">{r.label}</p>
                          <p className="text-xs mt-1" style={{ color: '#64748b' }}>{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Study check-in frequency</label>
                    <div className="flex flex-wrap gap-2">
                      {['Daily reminders', 'Weekly recap', 'Only when I ask', 'Before exams only'].map(f => (
                        <Pill key={f} label={f} active={data.checkInFrequency === f} onClick={() => setData(d => ({ ...d, checkInFrequency: f }))} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 10: Confirm ──────────────────────────────── */}
            {currentStepName === 'Confirm' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">You&apos;re all set! 🎉</h2>
                <p className="text-slate-400 mb-6">Here&apos;s a summary of your personalised setup</p>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {[
                    { label: 'Programme', value: data.programme || 'Not set' },
                    { label: 'Subjects', value: data.subjects.length ? `${data.subjects.length} subjects (${data.subjects.filter(s=>s.level==='HL').length} HL, ${data.subjects.filter(s=>s.level==='SL').length} SL)` : 'None' },
                    isDP ? { label: 'Target Score', value: `${data.goalPoints}/45` } : null,
                    { label: 'University aim', value: data.universityAim || 'Not specified' },
                    data.careerInterest ? { label: 'Career interest', value: data.careerInterest } : null,
                    { label: 'Self-assessment', value: data.selfAssessment || 'Not set' },
                    { label: 'Study hours', value: `${data.studyHours}h/week · ${data.sessionLength}min sessions` },
                    { label: 'Study times', value: data.studyTimes.join(', ') || 'Not set' },
                    { label: 'Environment', value: data.studyEnvironment.join(', ') || 'Not set' },
                    { label: 'Exam proximity', value: data.examProximity || 'Not set' },
                    isDP && data.eeSubject ? { label: 'EE Subject', value: `${data.eeSubject} — ${data.eeStatus || 'Not started'}` } : null,
                    { label: 'Weak topic areas', value: Object.values(data.weakTopics).flat().length + ' topics flagged' },
                    { label: 'AI personality', value: data.aiPersonality },
                    data.motivationStyle ? { label: 'Motivation style', value: data.motivationStyle } : null,
                    data.responseLength ? { label: 'Response length', value: data.responseLength } : null,
                  ].filter(Boolean).map(item => (
                    <div key={item!.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#161827', border: '1px solid #1e2a3a' }}>
                      <span className="text-sm" style={{ color: '#64748b' }}>{item!.label}</span>
                      <span className="text-sm font-semibold text-white text-right ml-4">{item!.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={launch} disabled={launching}
                  className="mt-6 w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 4px 30px rgba(124,58,237,0.4)' }}>
                  {launching ? '🚀 Launching...' : '🚀 Launch IB Mentor AI'}
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < lastStep && (
          <div className="flex items-center justify-between mt-8">
            <button onClick={back} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: '#161827', border: '1px solid #1e2a3a', color: '#94a3b8' }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all btn-primary">
              {step === lastStep - 1 ? 'Review' : 'Continue'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
