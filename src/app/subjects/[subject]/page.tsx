'use client'

import { useState, useEffect, use, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import {
  ChevronLeft, Plus, Folder, FolderOpen, FileText, Link2, FileType,
  Upload, Sparkles, Mic, Presentation, RotateCcw, Download, Save,
  BookMarked, PenTool, List, Table, ImageIcon, BookOpen,
  Layout, Brain, Loader2, X, Send, Video,
  ChevronRight, RefreshCw, Bot, User,
  Zap, FileSearch, Star, MessageSquareText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DP_UNITS } from '@/data/ib-data'
import { OnboardingData } from '@/types'

interface Source {
  id: string
  title: string
  type: 'pdf' | 'link' | 'note' | 'worksheet'
  created_at: string
  content?: string
}

interface Unit {
  id: string
  name: string
  code: string
  sources: Source[]
  weak_topics: string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Flashcard {
  front: string
  back: string
}

// Studio can show the master list OR a specific generated artifact
type StudioView = 'list' | 'worksheet' | 'flashcards' | 'video'

// ── All generatable items in one flat list ───────────────
const ALL_GENERATE = [
  // Study materials
  { group: 'Study Materials', id: 'audio',             icon: Mic,           label: 'Audio Overview',     desc: 'Conversational summary script',  color: '#06b6d4', action: 'generate' },
  { group: 'Study Materials', id: 'slides',            icon: Presentation,  label: 'Slide Deck',         desc: 'Study slides with key points',   color: '#10b981', action: 'generate' },
  { group: 'Study Materials', id: 'notes',             icon: FileText,      label: 'Study Notes',        desc: 'Comprehensive IB-style notes',   color: '#7c3aed', action: 'generate' },
  { group: 'Study Materials', id: 'summary',           icon: FileSearch,    label: 'Quick Summary',      desc: 'Condensed 1-page overview',      color: '#f59e0b', action: 'generate' },
  // Flashcards
  { group: 'Flashcards',      id: 'flashcards',        icon: MessageSquareText, label: 'Flashcard Deck', desc: 'Interactive flip cards',         color: '#f59e0b', action: 'flashcards' },
  // Worksheets
  { group: 'Worksheets',      id: 'concept-summary',   icon: BookMarked,    label: 'Concept Summary',   desc: 'Key concepts & formulas',        color: '#7c3aed', action: 'worksheet' },
  { group: 'Worksheets',      id: 'practice-short',    icon: PenTool,       label: 'Practice Qs',       desc: 'Short answer, 2-4 marks',        color: '#06b6d4', action: 'worksheet' },
  { group: 'Worksheets',      id: 'exam-style',        icon: FileText,      label: 'Exam-style Qs',     desc: 'Multi-part, higher-order',       color: '#10b981', action: 'worksheet' },
  { group: 'Worksheets',      id: 'key-terms',         icon: List,          label: 'Key Terms Sheet',   desc: 'Vocabulary & IB definitions',    color: '#f59e0b', action: 'worksheet' },
  { group: 'Worksheets',      id: 'comparison-table',  icon: Table,         label: 'Comparison Table',  desc: 'Compare concepts or theories',   color: '#ec4899', action: 'worksheet' },
  { group: 'Worksheets',      id: 'diagram-labelling', icon: ImageIcon,     label: 'Diagram Labelling', desc: 'Label and identify structures',  color: '#06b6d4', action: 'worksheet' },
  { group: 'Worksheets',      id: 'case-study',        icon: BookOpen,      label: 'Case Study',        desc: 'Stimulus + structured questions',color: '#7c3aed', action: 'worksheet' },
  { group: 'Worksheets',      id: 'essay-plan',        icon: Layout,        label: 'Essay Plan',        desc: 'PEEL structure + IB criteria',   color: '#10b981', action: 'worksheet' },
  { group: 'Worksheets',      id: 'mind-map',          icon: Brain,         label: 'Mind Map',          desc: 'Branched concept overview',      color: '#ec4899', action: 'worksheet' },
  // Video scripts
  { group: 'Video Scripts',   id: 'video-explainer',   icon: Video,         label: 'Topic Explainer',   desc: 'YouTube-style lesson script',    color: '#ef4444', action: 'video' },
  { group: 'Video Scripts',   id: 'video-worked-eg',   icon: Star,          label: 'Worked Examples',   desc: 'Step-by-step solved problems',   color: '#f59e0b', action: 'video' },
  { group: 'Video Scripts',   id: 'video-revision',    icon: RefreshCw,     label: 'Revision Rundown',  desc: 'Fast-paced key points recap',    color: '#06b6d4', action: 'video' },
  { group: 'Video Scripts',   id: 'video-deep-dive',   icon: Brain,         label: 'Deep Dive',         desc: 'In-depth concept exploration',   color: '#7c3aed', action: 'video' },
]

const GROUPS = ['Study Materials', 'Flashcards', 'Worksheets', 'Video Scripts']

const SUGGESTED_QUESTIONS = [
  'Explain the key concepts in this unit',
  'What are the most common exam mistakes?',
  'Give me a worked example',
  'How does this topic appear in Paper 2?',
  'What are the IB command terms I need to know?',
  'Summarise the mark scheme criteria',
]

function WorksheetRenderer({ content }: { content: string }) {
  return (
    <div style={{ fontFamily: "'Courier New', monospace", fontSize: '13px', lineHeight: 1.7, color: '#1e293b' }}>
      {content.split('\n').map((line, i) => {
        if (line.startsWith('━')) return <hr key={i} style={{ border: 'none', borderTop: '2px solid #334155', margin: '12px 0' }} />
        if (line.startsWith('─')) return <hr key={i} style={{ border: 'none', borderTop: '1px dashed #94a3b8', margin: '8px 0' }} />
        if (/^\d+\./.test(line.trim())) return <div key={i} style={{ fontWeight: 700, marginTop: '16px', marginBottom: '4px', color: '#1e3a5f' }}>{line}</div>
        if (/^\((?:a|b|c|d)\)/.test(line.trim())) return <div key={i} style={{ marginLeft: '20px', fontWeight: 600, marginTop: '8px', color: '#1e3a5f' }}>{line}</div>
        if (/\[\d+\]/.test(line)) {
          const parts = line.split(/(\[\d+\])/g)
          return <div key={i} style={{ marginBottom: '4px' }}>{parts.map((p, j) => /^\[\d+\]$/.test(p) ? <span key={j} style={{ fontWeight: 700, fontSize: '11px', marginLeft: '4px', padding: '1px 6px', borderRadius: '4px', background: '#e2e8f0', color: '#475569' }}>{p}</span> : <span key={j}>{p}</span>)}</div>
        }
        if (line.includes('______')) return <div key={i} style={{ borderBottom: '1px solid #94a3b8', height: '22px', marginBottom: '8px' }}>{line.replace(/_{6,}/g, '')}</div>
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) return <div key={i} style={{ marginLeft: '20px', marginBottom: '4px' }}>{line}</div>
        if (!line.trim()) return <div key={i} style={{ height: '8px' }} />
        return <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
      })}
    </div>
  )
}

export default function SubjectWorkspace({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const subjectName = decodeURIComponent(subject)
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  // Studio view state
  const [studioView, setStudioView] = useState<StudioView>('list')
  const [activeGenerating, setActiveGenerating] = useState<string | null>(null)

  // Inline generated content (study materials)
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({})

  // Worksheet state
  const [worksheetContent, setWorksheetContent] = useState<{ id: string; label: string; content: string } | null>(null)
  const [savedWorksheets, setSavedWorksheets] = useState<{ id: string; label: string; content: string }[]>([])

  // Flashcard state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [cardFlipped, setCardFlipped] = useState(false)

  // Video state
  const [videoContent, setVideoContent] = useState<{ id: string; label: string; content: string } | null>(null)

  // Sources state
  const [addingSource, setAddingSource] = useState(false)
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceTitle, setSourceTitle] = useState('')

  // AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // User context
  const [userLevel, setUserLevel] = useState<'SL' | 'HL'>('SL')
  const [weakTopics, setWeakTopics] = useState<string[]>([])

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) {
      const parsed: OnboardingData = JSON.parse(data)
      const subj = parsed.subjects?.find(s => s.name === subjectName)
      if (subj) setUserLevel(subj.level)
      const weak = (parsed.weakTopics || {})[subjectName] || []
      setWeakTopics(weak)
    }
    const baseUnits = DP_UNITS[subjectName] || [
      { name: 'Unit 1', code: 'U1' },
      { name: 'Unit 2', code: 'U2' },
      { name: 'Unit 3', code: 'U3' },
    ]
    setUnits(baseUnits.map(u => ({ ...u, id: u.code, sources: [], weak_topics: [] })))
  }, [subjectName])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const resetStudio = () => {
    setChatMessages([])
    setStudioView('list')
    setWorksheetContent(null)
    setVideoContent(null)
    setFlashcards([])
    setCurrentCard(0)
    setCardFlipped(false)
    setGeneratedContent({})
    setSavedWorksheets([])
  }

  // ── AI Chat ─────────────────────────────────────────────
  const sendChat = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)
    try {
      const systemCtx = `You are an expert IB tutor specialising in ${subjectName} at ${userLevel} level.${selectedUnit ? ` The student is studying: ${selectedUnit.name}.` : ''}${weakTopics.length ? ` Their weak areas: ${weakTopics.join(', ')}.` : ''} Give concise, IB-focused answers using correct command terms and mark scheme language.`
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: systemCtx + '\n\n' + text },
            ...history.slice(-10),
            userMsg,
          ],
        }),
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.content || data.message || 'Sorry, could not generate a response.' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect. Please check your API key.' }])
    } finally {
      setChatLoading(false)
    }
  }

  // ── Unified generate handler ─────────────────────────────
  const handleGenerate = async (item: typeof ALL_GENERATE[0]) => {
    if (!selectedUnit) return
    setActiveGenerating(item.id)

    if (item.action === 'generate') {
      try {
        const res = await fetch('/api/ai/generate-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitName: selectedUnit.name, subjectName, type: item.id, sourceContent: selectedUnit.sources.map(s => s.title).join(', ') || `${subjectName} ${selectedUnit.name}` }),
        })
        const data = await res.json()
        setGeneratedContent(prev => ({ ...prev, [item.id]: data.content || 'No content returned.' }))
      } catch {
        setGeneratedContent(prev => ({ ...prev, [item.id]: 'Failed to generate. Please check your API key.' }))
      }

    } else if (item.action === 'worksheet') {
      try {
        const res = await fetch('/api/ai/generate-worksheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ worksheetType: item.id, subjectName, unitName: selectedUnit.name, level: userLevel, weakTopics }),
        })
        const data = await res.json()
        setWorksheetContent({ id: item.id, label: item.label, content: data.content || 'No content returned.' })
        setStudioView('worksheet')
      } catch {
        setWorksheetContent({ id: item.id, label: item.label, content: 'Failed to generate. Please check your API key.' })
        setStudioView('worksheet')
      }

    } else if (item.action === 'flashcards') {
      setFlashcards([])
      setCurrentCard(0)
      setCardFlipped(false)
      try {
        const res = await fetch('/api/ai/generate-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitName: selectedUnit.name, subjectName, type: 'flashcards', sourceContent: `${subjectName} ${selectedUnit.name} ${userLevel}` }),
        })
        const data = await res.json()
        const raw: string = data.content || ''
        const cards: Flashcard[] = []
        const blocks = raw.split(/\n(?=Q:|FRONT:|Term:)/i)
        blocks.forEach(block => {
          const f = block.match(/(?:Q|FRONT|Term):\s*(.+?)(?:\n|$)/i)
          const b = block.match(/(?:A|BACK|Definition):\s*([\s\S]+?)(?:\n\n|$)/i)
          if (f && b) cards.push({ front: f[1].trim(), back: b[1].trim() })
        })
        if (!cards.length) {
          const lines = raw.split('\n').filter(l => l.trim())
          for (let i = 0; i + 1 < lines.length; i += 2)
            cards.push({ front: lines[i].replace(/^[-*]\s*/, ''), back: lines[i + 1].replace(/^[-*]\s*/, '') })
        }
        setFlashcards(cards.length ? cards : [{ front: 'No flashcards generated', back: 'Try again or check your API key' }])
        setStudioView('flashcards')
      } catch {
        setFlashcards([{ front: 'Error', back: 'Failed to generate. Please check your API key.' }])
        setStudioView('flashcards')
      }

    } else if (item.action === 'video') {
      const videoType = item.id.replace('video-', '')
      try {
        const res = await fetch('/api/ai/generate-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitName: selectedUnit.name, subjectName, type: `video-${videoType}`, sourceContent: `${subjectName} ${selectedUnit.name} ${userLevel}` }),
        })
        const data = await res.json()
        setVideoContent({ id: item.id, label: item.label, content: data.content || 'No content returned.' })
        setStudioView('video')
      } catch {
        setVideoContent({ id: item.id, label: item.label, content: 'Failed to generate. Please check your API key.' })
        setStudioView('video')
      }
    }

    setActiveGenerating(null)
  }

  // ── Sources ──────────────────────────────────────────────
  const addSource = () => {
    if (!selectedUnit || !sourceTitle) return
    const src: Source = { id: Date.now().toString(), title: sourceTitle, type: sourceUrl.startsWith('http') ? 'link' : 'note', created_at: new Date().toISOString() }
    setUnits(prev => prev.map(u => u.id === selectedUnit.id ? { ...u, sources: [...u.sources, src] } : u))
    setSelectedUnit(prev => prev ? { ...prev, sources: [...prev.sources, src] } : prev)
    setSourceUrl(''); setSourceTitle(''); setAddingSource(false)
  }

  const addUnit = () => {
    const u: Unit = { id: Date.now().toString(), name: 'New Unit', code: 'NEW', sources: [], weak_topics: [] }
    setUnits(prev => [...prev, u])
  }

  const saveWorksheet = () => {
    if (!worksheetContent || !selectedUnit) return
    const src: Source = { id: Date.now().toString(), title: `${worksheetContent.label} — ${selectedUnit.name}`, type: 'worksheet', created_at: new Date().toISOString(), content: worksheetContent.content }
    setUnits(prev => prev.map(u => u.id === selectedUnit.id ? { ...u, sources: [...u.sources, src] } : u))
    setSelectedUnit(prev => prev ? { ...prev, sources: [...prev.sources, src] } : prev)
    setSavedWorksheets(prev => [...prev, { id: src.id, label: worksheetContent.label, content: worksheetContent.content }])
  }

  const printWorksheet = () => {
    if (!printRef.current) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><head><title>${worksheetContent?.label || 'Worksheet'}</title><style>body{font-family:'Courier New',monospace;font-size:13px;color:#1e293b;padding:40px;line-height:1.7;}@media print{body{padding:20px;}}</style></head><body>${printRef.current.innerHTML}</body></html>`)
    w.document.close()
    w.print()
  }

  const sourceIcon = (type: Source['type']) => {
    if (type === 'pdf') return <FileType style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
    if (type === 'link') return <Link2 style={{ width: '14px', height: '14px', color: '#06b6d4', flexShrink: 0 }} />
    if (type === 'worksheet') return <PenTool style={{ width: '14px', height: '14px', color: '#7c3aed', flexShrink: 0 }} />
    return <FileText style={{ width: '14px', height: '14px', color: '#7c3aed', flexShrink: 0 }} />
  }

  // ── No unit selected: big folder grid ───────────────────
  if (!selectedUnit) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0f1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0f1120', flexShrink: 0 }}>
            <button onClick={() => router.push('/subjects')} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft style={{ width: '15px', height: '15px' }} /> Back
            </button>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>{subjectName}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}>{userLevel}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '48px 56px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Choose a Unit</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Click any unit to open its AI workspace</p>
                </div>
                <button onClick={addUnit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <Plus style={{ width: '15px', height: '15px' }} /> Add Unit
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {units.map((unit, i) => {
                  const isWeak = weakTopics.some(t => unit.name.toLowerCase().includes(t.toLowerCase()))
                  const accent = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ec4899','#8b5cf6'][i % 6]
                  return (
                    <button key={unit.id} onClick={() => { setSelectedUnit(unit); resetStudio() }} className="card card-hover" style={{ padding: '32px 24px', textAlign: 'center', cursor: 'pointer', borderTop: `3px solid ${accent}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Folder style={{ width: '32px', height: '32px', color: accent }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>{unit.name}</p>
                        {isWeak && <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>Priority</span>}
                        {unit.sources.length > 0 && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{unit.sources.length} source{unit.sources.length !== 1 ? 's' : ''}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // ── Workspace layout ─────────────────────────────────────
  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0f1a' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0f1120', flexShrink: 0 }}>
          <button onClick={() => router.push('/subjects')} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft style={{ width: '15px', height: '15px' }} /> Back
          </button>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{subjectName}</span>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '13px', color: '#a78bfa' }}>{selectedUnit.name}</span>
          <span style={{ marginLeft: 'auto', display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}>{userLevel}</span>
        </div>

        {/* 4-panel layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Panel 1 — Units sidebar */}
          <div style={{ width: '186px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', background: '#0f1120', overflowY: 'auto', padding: '14px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', marginBottom: '10px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Units</p>
              <button onClick={addUnit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <Plus style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
            {units.map(unit => {
              const isSelected = selectedUnit?.id === unit.id
              const isWeak = weakTopics.some(t => unit.name.toLowerCase().includes(t.toLowerCase()))
              return (
                <button key={unit.id} onClick={() => { setSelectedUnit(unit); resetStudio() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, background: isSelected ? 'rgba(124,58,237,0.15)' : 'transparent', color: isSelected ? '#c4b5fd' : 'var(--text-secondary)', border: isSelected ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', marginBottom: '2px' }}>
                  {isSelected ? <FolderOpen style={{ width: '14px', height: '14px', flexShrink: 0 }} /> : <Folder style={{ width: '14px', height: '14px', flexShrink: 0 }} />}
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{unit.name}</span>
                  {isWeak && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>

          {/* Panel 2 — Sources */}
          <div style={{ width: '236px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Sources</h2>
                <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{selectedUnit.sources.length}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ground AI generation with materials</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <button onClick={() => setAddingSource(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Source
              </button>
              {addingSource && (
                <div style={{ padding: '12px', borderRadius: '10px', background: '#161827', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input value={sourceTitle} onChange={e => setSourceTitle(e.target.value)} placeholder="Source title..." className="input-dark" style={{ fontSize: '12px', width: '100%' }} />
                  <input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="URL (optional)..." className="input-dark" style={{ fontSize: '12px', width: '100%' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={addSource} className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '7px' }}>Add</button>
                    <button onClick={() => setAddingSource(false)} className="btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '7px' }}>Cancel</button>
                  </div>
                </div>
              )}
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>SEARCH THE WEB</p>
                <input placeholder="Search IB resources..." className="input-dark" style={{ fontSize: '12px', width: '100%', padding: '7px 10px' }} />
              </div>
              <div style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '10px', padding: '18px', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' }}>
                <Upload style={{ width: '20px', height: '20px', color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Drop PDF here</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>or click to browse</p>
              </div>
              {selectedUnit.sources.map(source => (
                <div key={source.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                  {sourceIcon(source.type)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.title}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{source.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3 — AI Chat (center) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', minWidth: 0 }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>AI Tutor</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subjectName} {userLevel} &middot; {selectedUnit.name}</p>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.15))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <Sparkles style={{ width: '26px', height: '26px', color: '#a78bfa' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Ask anything about {selectedUnit.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '360px', lineHeight: 1.5 }}>Your IB tutor is ready. Ask questions, get explanations, request worked examples, or discuss mark scheme criteria.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '480px', width: '100%' }}>
                    {SUGGESTED_QUESTIONS.map(q => (
                      <button key={q} onClick={() => { setChatInput(q); chatInputRef.current?.focus() }} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, textAlign: 'left', cursor: 'pointer' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px', margin: '0 auto' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'user' ? 'rgba(124,58,237,0.25)' : 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                        {msg.role === 'user' ? <User style={{ width: '13px', height: '13px', color: '#a78bfa' }} /> : <Bot style={{ width: '13px', height: '13px', color: '#fff' }} />}
                      </div>
                      <div style={{ maxWidth: '82%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: msg.role === 'user' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.role === 'user' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.07)'}`, fontSize: '13px', lineHeight: 1.65, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                        <Bot style={{ width: '13px', height: '13px', color: '#fff' }} />
                      </div>
                      <div style={{ padding: '14px 18px', borderRadius: '4px 14px 14px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                        {[0,1,2].map(j => <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', animation: `bounce 1.2s ${j * 0.2}s infinite` }} />)}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '13px', padding: '10px 14px' }}>
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                  placeholder={`Ask about ${selectedUnit.name}...`}
                  rows={1}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', lineHeight: 1.5, resize: 'none', fontFamily: 'inherit', minHeight: '22px', maxHeight: '120px' }}
                />
                <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} style={{ width: '32px', height: '32px', borderRadius: '9px', background: chatInput.trim() ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'rgba(255,255,255,0.05)', border: 'none', cursor: chatInput.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                  <Send style={{ width: '14px', height: '14px', color: chatInput.trim() ? '#fff' : 'var(--text-muted)' }} />
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', textAlign: 'center' }}>Enter to send &middot; Shift+Enter for new line</p>
            </div>
          </div>

          {/* Panel 4 — Studio (unified generate list + artifact views) */}
          <div style={{ width: '310px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0f1120' }}>

            {/* Studio header */}
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {studioView !== 'list' ? (
                <button onClick={() => setStudioView('list')} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <ChevronLeft style={{ width: '14px', height: '14px' }} /> All
                </button>
              ) : (
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Generate</p>
              )}
              {studioView === 'worksheet' && worksheetContent && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={saveWorksheet} style={{ padding: '5px 10px', borderRadius: '7px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Save style={{ width: '11px', height: '11px' }} /> Save
                  </button>
                  <button onClick={printWorksheet} style={{ padding: '5px 10px', borderRadius: '7px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download style={{ width: '11px', height: '11px' }} /> Print
                  </button>
                </div>
              )}
              {studioView === 'flashcards' && flashcards.length > 0 && (
                <button onClick={() => { const item = ALL_GENERATE.find(i => i.action === 'flashcards'); if (item) handleGenerate(item) }} style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw style={{ width: '10px', height: '10px' }} /> New deck
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

              {/* ── LIST VIEW ── */}
              {studioView === 'list' && (
                <div>
                  {GROUPS.map(group => {
                    const items = ALL_GENERATE.filter(i => i.group === group)
                    return (
                      <div key={group} style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '2px' }}>{group}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {items.map(item => {
                            const Icon = item.icon
                            const isGenerating = activeGenerating === item.id
                            return (
                              <div key={item.id}>
                                <button
                                  onClick={() => handleGenerate(item)}
                                  disabled={isGenerating || !!activeGenerating}
                                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: activeGenerating ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s', opacity: (activeGenerating && !isGenerating) ? 0.5 : 1 }}
                                >
                                  <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {isGenerating
                                      ? <Loader2 style={{ width: '14px', height: '14px', color: item.color, animation: 'spin 1s linear infinite' }} />
                                      : <Icon style={{ width: '14px', height: '14px', color: item.color }} />}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, color: '#fff', fontSize: '12px', marginBottom: '1px' }}>{item.label}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</p>
                                  </div>
                                </button>

                                {/* Inline result for study materials */}
                                {item.action === 'generate' && generatedContent[item.id] && (
                                  <div style={{ marginTop: '6px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                      <p style={{ fontSize: '11px', fontWeight: 700, color: item.color }}>{item.label}</p>
                                      <button onClick={() => handleGenerate(item)} style={{ fontSize: '10px', padding: '3px 7px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <RotateCcw style={{ width: '9px', height: '9px' }} /> Redo
                                      </button>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{generatedContent[item.id]}</p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {savedWorksheets.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '2px' }}>Saved Worksheets</p>
                      {savedWorksheets.map(ws => (
                        <button key={ws.id} onClick={() => { setWorksheetContent({ id: '', label: ws.label, content: ws.content }); setStudioView('worksheet') }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', cursor: 'pointer', marginBottom: '6px', textAlign: 'left' }}>
                          <PenTool style={{ width: '13px', height: '13px', color: '#a78bfa', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── WORKSHEET VIEW ── */}
              {studioView === 'worksheet' && worksheetContent && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>{worksheetContent.label} &mdash; {selectedUnit.name}</p>
                  <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <div ref={printRef} style={{ background: '#fff', padding: '16px' }}>
                      <WorksheetRenderer content={worksheetContent.content} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── FLASHCARD VIEW ── */}
              {studioView === 'flashcards' && (
                <div>
                  {flashcards.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Card {currentCard + 1} of {flashcards.length}</p>
                      </div>
                      <button
                        onClick={() => setCardFlipped(f => !f)}
                        style={{ width: '100%', minHeight: '160px', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: cardFlipped ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.12))' : 'rgba(255,255,255,0.04)', border: `1px solid ${cardFlipped ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', transition: 'all 0.25s', textAlign: 'center', marginBottom: '12px' }}
                      >
                        <p style={{ fontSize: '10px', fontWeight: 700, color: cardFlipped ? '#a78bfa' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{cardFlipped ? 'Answer' : 'Question'}</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>{cardFlipped ? flashcards[currentCard]?.back : flashcards[currentCard]?.front}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '14px' }}>Tap to {cardFlipped ? 'see question' : 'reveal answer'}</p>
                      </button>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setCurrentCard(c => Math.max(0, c - 1)); setCardFlipped(false) }} disabled={currentCard === 0} style={{ flex: 1, padding: '10px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: currentCard === 0 ? 'var(--text-muted)' : '#fff', cursor: currentCard === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                          <ChevronLeft style={{ width: '13px', height: '13px' }} /> Prev
                        </button>
                        <button onClick={() => { setCurrentCard(c => Math.min(flashcards.length - 1, c + 1)); setCardFlipped(false) }} disabled={currentCard === flashcards.length - 1} style={{ flex: 1, padding: '10px', borderRadius: '9px', background: currentCard < flashcards.length - 1 ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${currentCard < flashcards.length - 1 ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)'}`, color: currentCard < flashcards.length - 1 ? '#a78bfa' : 'var(--text-muted)', cursor: currentCard < flashcards.length - 1 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                          Next <ChevronRight style={{ width: '13px', height: '13px' }} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Loader2 style={{ width: '28px', height: '28px', color: '#f59e0b', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Generating flashcards...</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── VIDEO VIEW ── */}
              {studioView === 'video' && videoContent && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', marginBottom: '12px' }}>
                    <Video style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{videoContent.label}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedUnit.name} &middot; {userLevel}</p>
                    </div>
                    <button onClick={() => { const item = ALL_GENERATE.find(i => i.id === videoContent.id); if (item) handleGenerate(item) }} style={{ marginLeft: 'auto', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                      <RotateCcw style={{ width: '9px', height: '9px' }} /> Redo
                    </button>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{videoContent.content}</p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
      `}</style>
    </MainLayout>
  )
}

