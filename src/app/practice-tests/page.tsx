'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  Trophy, ChevronDown, Clock, Sparkles, Play, Square, Upload,
  RotateCcw, X, Loader2, ChevronRight, FileText, BarChart3,
  BookOpen, Zap, Eye, EyeOff, ArrowLeft, Check, Crosshair, MessageSquare
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
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g)
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (/^\[\d+\]$/.test(part)) return (
      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: '#dbeafe', color: '#1d4ed8', minWidth: 28 }}>{part}</span>
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

    if (trimmed.startsWith('━')) {
      if (!inHeader) {
        inHeader = true
        headerLines = []
      } else {
        inHeader = false
        elements.push(
          <div key={`hdr-${i}`} style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '2px solid #1e3a5f' }}>
            {headerLines.map((hl, hi) => {
              const ht = hl.trim()
              if (!ht) return null
              if (/^IB DIPLOMA/.test(ht)) return <div key={hi} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>{ht}</div>
              if (/^INSTRUCTIONS TO/.test(ht)) return <div key={hi} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 20, marginBottom: 8, color: '#334155' }}>{ht}</div>
              if (ht.startsWith('•')) return <div key={hi} style={{ fontSize: 13, marginLeft: 12, marginBottom: 3, display: 'flex', gap: 8, color: '#475569' }}><span>•</span><span>{ht.slice(1).trim()}</span></div>
              if (ht === ht.toUpperCase() && ht.length > 3 && !ht.startsWith('•') && !ht.includes('Do not') && !ht.includes('Write') && !ht.includes('Calculator') && !ht.includes('maximum') && !ht.includes('show') && !ht.includes('Where') && !ht.includes('Answer') && !/^\d/.test(ht)) {
                return <div key={hi} style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginTop: 4, marginBottom: 2, color: '#0f172a', fontFamily: 'Georgia, serif' }}>{ht}</div>
              }
              return <div key={hi} style={{ fontSize: 13, marginBottom: 2, color: '#475569' }}>{ht}</div>
            })}
          </div>
        )
        headerLines = []
      }
      i++; continue
    }

    if (inHeader) { headerLines.push(line); i++; continue }

    if (trimmed.startsWith('─') || trimmed === '---') {
      elements.push(<div key={`div-${i}`} style={{ margin: '20px 0', borderTop: '1px dashed #cbd5e1' }} />)
      i++; continue
    }

    if (/^#{1,3}\s/.test(trimmed)) {
      const text = trimmed.replace(/^#+\s*/, '')
      elements.push(
        <div key={`sec-${i}`} style={{ margin: '40px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, background: '#1e3a5f', color: 'white' }}>{text}</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>
      )
      i++; continue
    }

    if (/^SECTION [A-Z]/.test(trimmed)) {
      const parts = trimmed.match(/^(SECTION [A-Z])\s*[—–-]?\s*(.*)/)
      const label = parts?.[1] ?? trimmed
      const desc = parts?.[2] ?? ''
      elements.push(
        <div key={`sec-${i}`} style={{ margin: '40px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <div style={{ textAlign: 'center', padding: '0 16px' }}>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, background: '#1e3a5f', color: 'white' }}>{label}</span>
            {desc && <div style={{ fontSize: 12, marginTop: 4, color: '#64748b' }}>{desc}</div>}
          </div>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>
      )
      i++; continue
    }

    if (/^\[DIAGRAM:/i.test(trimmed)) {
      const desc = trimmed.replace(/^\[DIAGRAM:\s*/i, '').replace(/\]$/, '')
      elements.push(
        <div key={`diag-${i}`} style={{ margin: '20px 0', borderRadius: 12, overflow: 'hidden', border: '1.5px dashed #94a3b8' }}>
          <div style={{ padding: '6px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: '#f1f5f9', color: '#64748b', borderBottom: '1px dashed #cbd5e1' }}>Diagram</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 100, background: '#f8fafc', color: '#94a3b8', textAlign: 'center', fontSize: 13 }}>
            <div><div style={{ fontSize: 28, marginBottom: 8 }}>📊</div><div style={{ fontStyle: 'italic' }}>{desc}</div></div>
          </div>
        </div>
      )
      i++; continue
    }

    if (/^[A-D]\.\s/.test(trimmed)) {
      const opts: string[] = []
      while (i < lines.length && /^[A-D]\.\s/.test(lines[i].trim())) {
        opts.push(lines[i].trim())
        i++
      }
      elements.push(
        <div key={`mcq-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, marginBottom: 16, marginLeft: 28 }}>
          {opts.map((opt, oi) => {
            const letter = opt[0]
            const text = opt.slice(3)
            return (
              <div key={oi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #e2e8f0', transition: 'all 0.12s' }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, background: '#1e3a5f', color: 'white' }}>{letter}</span>
                <span style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{renderInline(text)}</span>
              </div>
            )
          })}
        </div>
      )
      continue
    }

    if (/^\.{5,}/.test(trimmed)) {
      const count = (trimmed.match(/\.\./g) || []).length
      const lineCount = Math.max(1, Math.round(count / 20))
      elements.push(
        <div key={`ans-${i}`} style={{ margin: '12px 0 12px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Array.from({ length: lineCount }).map((_, li) => (
            <div key={li} style={{ height: 1, background: 'linear-gradient(to right, #94a3b8, transparent)', opacity: 0.6 }} />
          ))}
        </div>
      )
      i++; continue
    }

    const qMatch = trimmed.match(/^\*?\*?(\d+)\.\*?\*?\s+(.*)/)
    if (qMatch && !trimmed.startsWith('  ')) {
      const num = qMatch[1]
      const rest = qMatch[2]
      elements.push(
        <div key={`q-${i}`} style={{ display: 'flex', gap: 16, marginTop: 32, marginBottom: 8 }}>
          <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, background: '#0f2744', color: 'white', fontFamily: 'Georgia, serif' }}>{num}</div>
          <div style={{ flex: 1, paddingTop: 6, fontSize: 14, fontWeight: 500, lineHeight: 1.7, color: '#0f172a' }}>{renderInline(rest)}</div>
        </div>
      )
      i++; continue
    }

    const subMatch = trimmed.match(/^\(((?:[a-e]|i{1,3}|iv|v|vi))\)\s+(.*)/)
    if (subMatch) {
      elements.push(
        <div key={`sub-${i}`} style={{ display: 'flex', gap: 12, marginLeft: 40, marginTop: 16, marginBottom: 4 }}>
          <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>({subMatch[1]})</span>
          <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.65, color: '#1e293b' }}>{renderInline(subMatch[2])}</div>
        </div>
      )
      i++; continue
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('–') || trimmed.startsWith('-')) {
      const text = trimmed.replace(/^[•–-]\s*/, '')
      elements.push(
        <div key={`bul-${i}`} style={{ display: 'flex', gap: 8, marginLeft: 48, marginBottom: 4, fontSize: 13, color: '#334155' }}>
          <span style={{ color: '#94a3b8', flexShrink: 0 }}>•</span>
          <span>{renderInline(text)}</span>
        </div>
      )
      i++; continue
    }

    if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const rows = tableLines.filter(r => !/^\|[-| ]+\|$/.test(r))
      elements.push(
        <div key={`tbl-${i}`} style={{ margin: '16px 0 16px 28px', overflowX: 'auto' }}>
          <table style={{ fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
            {rows.map((row, ri) => {
              const cells = row.split('|').filter(Boolean).map(c => c.trim())
              return (
                <tr key={ri} style={{ background: ri === 0 ? '#f0f4ff' : ri % 2 === 0 ? '#f8fafc' : 'white' }}>
                  {cells.map((cell, ci) => (
                    <td key={ci} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: ri === 0 ? 700 : 400 }}>{renderInline(cell)}</td>
                  ))}
                </tr>
              )
            })}
          </table>
        </div>
      )
      continue
    }

    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      elements.push(<div key={`bold-${i}`} style={{ fontWeight: 700, fontSize: 13, marginTop: 16, marginBottom: 4, color: '#1e3a5f' }}>{trimmed.slice(2, -2)}</div>)
      i++; continue
    }

    if (/^NOTE TO|^End of|^Total:/.test(trimmed)) {
      elements.push(
        <div key={`note-${i}`} style={{ marginTop: 32, padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, textAlign: 'center', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{trimmed}</div>
      )
      i++; continue
    }

    if (!trimmed) { elements.push(<div key={`sp-${i}`} style={{ height: 8 }} />); i++; continue }

    elements.push(<p key={`p-${i}`} style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 4, marginLeft: 8, color: '#334155' }}>{renderInline(trimmed)}</p>)
    i++
  }

  return <div>{elements}</div>
}

export default function PracticeTestsPage() {
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [totalPoints, setTotalPoints] = useState(0)
  const [view, setView] = useState<View>('home')
  const [currentPaper, setCurrentPaper] = useState<GeneratedPaper | null>(null)
  const [pastPapers, setPastPapers] = useState<GeneratedPaper[]>([])
  const [showMarkScheme, setShowMarkScheme] = useState(false)

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'SL' | 'HL'>('SL')
  const [selectedPaperType, setSelectedPaperType] = useState('Paper 1')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('Standard')

  const [timeLeft, setTimeLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  // AI help drag-select state
  const [aiHelpMode, setAiHelpMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragClientStart, setDragClientStart] = useState<{ x: number; y: number } | null>(null)
  const [dragClientCurrent, setDragClientCurrent] = useState<{ x: number; y: number } | null>(null)
  const [aiPanel, setAiPanel] = useState<{ loading: boolean; response: string; x: number; y: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

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
    const savedPoints = localStorage.getItem('ib_xp_points')
    if (savedPoints) setTotalPoints(parseInt(savedPoints, 10))
  }, [])

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (timerRunning && timeLeft === 0) setTimerRunning(false)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning, timeLeft])

  // Exit AI help mode when leaving exam
  useEffect(() => {
    if (view !== 'exam') setAiHelpMode(false)
  }, [view])

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
      setTotalPoints(p => {
        const next = p + 75
        localStorage.setItem('ib_xp_points', String(next))
        return next
      })
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
    setAiHelpMode(false)
    setAiPanel(null)
    setView('home')
  }

  // ── AI drag-select handlers ──────────────────────────────
  const onOverlayMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    setDragClientStart({ x: e.clientX, y: e.clientY })
    setDragClientCurrent({ x: e.clientX, y: e.clientY })
    setIsDragging(true)
    setAiPanel(null)
  }

  const onOverlayMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragClientCurrent({ x: e.clientX, y: e.clientY })
  }

  const onOverlayMouseUp = async (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) { setIsDragging(false); return }
    const start = dragStartRef.current
    const end = { x: e.clientX, y: e.clientY }
    setIsDragging(false)
    setDragClientStart(null)
    setDragClientCurrent(null)
    dragStartRef.current = null

    if (Math.abs(end.x - start.x) < 12 && Math.abs(end.y - start.y) < 12) return

    const x1 = Math.min(start.x, end.x)
    const y1 = Math.min(start.y, end.y)
    const x2 = Math.max(start.x, end.x)
    const y2 = Math.max(start.y, end.y)

    // Extract text via Range API
    let selectedText = ''
    try {
      const range = document.createRange()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cr = (document as any).caretRangeFromPoint
      const sr = cr?.(x1, y1)
      const er = cr?.(x2, y2)
      if (sr && er) {
        range.setStart(sr.startContainer, sr.startOffset)
        range.setEnd(er.startContainer, er.startOffset)
        selectedText = range.toString().trim()
      }
    } catch {}

    // DOM element fallback
    if (!selectedText && overlayRef.current?.parentElement) {
      const seen = new Set<string>()
      const parts: string[] = []
      overlayRef.current.parentElement.querySelectorAll('p, div, span, td, strong').forEach(el => {
        if (el.children.length > 2) return
        const r = el.getBoundingClientRect()
        if (r.right > x1 && r.left < x2 && r.bottom > y1 && r.top < y2) {
          const t = el.textContent?.trim() || ''
          if (t.length > 3 && !seen.has(t)) { seen.add(t); parts.push(t) }
        }
      })
      selectedText = parts.slice(0, 12).join(' ')
    }

    if (!selectedText || selectedText.length < 5) return

    const panelX = Math.min(Math.max(x1, 16), window.innerWidth - 400)
    const panelY = Math.min(y2 + 12, window.innerHeight - 340)
    setAiPanel({ loading: true, response: '', x: panelX, y: panelY })

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `I'm doing an IB ${currentPaper?.subject} ${currentPaper?.level} exam. I've selected this part of the question:\n\n"${selectedText.slice(0, 600)}"\n\nGive me a concise hint (2–3 sentences max): what concept or skill is being tested, and what approach to take. Do NOT give me the full answer.`
          }]
        })
      })
      const d = await res.json()
      setAiPanel(prev => prev ? { ...prev, loading: false, response: d.content || 'No response.' } : null)
    } catch {
      setAiPanel(prev => prev ? { ...prev, loading: false, response: 'Could not get AI help. Please try again.' } : null)
    }
  }

  // ──────────────────────────────────────────────────────────
  // EXAM / PAPER / FEEDBACK VIEW
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
              {/* AI Help toggle — only during exam */}
              {isExam && (
                <button
                  onClick={() => { setAiHelpMode(m => !m); setAiPanel(null) }}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
                  style={{
                    background: aiHelpMode ? 'rgba(124,58,237,0.25)' : '#1e2a3a',
                    border: `1px solid ${aiHelpMode ? '#7c3aed' : '#2d3748'}`,
                    color: aiHelpMode ? '#c4b5fd' : '#94a3b8',
                    boxShadow: aiHelpMode ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
                  }}
                  title="Drag to select any part of the paper for an AI hint"
                >
                  <Crosshair className="w-4 h-4" />
                  {aiHelpMode ? 'Drag to select…' : 'AI Help'}
                </button>
              )}

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
                <button
                  onClick={() => setShowMarkScheme(s => !s)}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
                  style={{ background: showMarkScheme ? 'rgba(124,58,237,0.2)' : '#1e2a3a', border: '1px solid #2d3748', color: showMarkScheme ? '#c4b5fd' : '#94a3b8' }}
                >
                  {showMarkScheme ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} Mark Scheme
                </button>
              )}
            </div>
          </div>

          {/* AI help mode banner */}
          {isExam && aiHelpMode && (
            <div className="flex items-center justify-center gap-2 py-2 flex-shrink-0 text-xs font-medium" style={{ background: 'rgba(124,58,237,0.12)', borderBottom: '1px solid rgba(124,58,237,0.25)', color: '#c4b5fd' }}>
              <Crosshair className="w-3.5 h-3.5" />
              Drag a box around any question text to get an AI hint — click AI Help again to exit
            </div>
          )}

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Paper scroll area */}
            <div className="overflow-y-auto flex-1" style={{ background: '#e8eaf0', position: 'relative' }}>
              <div style={{ padding: '40px 32px', maxWidth: 900, margin: '0 auto' }}>

                {/* Paper card */}
                <div style={{
                  background: 'white',
                  borderRadius: 4,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 20px 60px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Red margin line */}
                  <div style={{ position: 'absolute', left: 56, top: 0, bottom: 0, width: 1.5, background: '#fca5a5', opacity: 0.7 }} />

                  {/* Paper content */}
                  <div style={{ padding: '56px 64px 72px 80px' }}>
                    <PaperRenderer content={currentPaper.paper} />

                    {/* Page footer */}
                    <div style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>IB Mentor AI — Practice Paper</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Turn over ▶</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag-select overlay — sits above paper, captures mouse */}
              {isExam && aiHelpMode && (
                <div
                  ref={overlayRef}
                  style={{
                    position: 'absolute', inset: 0,
                    cursor: 'crosshair',
                    zIndex: 40,
                    background: 'rgba(124,58,237,0.03)',
                  }}
                  onMouseDown={onOverlayMouseDown}
                  onMouseMove={onOverlayMouseMove}
                  onMouseUp={onOverlayMouseUp}
                  onMouseLeave={e => { if (isDragging) onOverlayMouseUp(e as React.MouseEvent) }}
                />
              )}
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

        {/* Drag selection rect — fixed viewport overlay */}
        {isDragging && dragClientStart && dragClientCurrent && (
          <div style={{
            position: 'fixed',
            left: Math.min(dragClientStart.x, dragClientCurrent.x),
            top: Math.min(dragClientStart.y, dragClientCurrent.y),
            width: Math.abs(dragClientCurrent.x - dragClientStart.x),
            height: Math.abs(dragClientCurrent.y - dragClientStart.y),
            border: '2px solid #7c3aed',
            background: 'rgba(124,58,237,0.1)',
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 9999,
          }} />
        )}

        {/* AI hint panel — fixed, appears after drag release */}
        {aiPanel && (
          <div style={{
            position: 'fixed',
            left: aiPanel.x,
            top: aiPanel.y,
            width: 360,
            borderRadius: 16,
            background: '#161827',
            border: '1px solid rgba(124,58,237,0.4)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)',
            zIndex: 10000,
            overflow: 'hidden',
          }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(124,58,237,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare style={{ width: 14, height: 14, color: '#c4b5fd' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>AI Hint</p>
                  <p style={{ fontSize: 11, color: '#7c3aed' }}>Exam mode — hints only</p>
                </div>
              </div>
              <button
                onClick={() => setAiPanel(null)}
                style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Panel body */}
            <div style={{ padding: '14px 16px' }}>
              {aiPanel.loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
                  <Loader2 style={{ width: 16, height: 16, color: '#7c3aed', animation: 'spin 1s linear infinite' }} />
                  Analysing selected text…
                </div>
              ) : (
                <p style={{ fontSize: 13, lineHeight: 1.65, color: '#cbd5e1' }}>{aiPanel.response}</p>
              )}
            </div>

            {!aiPanel.loading && (
              <div style={{ padding: '0 16px 14px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setAiPanel(null)}
                  style={{ fontSize: 12, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

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
                      <img src={url} alt={`Upload ${i + 1}`} className="w-20 h-20 object-cover rounded-xl" />
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
                <p style={{ marginTop: 12, fontSize: 12, color: '#f59e0b', textAlign: 'center' }}>
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
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Marking…</>
                    : <><Sparkles className="w-4 h-4" /> Get AI Marking</>}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
                  { label: 'Standard', icon: BookOpen, desc: 'Core knowledge & application', color: '#10b981' },
                  { label: 'Challenging', icon: Zap, desc: 'Higher-order analysis & evaluation', color: '#f59e0b' },
                  { label: 'Mixed', icon: Sparkles, desc: 'Recall through evaluation', color: '#7c3aed' },
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
                  <ChevronRight style={{ width: 14, height: 14, color: '#334155', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
