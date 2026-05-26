'use client'

import { useState, useEffect, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  Upload, FileText, Search, Trash2, BookOpen, Plus, X,
  ChevronDown, FolderOpen, Pencil, Clock, ArrowLeft,
  Save, Play, Eye, EyeOff, PlusCircle, CheckCircle2,
  Timer, Award, Layers, AlignLeft, ChevronUp,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubQuestion {
  id: string
  label: string      // a, b, c, i, ii …
  text: string
  marks: number
  markScheme: string
}

interface Question {
  id: string
  number: number
  text: string
  marks: number
  markScheme: string
  type: 'short' | 'long' | 'structured' | 'mcq'
  subQuestions: SubQuestion[]
  open: boolean      // editor accordion open
  msVisible: boolean // mark-scheme visible in practice
}

interface Section {
  id: string
  title: string
  instructions: string
  questions: Question[]
}

interface PastPaper {
  id: string
  source: 'created' | 'uploaded'
  title: string
  subject: string
  year: number
  session: 'May' | 'November'
  paper: string
  level: 'HL' | 'SL' | ''
  durationMinutes: number
  sections: Section[]
  tags: string[]
  notes: string
  createdAt: string
  // uploaded-only
  fileUrl?: string
  fileName?: string
  fileSize?: number
}

type Mode = 'library' | 'editor' | 'practice'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2)
const YEARS = Array.from({ length: 11 }, (_, i) => 2024 - i)
const SUB_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'i', 'ii', 'iii', 'iv']

function totalMarks(sections: Section[]) {
  return sections.reduce((acc, s) =>
    acc + s.questions.reduce((qa, q) =>
      qa + (q.subQuestions.length
        ? q.subQuestions.reduce((sa, sq) => sa + sq.marks, 0)
        : q.marks), 0), 0)
}

function blankQuestion(number: number): Question {
  return { id: uid(), number, text: '', marks: 4, markScheme: '', type: 'short', subQuestions: [], open: true, msVisible: false }
}

function blankSection(index: number): Section {
  return { id: uid(), title: `Section ${String.fromCharCode(65 + index)}`, instructions: 'Answer all questions.', questions: [blankQuestion(1)] }
}

function blankPaper(): PastPaper {
  return {
    id: uid(), source: 'created', title: '', subject: '',
    year: new Date().getFullYear(), session: 'May', paper: 'Paper 1',
    level: 'HL', durationMinutes: 90, sections: [blankSection(0)],
    tags: [], notes: '', createdAt: new Date().toISOString(),
  }
}

function formatBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [mode, setMode] = useState<Mode>('library')
  const [activePaper, setActivePaper] = useState<PastPaper | null>(null)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // practice timer
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('ib_past_papers_v2')
    if (saved) setPapers(JSON.parse(saved))
  }, [])

  const save = (updated: PastPaper[]) => {
    setPapers(updated)
    localStorage.setItem('ib_past_papers_v2', JSON.stringify(updated))
  }

  // timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const openEditor = (paper?: PastPaper) => {
    setActivePaper(paper ? JSON.parse(JSON.stringify(paper)) : blankPaper())
    setMode('editor')
  }

  const openPractice = (paper: PastPaper) => {
    const reset = JSON.parse(JSON.stringify(paper)) as PastPaper
    reset.sections.forEach(s => s.questions.forEach(q => { q.msVisible = false; q.subQuestions.forEach(sq => {}) }))
    setActivePaper(reset)
    setTimerSeconds(0)
    setTimerRunning(true)
    setMode('practice')
  }

  const savePaper = () => {
    if (!activePaper) return
    const exists = papers.find(p => p.id === activePaper.id)
    const updated = exists
      ? papers.map(p => p.id === activePaper.id ? activePaper : p)
      : [activePaper, ...papers]
    save(updated)
    setMode('library')
  }

  const deletePaper = (id: string) => save(papers.filter(p => p.id !== id))

  const allSubjects = [...new Set(papers.map(p => p.subject).filter(Boolean))].sort()

  const filtered = papers.filter(p => {
    const q = search.toLowerCase()
    return (!q || p.title.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q))
      && (!filterSubject || p.subject === filterSubject)
  })

  const grouped = filtered.reduce<Record<string, PastPaper[]>>((acc, p) => {
    const k = p.subject || 'Uncategorised'
    if (!acc[k]) acc[k] = []
    acc[k].push(p)
    return acc
  }, {})

  // ─── LIBRARY ───────────────────────────────────────────────────────────────
  if (mode === 'library') return (
    <MainLayout>
      <Header title="Past Papers" subtitle="Create, organise & practise" />
      <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Top CTA row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <button
            onClick={() => openEditor()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Create Paper
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: 13, cursor: 'pointer' }}
          >
            <Upload style={{ width: 14, height: 14 }} /> Upload PDF
          </button>

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e2a3a', borderRadius: 10, padding: '0 12px', border: '1px solid rgba(255,255,255,0.07)', minWidth: 200 }}>
            <Search style={{ width: 13, height: 13, color: '#475569', flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers…" style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 13, flex: 1, padding: '9px 0' }} />
          </div>

          {allSubjects.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                style={{ appearance: 'none', background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: filterSubject ? 'white' : '#475569', fontSize: 12, padding: '8px 28px 8px 10px', cursor: 'pointer', outline: 'none' }}>
                <option value="">All Subjects</option>
                {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown style={{ width: 12, height: 12, color: '#475569', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          )}
        </div>

        {/* Empty state */}
        {papers.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Layers style={{ width: 32, height: 32, color: '#7c3aed' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 10 }}>Build your first paper</h3>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 340, lineHeight: 1.7, marginBottom: 28 }}>
              Create custom IB-style papers with questions, mark schemes, and timed practice — or upload existing PDFs to your library.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => openEditor()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                <Plus style={{ width: 16, height: 16 }} /> Create Paper
              </button>
              <button onClick={() => setShowUploadModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: 13, cursor: 'pointer' }}>
                <Upload style={{ width: 14, height: 14 }} /> Upload PDF
              </button>
            </div>
          </div>
        )}

        {/* Grouped paper list */}
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([subject, subPapers]) => (
          <div key={subject} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FolderOpen style={{ width: 14, height: 14, color: '#7c3aed' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{subject}</span>
              <span style={{ fontSize: 11, color: '#2d3748' }}>({subPapers.length})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
              {subPapers.map(p => (
                <PaperCard
                  key={p.id}
                  paper={p}
                  onEdit={() => openEditor(p)}
                  onPractice={() => openPractice(p)}
                  onDelete={() => deletePaper(p.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSave={p => { save([p, ...papers]); setShowUploadModal(false) }}
        />
      )}
    </MainLayout>
  )

  // ─── EDITOR ────────────────────────────────────────────────────────────────
  if (mode === 'editor' && activePaper) return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Editor top bar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12, background: '#0f1120', flexShrink: 0 }}>
          <button onClick={() => setMode('library')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 13, height: 13 }} /> Library
          </button>
          <input
            value={activePaper.title}
            onChange={e => setActivePaper(p => p ? { ...p, title: e.target.value } : p)}
            placeholder="Paper title…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 15, fontWeight: 600 }}
          />
          <span style={{ fontSize: 12, color: '#334155' }}>{totalMarks(activePaper.sections)} marks total</span>
          <button
            onClick={savePaper}
            disabled={!activePaper.title || !activePaper.subject}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: !activePaper.title || !activePaper.subject ? '#1e2a3a' : 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: !activePaper.title || !activePaper.subject ? '#475569' : 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: !activePaper.title || !activePaper.subject ? 'not-allowed' : 'pointer' }}
          >
            <Save style={{ width: 14, height: 14 }} /> Save Paper
          </button>
        </div>

        {/* Meta row */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d0f1a', display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
          {[
            { label: 'Subject *', node: <input value={activePaper.subject} onChange={e => setActivePaper(p => p ? { ...p, subject: e.target.value } : p)} placeholder="e.g. Physics" style={metaInput} /> },
            {
              label: 'Paper', node: (
                <select value={activePaper.paper} onChange={e => setActivePaper(p => p ? { ...p, paper: e.target.value } : p)} style={metaInput}>
                  {['Paper 1', 'Paper 2', 'Paper 3', 'IA Sample', 'EE', 'TOK', 'Mock', 'Custom'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )
            },
            {
              label: 'Level', node: (
                <select value={activePaper.level} onChange={e => setActivePaper(p => p ? { ...p, level: e.target.value as 'HL' | 'SL' | '' } : p)} style={metaInput}>
                  <option value="HL">HL</option><option value="SL">SL</option><option value="">—</option>
                </select>
              )
            },
            {
              label: 'Year', node: (
                <select value={activePaper.year} onChange={e => setActivePaper(p => p ? { ...p, year: Number(e.target.value) } : p)} style={metaInput}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              )
            },
            {
              label: 'Session', node: (
                <select value={activePaper.session} onChange={e => setActivePaper(p => p ? { ...p, session: e.target.value as 'May' | 'November' } : p)} style={metaInput}>
                  <option value="May">May</option><option value="November">November</option>
                </select>
              )
            },
            {
              label: 'Duration (min)', node: (
                <input type="number" value={activePaper.durationMinutes} onChange={e => setActivePaper(p => p ? { ...p, durationMinutes: Number(e.target.value) } : p)} style={{ ...metaInput, width: 80 }} />
              )
            },
          ].map(({ label, node }) => (
            <div key={label}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
              {node}
            </div>
          ))}
        </div>

        {/* Sections editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {activePaper.sections.map((section, si) => (
            <SectionEditor
              key={section.id}
              section={section}
              sectionIndex={si}
              totalSections={activePaper.sections.length}
              onChange={updated => setActivePaper(p => {
                if (!p) return p
                const sections = [...p.sections]
                sections[si] = updated
                return { ...p, sections }
              })}
              onDelete={() => setActivePaper(p => {
                if (!p) return p
                return { ...p, sections: p.sections.filter((_, i) => i !== si) }
              })}
            />
          ))}

          <button
            onClick={() => setActivePaper(p => {
              if (!p) return p
              return { ...p, sections: [...p.sections, blankSection(p.sections.length)] }
            })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'rgba(124,58,237,0.07)', border: '2px dashed rgba(124,58,237,0.25)', color: '#7c3aed', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            <PlusCircle style={{ width: 16, height: 16 }} /> Add Section
          </button>
        </div>
      </div>
    </MainLayout>
  )

  // ─── PRACTICE MODE ────────────────────────────────────────────────────────
  if (mode === 'practice' && activePaper) return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Practice bar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12, background: '#0f1120', flexShrink: 0 }}>
          <button onClick={() => { setTimerRunning(false); setMode('library') }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 13, height: 13 }} /> Exit
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{activePaper.title}</p>
            <p style={{ fontSize: 11, color: '#64748b' }}>{activePaper.subject} · {activePaper.paper} · {activePaper.level} · {totalMarks(activePaper.sections)} marks</p>
          </div>
          {/* Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 10, background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Timer style={{ width: 14, height: 14, color: timerRunning ? '#10b981' : '#475569' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: timerRunning ? '#10b981' : '#94a3b8', minWidth: 52 }}>{formatTime(timerSeconds)}</span>
            <button onClick={() => setTimerRunning(r => !r)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '2px 4px', fontSize: 11 }}>
              {timerRunning ? '⏸' : '▶'}
            </button>
            <button onClick={() => { setTimerSeconds(0); setTimerRunning(false) }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 10 }}>↺</button>
          </div>
          <button
            onClick={() => setActivePaper(p => {
              if (!p) return p
              const ap = JSON.parse(JSON.stringify(p)) as PastPaper
              ap.sections.forEach(s => s.questions.forEach(q => { q.msVisible = true }))
              return ap
            })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <Eye style={{ width: 13, height: 13 }} /> Show All Answers
          </button>
        </div>

        {/* Questions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', maxWidth: 820, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 24, padding: '14px 20px', borderRadius: 12, background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <p style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>
              {activePaper.title} &nbsp;·&nbsp; {activePaper.durationMinutes} min &nbsp;·&nbsp; {totalMarks(activePaper.sections)} marks
            </p>
          </div>

          {activePaper.sections.map((section, si) => (
            <div key={section.id} style={{ marginBottom: 36 }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>{section.title}</h2>
                {section.instructions && <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>{section.instructions}</p>}
              </div>

              {section.questions.map((q, qi) => (
                <PracticeQuestion
                  key={q.id}
                  question={q}
                  onChange={updated => setActivePaper(p => {
                    if (!p) return p
                    const ap = JSON.parse(JSON.stringify(p)) as PastPaper
                    ap.sections[si].questions[qi] = updated
                    return ap
                  })}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )

  return null
}

// ─── Section Editor ───────────────────────────────────────────────────────────

function SectionEditor({ section, sectionIndex, totalSections, onChange, onDelete }: {
  section: Section
  sectionIndex: number
  totalSections: number
  onChange: (s: Section) => void
  onDelete: () => void
}) {
  const updateQuestion = (qi: number, q: Question) => {
    const questions = [...section.questions]
    questions[qi] = q
    onChange({ ...section, questions })
  }

  const addQuestion = () => {
    const num = section.questions.length + 1
    onChange({ ...section, questions: [...section.questions, blankQuestion(num)] })
  }

  const deleteQuestion = (qi: number) => {
    const questions = section.questions.filter((_, i) => i !== qi).map((q, i) => ({ ...q, number: i + 1 }))
    onChange({ ...section, questions })
  }

  return (
    <div style={{ marginBottom: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      {/* Section header */}
      <div style={{ padding: '14px 20px', background: '#161827', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <input
          value={section.title}
          onChange={e => onChange({ ...section, title: e.target.value })}
          style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 14, fontWeight: 700, flex: 1 }}
          placeholder="Section name…"
        />
        <input
          value={section.instructions}
          onChange={e => onChange({ ...section, instructions: e.target.value })}
          style={{ background: 'none', border: 'none', outline: 'none', color: '#64748b', fontSize: 12, flex: 2 }}
          placeholder="Instructions for this section…"
        />
        <span style={{ fontSize: 11, color: '#334155', flexShrink: 0 }}>
          {section.questions.reduce((a, q) => a + (q.subQuestions.length ? q.subQuestions.reduce((b, sq) => b + sq.marks, 0) : q.marks), 0)} marks
        </span>
        {totalSections > 1 && (
          <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: 4 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>

      {/* Questions */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {section.questions.map((q, qi) => (
          <QuestionEditor
            key={q.id}
            question={q}
            onChange={updated => updateQuestion(qi, updated)}
            onDelete={() => deleteQuestion(qi)}
            canDelete={section.questions.length > 1}
          />
        ))}
        <button
          onClick={addQuestion}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(124,58,237,0.06)', border: '1px dashed rgba(124,58,237,0.2)', color: '#7c3aed', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus style={{ width: 13, height: 13 }} /> Add Question
        </button>
      </div>
    </div>
  )
}

// ─── Question Editor ──────────────────────────────────────────────────────────

function QuestionEditor({ question, onChange, onDelete, canDelete }: {
  question: Question
  onChange: (q: Question) => void
  onDelete: () => void
  canDelete: boolean
}) {
  const hasSubQ = question.subQuestions.length > 0

  const addSubQ = () => {
    const label = SUB_LABELS[question.subQuestions.length] || String(question.subQuestions.length + 1)
    onChange({
      ...question,
      subQuestions: [...question.subQuestions, { id: uid(), label, text: '', marks: 2, markScheme: '' }],
    })
  }

  const updateSubQ = (i: number, sq: SubQuestion) => {
    const subs = [...question.subQuestions]
    subs[i] = sq
    onChange({ ...question, subQuestions: subs })
  }

  const deleteSubQ = (i: number) => {
    onChange({ ...question, subQuestions: question.subQuestions.filter((_, idx) => idx !== i) })
  }

  const totalQ = hasSubQ
    ? question.subQuestions.reduce((a, sq) => a + sq.marks, 0)
    : question.marks

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${question.open ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`, background: question.open ? 'rgba(124,58,237,0.04)' : '#0f1120', overflow: 'hidden', transition: 'all 0.15s' }}>
      {/* Question header row */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', width: 24, flexShrink: 0, paddingTop: 2 }}>Q{question.number}</span>

        <textarea
          value={question.text}
          onChange={e => onChange({ ...question, text: e.target.value })}
          placeholder="Question text… (what does the student need to answer?)"
          rows={question.open ? 2 : 1}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 13, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Marks (only shown if no sub-questions) */}
          {!hasSubQ && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1e2a3a', borderRadius: 8, padding: '4px 8px' }}>
              <input
                type="number"
                value={question.marks}
                min={1}
                max={30}
                onChange={e => onChange({ ...question, marks: Number(e.target.value) })}
                style={{ width: 36, background: 'none', border: 'none', outline: 'none', color: '#a78bfa', fontSize: 13, fontWeight: 700, textAlign: 'center' }}
              />
              <span style={{ fontSize: 10, color: '#475569' }}>pts</span>
            </div>
          )}
          {hasSubQ && (
            <span style={{ fontSize: 11, color: '#64748b', background: '#1e2a3a', padding: '4px 8px', borderRadius: 8 }}>{totalQ} pts</span>
          )}

          <button
            onClick={() => onChange({ ...question, open: !question.open })}
            style={{ padding: '4px 8px', borderRadius: 8, background: '#1e2a3a', border: 'none', color: '#475569', cursor: 'pointer' }}
          >
            {question.open ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
          </button>

          {canDelete && (
            <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: 4 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
              <Trash2 style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded body */}
      {question.open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>

          {/* Mark scheme (if no sub-questions) */}
          {!hasSubQ && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Mark Scheme</p>
              <textarea
                value={question.markScheme}
                onChange={e => onChange({ ...question, markScheme: e.target.value })}
                placeholder="Expected answer / marking points… (e.g. • 1 mark for stating Newton's first law ✓)"
                rows={3}
                style={{ width: '100%', background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#94a3b8', fontSize: 12, padding: '9px 12px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, fontFamily: 'inherit' }}
              />
            </div>
          )}

          {/* Sub-questions */}
          {hasSubQ && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {question.subQuestions.map((sq, i) => (
                <div key={sq.id} style={{ background: '#1e2a3a', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <input
                      value={sq.label}
                      onChange={e => updateSubQ(i, { ...sq, label: e.target.value })}
                      style={{ width: 24, background: 'none', border: 'none', outline: 'none', color: '#7c3aed', fontSize: 12, fontWeight: 700 }}
                    />
                    <textarea
                      value={sq.text}
                      onChange={e => updateSubQ(i, { ...sq, text: e.target.value })}
                      placeholder="Sub-question text…"
                      rows={1}
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 12, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        value={sq.marks}
                        min={1}
                        max={20}
                        onChange={e => updateSubQ(i, { ...sq, marks: Number(e.target.value) })}
                        style={{ width: 34, background: 'none', border: 'none', outline: 'none', color: '#a78bfa', fontSize: 12, fontWeight: 700, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 10, color: '#475569' }}>pts</span>
                      <button onClick={() => deleteSubQ(i)} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: 2 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
                        <X style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={sq.markScheme}
                    onChange={e => updateSubQ(i, { ...sq, markScheme: e.target.value })}
                    placeholder="Mark scheme for this part…"
                    rows={2}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, color: '#64748b', fontSize: 11, padding: '7px 10px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={addSubQ}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#a78bfa', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus style={{ width: 11, height: 11 }} /> Add Part ({question.subQuestions.length === 0 ? 'a' : SUB_LABELS[question.subQuestions.length] || '+'})
            </button>
            {hasSubQ && (
              <button
                onClick={() => onChange({ ...question, subQuestions: [] })}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.12)', color: '#f87171', fontSize: 11, cursor: 'pointer' }}
              >
                <X style={{ width: 11, height: 11 }} /> Remove Parts
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Practice Question ────────────────────────────────────────────────────────

function PracticeQuestion({ question, onChange }: { question: Question; onChange: (q: Question) => void }) {
  const hasSubQ = question.subQuestions.length > 0
  const totalQ = hasSubQ
    ? question.subQuestions.reduce((a, sq) => a + sq.marks, 0)
    : question.marks

  return (
    <div style={{ marginBottom: 28, padding: '20px 24px', borderRadius: 14, background: '#161827', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', flexShrink: 0 }}>{question.number}.</span>
          <p style={{ fontSize: 14, color: 'white', lineHeight: 1.7, flex: 1 }}>{question.text || <span style={{ color: '#334155', fontStyle: 'italic' }}>No question text</span>}</p>
        </div>
        <span style={{ fontSize: 12, color: '#475569', flexShrink: 0, marginLeft: 12 }}>[{totalQ} marks]</span>
      </div>

      {hasSubQ ? (
        <div style={{ paddingLeft: 24 }}>
          {question.subQuestions.map((sq, i) => (
            <div key={sq.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', width: 20, flexShrink: 0 }}>({sq.label})</span>
                <p style={{ fontSize: 13, color: 'white', lineHeight: 1.6, flex: 1 }}>{sq.text}</p>
                <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>[{sq.marks}]</span>
              </div>
              {sq.markScheme && (
                <MarkSchemeToggle markScheme={sq.markScheme} />
              )}
            </div>
          ))}
        </div>
      ) : (
        question.markScheme && (
          <div style={{ marginTop: 4 }}>
            <button
              onClick={() => onChange({ ...question, msVisible: !question.msVisible })}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: question.msVisible ? 'rgba(245,158,11,0.1)' : '#1e2a3a', border: `1px solid ${question.msVisible ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`, color: question.msVisible ? '#fbbf24' : '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >
              {question.msVisible ? <EyeOff style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
              {question.msVisible ? 'Hide Mark Scheme' : 'Show Mark Scheme'}
            </button>
            {question.msVisible && (
              <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <p style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mark Scheme</p>
                <p style={{ fontSize: 13, color: '#d97706', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{question.markScheme}</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}

function MarkSchemeToggle({ markScheme }: { markScheme: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginLeft: 28, marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, background: open ? 'rgba(245,158,11,0.1)' : '#1e2a3a', border: `1px solid ${open ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}`, color: open ? '#fbbf24' : '#475569', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
      >
        {open ? <EyeOff style={{ width: 10, height: 10 }} /> : <Eye style={{ width: 10, height: 10 }} />}
        {open ? 'Hide Answer' : 'Show Answer'}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
          <p style={{ fontSize: 12, color: '#d97706', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{markScheme}</p>
        </div>
      )}
    </div>
  )
}

// ─── Paper Card ───────────────────────────────────────────────────────────────

function PaperCard({ paper, onEdit, onPractice, onDelete }: {
  paper: PastPaper; onEdit: () => void; onPractice: () => void; onDelete: () => void
}) {
  const marks = paper.source === 'created' ? totalMarks(paper.sections) : null
  const qCount = paper.source === 'created'
    ? paper.sections.reduce((a, s) => a + s.questions.length, 0)
    : null

  return (
    <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: '#161827', overflow: 'hidden' }}>
      {/* Top color bar */}
      <div style={{ height: 3, background: paper.source === 'created' ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : '#ef4444' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3, lineHeight: 1.3 }}>{paper.title || 'Untitled Paper'}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {paper.level && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 5, background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{paper.level}</span>}
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 5, background: '#1e2a3a', color: '#64748b' }}>{paper.paper}</span>
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 5, background: '#1e2a3a', color: '#64748b' }}>{paper.session} {paper.year}</span>
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 5, background: paper.source === 'created' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: paper.source === 'created' ? '#10b981' : '#f87171' }}>
                {paper.source === 'created' ? 'Created' : 'Uploaded'}
              </span>
            </div>
          </div>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: 4, flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {paper.source === 'created' && (
          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Award style={{ width: 12, height: 12, color: '#7c3aed' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{marks} marks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlignLeft style={{ width: 12, height: 12, color: '#7c3aed' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{qCount} questions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock style={{ width: 12, height: 12, color: '#7c3aed' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{paper.durationMinutes} min</span>
            </div>
          </div>
        )}

        {paper.source === 'uploaded' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText style={{ width: 12, height: 12, color: '#f87171' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{paper.fileName}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {paper.source === 'created' ? (
            <>
              <button onClick={onPractice} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <Play style={{ width: 12, height: 12 }} /> Practice
              </button>
              <button onClick={onEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 9, background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, cursor: 'pointer' }}>
                <Pencil style={{ width: 12, height: 12 }} /> Edit
              </button>
            </>
          ) : (
            <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 9, background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>
              <BookOpen style={{ width: 12, height: 12 }} /> Open PDF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onSave }: { onClose: () => void; onSave: (p: PastPaper) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '', subject: '', year: new Date().getFullYear(),
    session: 'May' as 'May' | 'November', paper: 'Paper 1', level: 'HL' as 'HL' | 'SL' | '', notes: '',
  })

  const handleFile = (file: File) => {
    setPendingFile(file)
    setForm(f => ({ ...f, title: file.name.replace('.pdf', '') }))
  }

  const submit = () => {
    if (!form.title || !form.subject) return
    const p: PastPaper = {
      id: uid(), source: 'uploaded',
      title: form.title, subject: form.subject,
      year: form.year, session: form.session, paper: form.paper,
      level: form.level, durationMinutes: 90,
      sections: [], tags: [], notes: form.notes,
      createdAt: new Date().toISOString(),
      fileUrl: pendingFile ? URL.createObjectURL(pendingFile) : '',
      fileName: pendingFile?.name || '',
      fileSize: pendingFile?.size || 0,
    }
    onSave(p)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#161827', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>Upload PDF Paper</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!pendingFile ? (
            <div onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed rgba(124,58,237,0.3)', borderRadius: 12, padding: 28, textAlign: 'center', cursor: 'pointer', background: 'rgba(124,58,237,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.04)')}>
              <Upload style={{ width: 24, height: 24, color: '#7c3aed', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Click to select a PDF</p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, background: '#1e2a3a' }}>
              <FileText style={{ width: 18, height: 18, color: '#a78bfa', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFile.name}</span>
              <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X style={{ width: 13, height: 13 }} /></button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chemistry HL Paper 2 May 2023" style={inputSt} />
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Chemistry" style={inputSt} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Year</label>
              <select value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} style={inputSt}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Session</label>
              <select value={form.session} onChange={e => setForm(f => ({ ...f, session: e.target.value as 'May' | 'November' }))} style={inputSt}>
                <option value="May">May</option><option value="November">November</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Level</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as 'HL' | 'SL' | '' }))} style={inputSt}>
                <option value="HL">HL</option><option value="SL">SL</option><option value="">—</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button onClick={submit} disabled={!form.title || !form.subject}
              style={{ flex: 1, padding: '10px', borderRadius: 10, background: !form.title || !form.subject ? '#1e2a3a' : 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: !form.title || !form.subject ? '#475569' : 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: !form.title || !form.subject ? 'not-allowed' : 'pointer' }}>
              Save to Library
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const metaInput: React.CSSProperties = {
  background: '#1e2a3a',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 8,
  color: 'white',
  fontSize: 12,
  padding: '7px 10px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const inputSt: React.CSSProperties = {
  width: '100%',
  background: '#1e2a3a',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 8,
  color: 'white',
  fontSize: 13,
  padding: '9px 12px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 5,
}
