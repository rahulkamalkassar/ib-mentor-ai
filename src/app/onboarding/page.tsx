'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DP_SUBJECTS, MYP_SUBJECTS, IB_TOPICS } from '@/data/ib-data'
import { OnboardingData } from '@/types'

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

const STEPS = [
  'Programme',
  'Subjects',
  'Goals',
  'Study Habits',
  'Weak Topics',
  'Learning Style',
  'Confirm',
]

const initialData: OnboardingData = {
  programme: '',
  subjects: [],
  goalPoints: 38,
  universityAim: '',
  challenges: [],
  studyHours: 10,
  studyTimes: [],
  examProximity: '',
  weakTopics: {},
  learningStyles: [],
  aiPersonality: 'friendly tutor',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [showConfetti, setShowConfetti] = useState(false)
  const [launching, setLaunching] = useState(false)

  const progress = ((step + 1) / STEPS.length) * 100

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const isDP = data.programme.startsWith('DP')
  const subjectList = isDP ? DP_SUBJECTS : MYP_SUBJECTS

  const launch = async () => {
    setLaunching(true)
    setShowConfetti(true)
    localStorage.setItem('ib_onboarding_complete', 'true')
    localStorage.setItem('ib_onboarding_data', JSON.stringify(data))
    setTimeout(() => {
      router.push('/dashboard')
    }, 2500)
  }

  const toggleSubject = (name: string, group: string) => {
    setData(d => {
      const exists = d.subjects.find(s => s.name === name)
      if (exists) {
        return { ...d, subjects: d.subjects.filter(s => s.name !== name) }
      }
      return { ...d, subjects: [...d.subjects, { name, group, level: 'SL', selected: true }] }
    })
  }

  const setSubjectLevel = (name: string, level: 'HL' | 'SL') => {
    setData(d => ({
      ...d,
      subjects: d.subjects.map(s => s.name === name ? { ...s, level } : s),
    }))
  }

  const toggleChallenge = (c: string) => {
    setData(d => ({
      ...d,
      challenges: d.challenges.includes(c)
        ? d.challenges.filter(x => x !== c)
        : [...d.challenges, c],
    }))
  }

  const toggleStudyTime = (t: string) => {
    setData(d => ({
      ...d,
      studyTimes: d.studyTimes.includes(t)
        ? d.studyTimes.filter(x => x !== t)
        : [...d.studyTimes, t],
    }))
  }

  const toggleWeakTopic = (subject: string, topic: string) => {
    setData(d => {
      const current = d.weakTopics[subject] || []
      return {
        ...d,
        weakTopics: {
          ...d.weakTopics,
          [subject]: current.includes(topic)
            ? current.filter(t => t !== topic)
            : [...current, topic],
        },
      }
    })
  }

  const toggleLearningStyle = (style: string) => {
    setData(d => ({
      ...d,
      learningStyles: d.learningStyles.includes(style)
        ? d.learningStyles.filter(x => x !== style)
        : [...d.learningStyles, style],
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0f1a' }}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={400} colors={['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']} />}

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">IB Mentor AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#64748b' }}>Step {step + 1} of {STEPS.length}</span>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === step ? '20px' : '8px',
                    background: i <= step ? '#7c3aed' : '#1e2a3a',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-8">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* STEP 0: Programme */}
            {step === 0 && (
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
                    <button
                      key={p.label}
                      onClick={() => setData(d => ({ ...d, programme: p.label }))}
                      className="card card-hover p-6 text-left transition-all duration-200"
                      style={data.programme === p.label ? { borderColor: '#7c3aed', background: 'rgba(124,58,237,0.1)' } : {}}
                    >
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

            {/* STEP 1: Subjects */}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Select your subjects</h2>
                <p className="text-slate-400 mb-2">
                  {isDP ? 'Pick exactly 3 HL and 3 SL subjects' : 'All 8 MYP subject groups'}
                </p>
                {isDP && (
                  <div className="flex gap-3 mb-6">
                    <span className="tag tag-purple">HL: {data.subjects.filter(s => s.level === 'HL').length}/3</span>
                    <span className="tag tag-cyan">SL: {data.subjects.filter(s => s.level === 'SL').length}/3</span>
                  </div>
                )}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {subjectList.map(subject => {
                    const selected = data.subjects.find(s => s.name === subject.name)
                    return (
                      <div
                        key={subject.name}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer"
                        style={{
                          background: selected ? 'rgba(124,58,237,0.1)' : '#161827',
                          border: `1px solid ${selected ? '#7c3aed' : '#1e2a3a'}`,
                        }}
                        onClick={() => toggleSubject(subject.name, subject.group)}
                      >
                        <span className="text-xl w-8 text-center">{subject.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{subject.name}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{subject.group}</p>
                        </div>
                        {isDP && selected && (
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            {(['HL', 'SL'] as const).map(lvl => (
                              <button
                                key={lvl}
                                onClick={() => setSubjectLevel(subject.name, lvl)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                                style={{
                                  background: selected.level === lvl ? '#7c3aed' : '#1e2a3a',
                                  color: selected.level === lvl ? 'white' : '#64748b',
                                  border: `1px solid ${selected.level === lvl ? '#7c3aed' : '#2d3748'}`,
                                }}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        )}
                        {selected && !isDP && <Check className="w-4 h-4" style={{ color: '#7c3aed' }} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Goals */}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Set your goals</h2>
                <p className="text-slate-400 mb-8">What are you aiming for?</p>
                <div className="space-y-8">
                  {isDP && (
                    <div>
                      <div className="flex justify-between mb-3">
                        <label className="text-white font-semibold">Target Diploma Score</label>
                        <span className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{data.goalPoints}</span>
                      </div>
                      <input
                        type="range" min={24} max={45}
                        value={data.goalPoints}
                        onChange={e => setData(d => ({ ...d, goalPoints: Number(e.target.value) }))}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
                        <span>24</span><span>45 (Max)</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-white font-semibold mb-3 block">University / Programme you&apos;re aiming for</label>
                    <input
                      value={data.universityAim}
                      onChange={e => setData(d => ({ ...d, universityAim: e.target.value }))}
                      placeholder="e.g. UCL Computer Science, Imperial Medicine..."
                      className="input-dark w-full"
                    />
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Biggest challenges (select all that apply)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Time management', 'Understanding content', 'Exam technique', 'Motivation', 'All of the above'].map(c => (
                        <button
                          key={c}
                          onClick={() => toggleChallenge(c)}
                          className="p-3 rounded-xl text-sm text-left transition-all duration-200"
                          style={{
                            background: data.challenges.includes(c) ? 'rgba(124,58,237,0.2)' : '#161827',
                            border: `1px solid ${data.challenges.includes(c) ? '#7c3aed' : '#1e2a3a'}`,
                            color: data.challenges.includes(c) ? '#c4b5fd' : '#94a3b8',
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Study Habits */}
            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your study habits</h2>
                <p className="text-slate-400 mb-8">Help us plan around your schedule</p>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-white font-semibold">Study hours per week</label>
                      <span className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{data.studyHours}h</span>
                    </div>
                    <input
                      type="range" min={2} max={30}
                      value={data.studyHours}
                      onChange={e => setData(d => ({ ...d, studyHours: Number(e.target.value) }))}
                      className="w-full accent-purple-600"
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
                      <span>2h</span><span>30h</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Preferred study times</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Morning', icon: '🌅', time: '6am–12pm' },
                        { label: 'Afternoon', icon: '☀️', time: '12pm–6pm' },
                        { label: 'Evening', icon: '🌆', time: '6pm–10pm' },
                        { label: 'Late Night', icon: '🌙', time: '10pm+' },
                      ].map(t => (
                        <button
                          key={t.label}
                          onClick={() => toggleStudyTime(t.label)}
                          className="p-4 rounded-xl text-left transition-all duration-200"
                          style={{
                            background: data.studyTimes.includes(t.label) ? 'rgba(124,58,237,0.2)' : '#161827',
                            border: `1px solid ${data.studyTimes.includes(t.label) ? '#7c3aed' : '#1e2a3a'}`,
                          }}
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <p className="text-white font-semibold mt-2">{t.label}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{t.time}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">Time until exams</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['6+ months', '3–6 months', '1–3 months', 'Under 1 month'].map(e => (
                        <button
                          key={e}
                          onClick={() => setData(d => ({ ...d, examProximity: e }))}
                          className="p-3 rounded-xl text-sm transition-all duration-200"
                          style={{
                            background: data.examProximity === e ? 'rgba(124,58,237,0.2)' : '#161827',
                            border: `1px solid ${data.examProximity === e ? '#7c3aed' : '#1e2a3a'}`,
                            color: data.examProximity === e ? '#c4b5fd' : '#94a3b8',
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Weak Topics */}
            {step === 4 && (
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
                            <button
                              key={topic}
                              onClick={() => toggleWeakTopic(subject.name, topic)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                              style={{
                                background: selected.includes(topic) ? 'rgba(124,58,237,0.3)' : '#1e2a3a',
                                border: `1px solid ${selected.includes(topic) ? '#7c3aed' : '#2d3748'}`,
                                color: selected.includes(topic) ? '#c4b5fd' : '#64748b',
                              }}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {data.subjects.length === 0 && (
                    <p className="text-center py-12" style={{ color: '#64748b' }}>No subjects selected yet — go back and add subjects first</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Learning Style */}
            {step === 5 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">How do you learn best?</h2>
                <p className="text-slate-400 mb-8">We&apos;ll tailor your AI tutor to match your style</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block">Learning methods</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Videos', icon: '🎥' },
                        { label: 'Reading notes', icon: '📖' },
                        { label: 'Practice questions', icon: '✏️' },
                        { label: 'Flashcards', icon: '🃏' },
                        { label: 'Teaching others', icon: '👨‍🏫' },
                      ].map(s => (
                        <button
                          key={s.label}
                          onClick={() => toggleLearningStyle(s.label)}
                          className="p-4 rounded-xl text-left transition-all duration-200"
                          style={{
                            background: data.learningStyles.includes(s.label) ? 'rgba(124,58,237,0.2)' : '#161827',
                            border: `1px solid ${data.learningStyles.includes(s.label) ? '#7c3aed' : '#1e2a3a'}`,
                          }}
                        >
                          <span className="text-2xl">{s.icon}</span>
                          <p className="text-white font-medium mt-2 text-sm">{s.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block">AI personality</label>
                    <div className="space-y-3">
                      {[
                        { label: 'Strict exam coach', icon: '⚡', desc: 'Focused on marks, mark schemes, and exam technique' },
                        { label: 'Friendly tutor', icon: '😊', desc: 'Encouraging, explains concepts step by step' },
                        { label: 'Concise and fast', icon: '⚡', desc: 'Quick answers, bullet points, no fluff' },
                      ].map(p => (
                        <button
                          key={p.label}
                          onClick={() => setData(d => ({ ...d, aiPersonality: p.label }))}
                          className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                          style={{
                            background: data.aiPersonality === p.label ? 'rgba(124,58,237,0.2)' : '#161827',
                            border: `1px solid ${data.aiPersonality === p.label ? '#7c3aed' : '#1e2a3a'}`,
                          }}
                        >
                          <span className="text-2xl">{p.icon}</span>
                          <div>
                            <p className="text-white font-semibold text-sm">{p.label}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{p.desc}</p>
                          </div>
                          {data.aiPersonality === p.label && <Check className="w-4 h-4 ml-auto" style={{ color: '#7c3aed' }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Confirmation */}
            {step === 6 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">You&apos;re all set! 🎉</h2>
                <p className="text-slate-400 mb-6">Here&apos;s a summary of your setup</p>
                <div className="space-y-4">
                  {[
                    { label: 'Programme', value: data.programme || 'Not set' },
                    { label: 'Subjects', value: `${data.subjects.length} subjects selected` },
                    { label: 'Target Score', value: isDP ? `${data.goalPoints}/45` : 'Per subject' },
                    { label: 'University aim', value: data.universityAim || 'Not specified' },
                    { label: 'Study hours', value: `${data.studyHours}h/week` },
                    { label: 'Study times', value: data.studyTimes.join(', ') || 'Not set' },
                    { label: 'AI personality', value: data.aiPersonality },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#161827', border: '1px solid #1e2a3a' }}>
                      <span className="text-sm" style={{ color: '#64748b' }}>{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={launch}
                  disabled={launching}
                  className="mt-8 w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    boxShadow: '0 4px 30px rgba(124,58,237,0.4)',
                  }}
                >
                  {launching ? '🚀 Launching...' : '🚀 Launch IB Mentor AI'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 6 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: '#161827', border: '1px solid #1e2a3a', color: '#94a3b8' }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(6)} className="text-sm" style={{ color: '#475569' }}>
              Skip all
            </button>
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all btn-primary"
            >
              {step === STEPS.length - 2 ? 'Review' : 'Continue'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
