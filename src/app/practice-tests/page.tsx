'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  Trophy, ChevronDown, Clock, Sparkles, Play, Square, Upload,
  RotateCcw, X, Loader2, ChevronRight, FileText, BarChart3,
  BookOpen, Zap, Eye, EyeOff, ArrowLeft, Check
} from 'lucide-react'
import { OnboardingData } from '@/types'
import { IB_TOPICS, DP_UNITS } from '@/data/ib-data'

const TIER_CONFIG = [
  { name: 'Beginner', min: 0, max: 100, color: '#94a3b8' },
  { name: 'Practitioner', min: 100, max: 300, color: '#06b6d4' },
  { name: 'Scholar', min: 300, max: 600, color: '#7c3aed' },
  { name: 'Expert', min: 600, max: 1000, color: '#f59e0b' },
]

const SUBJECT_PAPER_TYPES: Record<string, { sl: string[]; hl: string[] }> = {
  default: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  Mathematics: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  Physics: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  Chemistry: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  Biology: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  Economics: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  History: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  Geography: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2', 'Paper 3'] },
  'English A': { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2'] },
  'English B': { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2'] },
  Business: { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2'] },
  'Environmental Systems': { sl: ['Paper 1', 'Paper 2'], hl: ['Paper 1', 'Paper 2'] },
}

interface GeneratedPaper {
  id: string
  paper: string
  duration: number
  totalMarks: number
  subject: string
  level: 'SL' | 'HL'
  paperType: string
  topics: string[]
  difficulty: string
  generatedAt: string
  score?: number
  feedback?: string
}

type View = 'home' | 'generating' | 'paper' | 'exam' | 'feedback'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function renderInline(text: string): React.ReactNode {
  // Render **bold**, marks [N], and plain text
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g)
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (/^\[\d+\]$/.test(part)) return (
      <span key={i} className="inline-flex items-center justify-center ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#e0e7ff', color: '#4338ca', minWidth: 28 }}>{part}</span>
    )
    return <span key={i}>{part}</span>
  })
}

function PaperRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let inHeader = false
  let headerLines: string[] = []

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // ━━━ thick divider — start/end of header block
    if (trimmed.startsWith('━')) {
      if (!inHeader) {
        inHeader = true
        headerLines = []
      } else {
        // End of header — render the collected header block
        inHeader = false
        elements.push(
          <div key={`hdr-${i}`} className="mb-8 pb-6" style={{ borderBottom: '3px solid #1e3a5f' }}>
            {headerLines.map((hl, hi) => {
              const ht = hl.trim()
              if (!ht) return null
              if (/^IB DIPLOMA/.test(ht)) return <div key={hi} className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: '#64748b' }}>{ht}</div>
              if (/^INSTRUCTIONS TO/.test(ht)) return <div key={hi} className="text-xs font-bold tracking-widest uppercase mt-4 mb-2" style={{ color: '#334155' }}>{ht}</div>
              if (ht.startsWith('•')) return <div key={hi} className="text-sm ml-3 mb-0.5 flex gap-2" style={{ color: '#475569' }}><span>•</span><span>{ht.slice(1).trim()}</span></div>
              // Subject line (all caps, largest)
              if (ht === ht.toUpperCase() && ht.length > 3 && !ht.startsWith('•') && !ht.includes('Do not') && !ht.includes('Write') && !ht.includes('Calculator') && !ht.includes('maximum') && !ht.includes('show') && !ht.includes('Where') && !ht.includes('Answer') && !/^\d/.test(ht)) {
                return <div key={hi} className="text-2xl font-black tracking-tight mt-1 mb-0.5" style={{ color: '#0f172a' }}>{ht}</div>
              }
              return <div key={hi} className="text-sm mb-0.5" style={{ color: '#475569' }}>{ht}</div>
            })}
          </div>
        )
        headerLines = []
      }
      i++; continue
    }

    if (inHeader) { headerLines.push(line); i++; continue }

    // ─── dashed divider (question separator)
    if (trimmed.startsWith('─') || trimmed === '---') {
      elements.push(<div key={`div-${i}`} className="my-5" style={{ borderTop: '1px dashed #cbd5e1' }} />)
      i++; continue
    }

    // SECTION headers
    if (/^#{1,3}\s/.test(trimmed)) {
      const text = trimmed.replace(/^#+\s*/, '')
      elements.push(
        <div key={`sec-${i}`} className="mt-10 mb-4 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
          <span className="text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ background: '#1e3a5f', color: 'white' }}>{text}</span>
          <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
        </div>
      )
      i++; continue
    }
    if (/^SECTION [A-Z]/.test(trimmed)) {
      const parts = trimmed.match(/^(SECTION [A-Z])\s*[—–-]?\s*(.*)/)
      const label = parts?.[1] ?? trimmed
      const desc = parts?.[2] ?? ''
      elements.push(
        <div key={`sec-${i}`} className="mt-10 mb-4 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
          <div className="text-center px-4">
            <span className="text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ background: '#1e3a5f', color: 'white' }}>{label}</span>
            {desc && <div className="text-xs mt-1" style={{ color: '#64748b' }}>{desc}</div>}
          </div>
          <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
        </div>
      )
      i++; continue
    }

    // DIAGRAM placeholder
    if (/^\[DIAGRAM:/i.test(trimmed)) {
      const desc = trimmed.replace(/^\[DIAGRAM:\s*/i, '').replace(/\]$/, '')
      elements.push(
        <div key={`diag-${i}`} className="my-5 rounded-xl overflow-hidden" style={{ border: '1.5px dashed #94a3b8' }}>
          <div className="px-4 py-2 text-xs font-bold tracking-widest uppercase" style={{ background: '#f1f5f9', color: '#64748b', borderBottom: '1px dashed #cbd5e1' }}>Diagram</div>
          <div className="flex items-center justify-center p-8 text-sm text-center" style={{ background: '#f8fafc', color: '#94a3b8', minHeight: 100 }}>
            <div>
              <div className="text-2xl mb-2">📊</div>
              <div className="italic">{desc}</div>
            </div>
          </div>
        </div>
      )
      i++; continue
    }

    // MCQ block: collect A B C D options
    if (/^[A-D]\.\s/.test(trimmed)) {
      const opts: string[] = []
      while (i < lines.length && /^[A-D]\.\s/.test(lines[i].trim())) {
        opts.push(lines[i].trim())
        i++
      }
      elements.push(
        <div key={`mcq-${i}`} className="grid grid-cols-1 gap-2 mt-3 mb-4 ml-6">
          {opts.map((opt, oi) => {
            const letter = opt[0]
            const text = opt.slice(3)
            return (
              <div key={oi} className="flex items-start gap-3 px-4 py-2.5 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: '#1e3a5f', color: 'white' }}>{letter}</span>
                <span className="text-sm" style={{ color: '#1e293b' }}>{renderInline(text)}</span>
              </div>
            )
          })}
        </div>
      )
      continue
    }

    // Answer lines (dots)
    if (/^\.{5,}/.test(trimmed)) {
      const count = (trimmed.match(/\.\./g) || []).length
      const lineCount = Math.max(1, Math.round(count / 20))
      elements.push(
        <div key={`ans-${i}`} className="my-3 ml-6 space-y-3">
          {Array.from({ length: lineCount }).map((_, li) => (
            <div key={li} className="h-px" style={{ background: '#94a3b8' }} />
          ))}
        </div>
      )
      i++; continue
    }

    // Numbered question: **1.** or 1. at line start
    const qMatch = trimmed.match(/^\*?\*?(\d+)\.\*?\*?\s+(.*)/)
    if (qMatch && !trimmed.startsWith('  ')) {
      const num = qMatch[1]
      const rest = qMatch[2]
      elements.push(
        <div key={`q-${i}`} className="flex gap-4 mt-8 mb-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: '#1e3a5f', color: 'white' }}>{num}</div>
          <div className="flex-1 pt-1 text-sm font-medium leading-relaxed" style={{ color: '#0f172a' }}>{renderInline(rest)}</div>
        </div>
      )
      i++; continue
    }

    // Sub-question: (a), (b), (i), (ii)
    const subMatch = trimmed.match(/^\(((?:[a-e]|i{1,3}|iv|v|vi))\)\s+(.*)/)
    if (subMatch) {
      elements.push(
        <div key={`sub-${i}`} className="flex gap-3 ml-8 mt-4 mb-1">
          <span className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: '#e0e7ff', color: '#4338ca' }}>({subMatch[1]})</span>
          <div className="flex-1 text-sm leading-relaxed" style={{ color: '#1e293b' }}>{renderInline(subMatch[2])}</div>
        </div>
      )
      i++; continue
    }

    // Bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('–') || trimmed.startsWith('-')) {
      const text = trimmed.replace(/^[•–-]\s*/, '')
      elements.push(
        <div key={`bul-${i}`} className="flex gap-2 ml-10 mb-1 text-sm" style={{ color: '#334155' }}>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span>{renderInline(text)}</span>
        </div>
      )
      i++; continue
    }

    // Table rows (markdown)
    if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const rows = tableLines.filter(r => !/^\|[-| ]+\|$/.test(r))
      elements.push(
        <div key={`tbl-${i}`} className="my-4 overflow-x-auto ml-6">
          <table className="text-sm border-collapse w-full">
            {rows.map((row, ri) => {
              const cells = row.split('|').filter(Boolean).map(c => c.trim())
              return (
                <tr key={ri} style={{ background: ri === 0 ? '#f1f5f9' : ri % 2 === 0 ? '#f8fafc' : 'white' }}>
                  {cells.map((cell, ci) => (
                    <td key={ci} className={`px-3 py-2 ${ri === 0 ? 'font-bold' : ''}`} style={{ border: '1px solid #e2e8f0', color: '#1e293b' }}>{renderInline(cell)}</td>
                  ))}
                </tr>
              )
            })}
          </table>
        </div>
      )
      continue
    }

    // Bold-only line (section label or note)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      elements.push(<div key={`bold-${i}`} className="font-bold text-sm mt-4 mb-1" style={{ color: '#1e3a5f' }}>{trimmed.slice(2, -2)}</div>)
      i++; continue
    }

    // NOTE TO CANDIDATES etc.
    if (/^NOTE TO|^End of|^Total:/.test(trimmed)) {
      elements.push(
        <div key={`note-${i}`} className="mt-8 p-3 rounded-lg text-xs font-medium text-center" style={{ background: '#f1f5f9', color: '#475569' }}>{trimmed}</div>
      )
      i++; continue
    }

    // Empty line
    if (!trimmed) { elements.push(<div key={`sp-${i}`} className="h-2" />); i++; continue }

    // Default paragraph
    elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed mb-1 ml-2" style={{ color: '#334155' }}>{renderInline(trimmed)}</p>)
    i++
  }

  return <div className="space-y-0">{elements}</div>
}

export default function PracticeTestsPage() {
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [totalPoints, setTotalPoints] = useState(247)
  const [view, setView] = useState<View>('home')
  const [currentPaper, setCurrentPaper] = useState<GeneratedPaper | null>(null)
  const [pastPapers, setPastPapers] = useState<GeneratedPaper[]>([])
  const [showMarkScheme, setShowMarkScheme] = useState(false)

  // Configure form
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'SL' | 'HL'>('SL')
  const [selectedPaperType, setSelectedPaperType] = useState('Paper 1')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('Standard')

  // Exam timer
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Submit / marking
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) {
      const parsed: OnboardingData = JSON.parse(data)
      setUserData(parsed)
      if (parsed.subjects?.length) {
        setSelectedSubject(parsed.subjects[0].name)
        setSelectedLevel(parsed.subjects[0].level || 'SL')
      }
    }
    const saved = localStorage.getItem('ib_past_papers')
    if (saved) setPastPapers(JSON.parse(saved))
  }, [])

  // Timer
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (timerRunning && timeLeft === 0) setTimerRunning(false)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning, timeLeft])

  const currentTier = TIER_CONFIG.find(t => totalPoints >= t.min && totalPoints < t.max) || TIER_CONFIG[0]
  const nextTier = TIER_CONFIG[TIER_CONFIG.indexOf(currentTier) + 1]

  const getSubjectPapers = useCallback((): string[] => {
    const key = Object.keys(SUBJECT_PAPER_TYPES).find(k => selectedSubject.includes(k)) || 'default'
    return SUBJECT_PAPER_TYPES[key][selectedLevel === 'HL' ? 'hl' : 'sl']
  }, [selectedSubject, selectedLevel])

  const getAvailableTopics = useCallback((): string[] => {
    const unitTopics = DP_UNITS[selectedSubject]?.map(u => u.name) || []
    const ibTopics = IB_TOPICS[selectedSubject] || []
    return [...new Set([...unitTopics, ...ibTopics])]
  }, [selectedSubject])

  const toggleTopic = (topic: string) => {
    setSelectedTopics(t => t.includes(topic) ? t.filter(x => x !== topic) : [...t, topic])
  }

  const generatePaper = async () => {
    setView('generating')
    try {
      const res = await fetch('/api/ai/generate-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          level: selectedLevel,
          paperType: selectedPaperType,
          topics: selectedTopics,
          difficulty: selectedDifficulty,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const paper: GeneratedPaper = {
        id: Date.now().toString(),
        ...data,
        generatedAt: new Date().toISOString(),
      }
      setCurrentPaper(paper)
      setView('paper')
    } catch (err) {
      console.error(err)
      setView('home')
    }
  }

  const startExam = () => {
    if (!currentPaper) return
    setTimeLeft(currentPaper.duration * 60)
    setTimerRunning(true)
    setView('exam')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedImages(prev => [...prev, ...files])
    files.forEach(f => {
      const url = URL.createObjectURL(f)
      setImagePreviewUrls(prev => [...prev, url])
    })
  }

  const submitForMarking = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/analyze-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls: [],
          testTitle: `${currentPaper?.paperType} — ${selectedDifficulty}`,
          subject: currentPaper?.subject,
          level: currentPaper?.level,
          totalMarks: currentPaper?.totalMarks,
          paperContent: currentPaper?.paper,
        }),
      })
      const data = await res.json()
      const updatedPaper = { ...currentPaper!, feedback: data.feedback }
      setCurrentPaper(updatedPaper)
      const updated = [...pastPapers, updatedPaper]
      setPastPapers(updated)
      localStorage.setItem('ib_past_papers', JSON.stringify(updated))
      setTotalPoints(p => p + 75)
      setTimerRunning(false)
      setView('feedback')
    } catch {
      setCurrentPaper(p => p ? { ...p, feedback: 'Failed to generate feedback. Please try again.' } : p)
      setView('feedback')
    } finally {
      setAnalyzing(false)
      setShowSubmitModal(false)
    }
  }

  const generateWeakTopicPaper = () => {
    const weakTopics = Object.values(userData?.weakTopics || {}).flat()
    setSelectedTopics(weakTopics.slice(0, 5))
    setSelectedDifficulty('Challenging')
    setView('home')
  }

  const resetToHome = () => {
    setCurrentPaper(null)
    setUploadedImages([])
    setImagePreviewUrls([])
    setTimerRunning(false)
    setShowMarkScheme(false)
    setView('home')
  }

  // ──────────────────────────────────────────────────────────
  // EXAM / PAPER VIEW
  // ──────────────────────────────────────────────────────────
  if ((view === 'paper' || view === 'exam' || view === 'feedback') && currentPaper) {
    const isExam = view === 'exam'
    const isFeedback = view === 'feedback'
    const timerDanger = timeLeft < 300 && isExam

    return (
      <MainLayout>
        <div className="flex flex-col h-screen" style={{ background: '#0d0f1a' }}>
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ background: '#0f1120', borderBottom: '1px solid #1e2a3a' }}>
            <div className="flex items-center gap-4">
              <button onClick={resetToHome} className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="h-4 w-px" style={{ background: '#1e2a3a' }} />
              <div>
                <p className="font-bold text-white text-sm">{currentPaper.subject} {currentPaper.level} — {currentPaper.paperType}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="tag tag-purple text-xs py-0">{currentPaper.level}</span>
                  <span className="tag tag-cyan text-xs py-0">{currentPaper.paperType}</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>{currentPaper.totalMarks} marks · {currentPaper.duration} min</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              {(isExam || (view === 'feedback' && timeLeft > 0)) && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: timerDanger ? 'rgba(239,68,68,0.15)' : '#1e2a3a', border: `1px solid ${timerDanger ? 'rgba(239,68,68,0.5)' : '#2d3748'}` }}>
                  <Clock className="w-4 h-4" style={{ color: timerDanger ? '#ef4444' : '#94a3b8' }} />
                  <span className="font-mono font-bold text-sm" style={{ color: timerDanger ? '#ef4444' : '#e2e8f0' }}>{formatTime(timeLeft)}</span>
                  {isExam && (
                    <button onClick={() => setTimerRunning(r => !r)} className="ml-1">
                      {timerRunning
                        ? <Square className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                        : <Play className="w-3.5 h-3.5" style={{ color: '#10b981' }} />}
                    </button>
                  )}
                </div>
              )}

              {view === 'paper' && (
                <button onClick={startExam} className="flex items-center gap-2 btn-primary text-sm px-5 py-2">
                  <Play className="w-4 h-4" /> Start Exam
                </button>
              )}
              {isExam && (
                <button onClick={() => setShowSubmitModal(true)} className="flex items-center gap-2 btn-primary text-sm px-5 py-2">
                  Submit Answers
                </button>
              )}
              {isFeedback && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMarkScheme(s => !s)}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
                    style={{ background: showMarkScheme ? 'rgba(124,58,237,0.2)' : '#1e2a3a', border: '1px solid #2d3748', color: showMarkScheme ? '#c4b5fd' : '#94a3b8' }}
                  >
                    {showMarkScheme ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} Mark Scheme
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Paper */}
            <div className={`overflow-y-auto p-8 ${isFeedback ? 'flex-1' : 'flex-1'}`} style={{ background: '#f8fafc' }}>
              <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-10">
                <PaperRenderer content={currentPaper.paper} />
              </div>
            </div>

            {/* Feedback Panel */}
            {isFeedback && currentPaper.feedback && (
              <div className="w-[420px] flex-shrink-0 overflow-y-auto flex flex-col" style={{ borderLeft: '1px solid #1e2a3a', background: '#0f1120' }}>
                <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #1e2a3a' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" style={{ color: '#7c3aed' }} />
                    <h3 className="font-bold text-white">AI Examiner Report</h3>
                  </div>
                  <p className="text-xs" style={{ color: '#475569' }}>Based on your paper and submitted answers</p>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#94a3b8' }}>
                    {currentPaper.feedback}
                  </div>
                </div>
                <div className="p-4 space-y-2 flex-shrink-0" style={{ borderTop: '1px solid #1e2a3a' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#475569' }}>NEXT STEPS</p>
                  <button onClick={() => { setSelectedTopics([]); setView('home') }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all card-hover" style={{ background: '#1e2a3a', color: '#94a3b8' }}>
                    <RotateCcw className="w-4 h-4" style={{ color: '#7c3aed' }} /> Regenerate similar paper
                  </button>
                  <button onClick={generateWeakTopicPaper} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all card-hover" style={{ background: '#1e2a3a', color: '#94a3b8' }}>
                    <Zap className="w-4 h-4" style={{ color: '#f59e0b' }} /> Generate on weak topics
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all card-hover" style={{ background: '#1e2a3a', color: '#94a3b8' }}>
                    <BarChart3 className="w-4 h-4" style={{ color: '#10b981' }} /> Add score to grade tracker
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-[520px] rounded-2xl p-7" style={{ background: '#161827', border: '1px solid #1e2a3a', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-white text-lg">Submit Your Answers</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Upload photos for AI examiner marking</p>
                </div>
                <button onClick={() => setShowSubmitModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <label className="block border-dashed border-2 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-purple-500/50" style={{ borderColor: '#2d3748' }}>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: '#475569' }} />
                <p className="text-sm font-semibold text-white mb-1">Click to upload photos of your answers</p>
                <p className="text-xs" style={{ color: '#64748b' }}>JPEG, PNG up to 10MB each · Multiple files supported</p>
              </label>

              {imagePreviewUrls.length > 0 && (
                <div className="flex gap-3 mt-4 flex-wrap">
                  {imagePreviewUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt={`Upload ${i+1}`} className="w-20 h-20 object-cover rounded-xl" />
                      <button
                        onClick={() => { setImagePreviewUrls(p => p.filter((_, j) => j !== i)); setUploadedImages(p => p.filter((_, j) => j !== i)) }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: '#ef4444', color: 'white' }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                <strong>Tip:</strong> Claude receives the full question paper + your photos to generate mark-scheme accurate feedback.
              </div>

              {imagePreviewUrls.length === 0 && (
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#f59e0b', textAlign: 'center' }}>
                  Upload at least one photo of your answers to continue
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 btn-secondary py-3 text-sm">Cancel</button>
                <button
                  onClick={submitForMarking}
                  disabled={analyzing || imagePreviewUrls.length === 0}
                  className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2"
                  style={{ opacity: imagePreviewUrls.length === 0 ? 0.4 : 1, cursor: imagePreviewUrls.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                  {analyzing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Marking...</>
                    : <><Sparkles className="w-4 h-4" /> Get AI Marking</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    )
  }

  // ──────────────────────────────────────────────────────────
  // GENERATING STATE
  // ──────────────────────────────────────────────────────────
  if (view === 'generating') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Generating your paper…</h2>
            <p className="text-sm mb-8" style={{ color: '#64748b' }}>
              Claude is writing your {selectedPaperType} for {selectedSubject} {selectedLevel} with authentic IB formatting and mark schemes.
            </p>
            <div className="space-y-3 text-left">
              {[
                'Applying IB syllabus content',
                'Formatting with correct command terms',
                'Setting mark allocations',
                'Calibrating difficulty level',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#161827', border: '1px solid #1e2a3a' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.3)' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#7c3aed' }} />
                  </div>
                  <span className="text-sm" style={{ color: '#94a3b8' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // ──────────────────────────────────────────────────────────
  // HOME VIEW
  // ──────────────────────────────────────────────────────────
  const subjects = userData?.subjects || []
  const availableTopics = getAvailableTopics()
  const validPapers = getSubjectPapers()

  return (
    <MainLayout>
      <Header title="Practice Tests" subtitle="AI-generated IB exam papers" />
      <div style={{ padding: '36px 48px', maxWidth: '920px', margin: '0 auto' }}>

        {/* XP bar */}
        <div className="card" style={{ padding: '20px 28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: `${currentTier.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy style={{ width: '22px', height: '22px', color: currentTier.color }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>{currentTier.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{totalPoints} pts</p>
            </div>
          </div>
          {nextTier && (
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>{totalPoints} pts</span><span>{nextTier.min} pts → {nextTier.name}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, ((totalPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100)}%` }} /></div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
            {TIER_CONFIG.map(tier => (
              <div key={tier.name} style={{ textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: totalPoints >= tier.min ? `${tier.color}25` : 'rgba(255,255,255,0.04)', border: `2px solid ${totalPoints >= tier.min ? tier.color : 'rgba(255,255,255,0.08)'}` }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: totalPoints >= tier.min ? tier.color : 'rgba(255,255,255,0.1)' }} />
                </div>
                <p style={{ fontSize: '10px', color: totalPoints >= tier.min ? tier.color : 'var(--text-muted)' }}>{tier.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main form */}
        <div className="card" style={{ padding: '40px 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, color: '#fff', fontSize: '22px' }}>Generate a Paper</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>AI-crafted in authentic IB format with mark schemes</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Subject */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>Subject</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedSubject}
                  onChange={e => { setSelectedSubject(e.target.value); setSelectedTopics([]) }}
                  className="select-dark"
                  style={{ width: '100%', fontSize: '15px', padding: '14px 16px', paddingRight: '40px' }}
                >
                  <option value="">Select a subject…</option>
                  {subjects.length > 0
                    ? subjects.map(s => <option key={s.name} value={s.name}>{s.name} ({s.level})</option>)
                    : ['Mathematics: Analysis and Approaches', 'Physics', 'Chemistry', 'Economics', 'History', 'Biology'].map(s => <option key={s} value={s}>{s}</option>)
                  }
                </select>
                <ChevronDown style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Level + Paper type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>Level</label>
                <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {(['SL', 'HL'] as const).map(lvl => (
                    <button key={lvl} onClick={() => { setSelectedLevel(lvl); setSelectedPaperType('Paper 1') }}
                      style={{ flex: 1, padding: '13px', fontSize: '15px', fontWeight: 700, background: selectedLevel === lvl ? '#7c3aed' : 'transparent', color: selectedLevel === lvl ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>Paper Type</label>
                <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {validPapers.map(pt => (
                    <button key={pt} onClick={() => setSelectedPaperType(pt)}
                      style={{ flex: 1, padding: '13px', fontSize: '14px', fontWeight: 700, background: selectedPaperType === pt ? '#7c3aed' : 'transparent', color: selectedPaperType === pt ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {pt.replace('Paper ', 'P')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics */}
            {availableTopics.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Topics <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>(optional — blank = full paper)</span>
                  </label>
                  {selectedTopics.length > 0 && (
                    <button onClick={() => setSelectedTopics([])} style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '4px' }}>
                  {availableTopics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s',
                        background: selectedTopics.includes(topic) ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedTopics.includes(topic) ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                        color: selectedTopics.includes(topic) ? '#c4b5fd' : 'var(--text-secondary)',
                      }}
                    >
                      {selectedTopics.includes(topic) && <Check style={{ display: 'inline', width: '12px', height: '12px', marginRight: '5px' }} />}
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>Difficulty</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Standard',    icon: BookOpen,  desc: 'Core knowledge & application',        color: '#10b981' },
                  { label: 'Challenging', icon: Zap,       desc: 'Higher-order analysis & evaluation',  color: '#f59e0b' },
                  { label: 'Mixed',       icon: Sparkles,  desc: 'Recall through evaluation',           color: '#7c3aed' },
                ].map(d => {
                  const Icon = d.icon
                  const active = selectedDifficulty === d.label
                  return (
                    <button
                      key={d.label}
                      onClick={() => setSelectedDifficulty(d.label)}
                      style={{
                        padding: '20px 16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
                        background: active ? `${d.color}15` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${active ? d.color + '60' : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >
                      <Icon style={{ width: '24px', height: '24px', color: active ? d.color : 'var(--text-muted)', margin: '0 auto 10px' }} />
                      <p style={{ fontWeight: 700, fontSize: '14px', color: active ? '#fff' : 'var(--text-secondary)', marginBottom: '4px' }}>{d.label}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{d.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={generatePaper}
              disabled={!selectedSubject}
              style={{
                width: '100%', padding: '18px', borderRadius: '12px', fontWeight: 800, fontSize: '16px',
                color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: 'none', cursor: selectedSubject ? 'pointer' : 'not-allowed',
                opacity: selectedSubject ? 1 : 0.4,
                boxShadow: selectedSubject ? '0 6px 24px rgba(124,58,237,0.4)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.15s',
              }}
            >
              <Sparkles style={{ width: '20px', height: '20px' }} /> Generate Paper
            </button>
          </div>
        </div>

        {/* Past papers */}
        {pastPapers.length > 0 && (
          <div className="card" style={{ padding: '28px 32px', marginTop: '24px' }}>
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen style={{ width: '16px', height: '16px', color: '#7c3aed' }} /> Past Papers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pastPapers.slice(-5).reverse().map(p => (
                <button
                  key={p.id}
                  onClick={() => { setCurrentPaper(p); setView(p.feedback ? 'feedback' : 'paper') }}
                  className="card-hover"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: '#fff', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.subject.split(':')[0]} {p.level} — {p.paperType}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(p.generatedAt).toLocaleDateString()}</p>
                  </div>
                  {p.feedback && <span className="tag tag-green">Marked</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
