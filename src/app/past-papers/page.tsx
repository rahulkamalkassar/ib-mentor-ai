'use client'

import { useState, useEffect, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  Upload, FileText, Search, Filter, Trash2, Download,
  BookOpen, Calendar, Tag, Plus, X, ChevronDown, FolderOpen,
} from 'lucide-react'

interface PastPaper {
  id: string
  title: string
  subject: string
  year: number
  session: 'May' | 'November'
  paper: string
  level: 'HL' | 'SL' | ''
  tags: string[]
  fileUrl: string
  fileName: string
  fileSize: number
  uploadedAt: string
  notes: string
}

const SESSIONS = ['May', 'November'] as const
const YEARS = Array.from({ length: 11 }, (_, i) => 2024 - i)

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function PastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterSession, setFilterSession] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload form state
  const [form, setForm] = useState({ title: '', subject: '', year: new Date().getFullYear(), session: 'May' as 'May' | 'November', paper: 'Paper 1', level: '' as 'HL' | 'SL' | '', tags: '', notes: '' })
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('ib_past_papers')
    if (saved) setPapers(JSON.parse(saved))
  }, [])

  const save = (updated: PastPaper[]) => {
    setPapers(updated)
    localStorage.setItem('ib_past_papers', JSON.stringify(updated))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setPendingFile(file)
      setForm(f => ({ ...f, title: file.name.replace('.pdf', '') }))
      setShowUpload(true)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
      setForm(f => ({ ...f, title: file.name.replace('.pdf', '') }))
      setShowUpload(true)
    }
  }

  const submitUpload = () => {
    if (!pendingFile || !form.title || !form.subject) return
    const url = URL.createObjectURL(pendingFile)
    const paper: PastPaper = {
      id: Date.now().toString(),
      title: form.title,
      subject: form.subject,
      year: form.year,
      session: form.session,
      paper: form.paper,
      level: form.level,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      fileUrl: url,
      fileName: pendingFile.name,
      fileSize: pendingFile.size,
      uploadedAt: new Date().toISOString(),
      notes: form.notes,
    }
    save([paper, ...papers])
    setShowUpload(false)
    setPendingFile(null)
    setForm({ title: '', subject: '', year: new Date().getFullYear(), session: 'May', paper: 'Paper 1', level: '', tags: '', notes: '' })
  }

  const deletePaper = (id: string) => {
    if (selectedPaper?.id === id) setSelectedPaper(null)
    save(papers.filter(p => p.id !== id))
  }

  const allSubjects = [...new Set(papers.map(p => p.subject))].sort()

  const filtered = papers.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.subject.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchSubject = !filterSubject || p.subject === filterSubject
    const matchYear = !filterYear || p.year === Number(filterYear)
    const matchSession = !filterSession || p.session === filterSession
    return matchSearch && matchSubject && matchYear && matchSession
  })

  const grouped = filtered.reduce<Record<string, PastPaper[]>>((acc, p) => {
    const key = p.subject || 'Uncategorised'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <MainLayout>
      <Header title="Past Papers" subtitle="Your personal IB paper library" />

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

        {/* Left: library list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', background: '#1e2a3a', borderRadius: '10px', padding: '0 12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Search style={{ width: 14, height: 14, color: '#475569', flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers..." style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '13px', flex: 1, padding: '9px 0' }} />
            </div>

            {/* Filters */}
            <Select value={filterSubject} onChange={setFilterSubject} options={allSubjects} placeholder="All Subjects" />
            <Select value={filterYear} onChange={setFilterYear} options={YEARS.map(String)} placeholder="All Years" />
            <Select value={filterSession} onChange={setFilterSession} options={[...SESSIONS]} placeholder="Any Session" />

            {filterSubject || filterYear || filterSession ? (
              <button onClick={() => { setFilterSubject(''); setFilterYear(''); setFilterSession('') }} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <X style={{ width: 12, height: 12 }} /> Clear
              </button>
            ) : null}

            {/* Upload button */}
            <button
              onClick={() => { setPendingFile(null); setShowUpload(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 14px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <Plus style={{ width: 15, height: 15 }} /> Add Paper
            </button>
          </div>

          {/* Drop zone + list */}
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {dragging && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(124,58,237,0.12)', border: '2px dashed #7c3aed', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ textAlign: 'center' }}>
                  <Upload style={{ width: 40, height: 40, color: '#a78bfa', margin: '0 auto 12px' }} />
                  <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: '16px' }}>Drop PDF to add to library</p>
                </div>
              </div>
            )}

            {papers.length === 0 ? (
              <EmptyState onUpload={() => { setPendingFile(null); setShowUpload(true) }} onFilePick={() => fileInputRef.current?.click()} />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
                <Filter style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
                <p>No papers match your filters</p>
              </div>
            ) : (
              Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([subject, subPapers]) => (
                <div key={subject} style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <FolderOpen style={{ width: 15, height: 15, color: '#7c3aed' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{subject}</span>
                    <span style={{ fontSize: '11px', color: '#334155' }}>({subPapers.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {subPapers.map(p => (
                      <PaperRow
                        key={p.id}
                        paper={p}
                        selected={selectedPaper?.id === p.id}
                        onClick={() => setSelectedPaper(selectedPaper?.id === p.id ? null : p)}
                        onDelete={() => deletePaper(p.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: preview panel */}
        {selectedPaper && (
          <div style={{ width: '420px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Paper Details</span>
              <button onClick={() => setSelectedPaper(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText style={{ width: 22, height: 22, color: '#a78bfa' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'white', fontSize: '14px', lineHeight: 1.3 }}>{selectedPaper.title}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{selectedPaper.fileName} · {formatBytes(selectedPaper.fileSize)}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <Detail label="Subject" value={selectedPaper.subject} />
                <Detail label="Year" value={String(selectedPaper.year)} />
                <Detail label="Session" value={selectedPaper.session} />
                <Detail label="Paper" value={selectedPaper.paper} />
                {selectedPaper.level && <Detail label="Level" value={selectedPaper.level} />}
                <Detail label="Added" value={new Date(selectedPaper.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </div>

              {selectedPaper.tags.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Tags</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedPaper.tags.map(t => (
                      <span key={t} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: 'rgba(124,58,237,0.12)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPaper.notes && (
                <div style={{ padding: '12px', borderRadius: '10px', background: '#1e2a3a', marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{selectedPaper.notes}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <a
                  href={selectedPaper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                >
                  <BookOpen style={{ width: 14, height: 14 }} /> Open PDF
                </a>
                <a
                  href={selectedPaper.fileUrl}
                  download={selectedPaper.fileName}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', textDecoration: 'none' }}
                >
                  <Download style={{ width: 14, height: 14 }} />
                </a>
                <button
                  onClick={() => deletePaper(selectedPaper.id)}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={e => { if (e.target === e.currentTarget) setShowUpload(false) }}>
          <div style={{ width: '100%', maxWidth: '520px', background: '#161827', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>Add Past Paper</span>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* File drop area */}
              {!pendingFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: '2px dashed rgba(124,58,237,0.3)', borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: 'pointer', background: 'rgba(124,58,237,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.04)')}
                >
                  <Upload style={{ width: 24, height: 24, color: '#7c3aed', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>Click to select a PDF, or drag & drop</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: '#1e2a3a' }}>
                  <FileText style={{ width: 20, height: 20, color: '#a78bfa', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFile.name}</span>
                  <span style={{ fontSize: '11px', color: '#475569', flexShrink: 0 }}>{formatBytes(pendingFile.size)}</span>
                  <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X style={{ width: 14, height: 14 }} /></button>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileSelect} />

              <FormField label="Title" required>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mathematics HL Paper 1 May 2023" style={inputStyle} />
              </FormField>

              <FormField label="Subject" required>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Physics" style={inputStyle} />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <FormField label="Year">
                  <select value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} style={inputStyle}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </FormField>
                <FormField label="Session">
                  <select value={form.session} onChange={e => setForm(f => ({ ...f, session: e.target.value as 'May' | 'November' }))} style={inputStyle}>
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label="Level">
                  <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as 'HL' | 'SL' | '' }))} style={inputStyle}>
                    <option value="">Any</option>
                    <option value="HL">HL</option>
                    <option value="SL">SL</option>
                  </select>
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FormField label="Paper">
                  <select value={form.paper} onChange={e => setForm(f => ({ ...f, paper: e.target.value }))} style={inputStyle}>
                    {['Paper 1', 'Paper 2', 'Paper 3', 'IA', 'EE', 'TOK Essay', 'Other'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FormField>
                <FormField label="Tags (comma separated)">
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. calculus, hard, done" style={inputStyle} />
                </FormField>
              </div>

              <FormField label="Notes">
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this paper..." rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </FormField>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowUpload(false)} style={{ flex: 1, padding: '11px', borderRadius: '10px', background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button
                  onClick={submitUpload}
                  disabled={!form.title || !form.subject}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', background: !form.title || !form.subject ? '#1e2a3a' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: !form.title || !form.subject ? '#475569' : 'white', border: 'none', fontSize: '13px', fontWeight: 700, cursor: !form.title || !form.subject ? 'not-allowed' : 'pointer' }}
                >
                  Add to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

function PaperRow({ paper, selected, onClick, onDelete }: { paper: PastPaper; selected: boolean; onClick: () => void; onDelete: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: selected ? 'rgba(124,58,237,0.12)' : '#161827', border: selected ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
    >
      <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FileText style={{ width: 16, height: 16, color: '#f87171' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paper.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{paper.year} · {paper.session}</span>
          {paper.level && <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{paper.level}</span>}
          <span style={{ fontSize: '11px', color: '#475569' }}>{paper.paper}</span>
        </div>
      </div>
      {paper.tags.slice(0, 2).map(t => (
        <span key={t} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '5px', background: '#1e2a3a', color: '#64748b', flexShrink: 0 }}>{t}</span>
      ))}
      <span style={{ fontSize: '11px', color: '#334155', flexShrink: 0 }}>{formatBytes(paper.fileSize)}</span>
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
        onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
      >
        <Trash2 style={{ width: 13, height: 13 }} />
      </button>
    </div>
  )
}

function EmptyState({ onUpload, onFilePick }: { onUpload: () => void; onFilePick: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <BookOpen style={{ width: 28, height: 28, color: '#7c3aed' }} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>No past papers yet</h3>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '320px', lineHeight: 1.6, marginBottom: '24px' }}>
        Upload your IB past papers to build your personal library. Organise by subject, year, and session.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onFilePick} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Upload style={{ width: 15, height: 15 }} /> Upload PDF
        </button>
        <button onClick={onUpload} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', fontSize: '13px', cursor: 'pointer' }}>
          <Plus style={{ width: 15, height: 15 }} /> Add Manually
        </button>
      </div>
    </div>
  )
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ appearance: 'none', background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: value ? 'white' : '#475569', fontSize: '12px', padding: '8px 28px 8px 10px', cursor: 'pointer', outline: 'none' }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown style={{ width: 12, height: 12, color: '#475569', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  )
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
        {label}{required && <span style={{ color: '#7c3aed' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#1e2a3a', borderRadius: '8px', padding: '10px 12px' }}>
      <p style={{ fontSize: '10px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>{value}</p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1e2a3a',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '13px',
  padding: '9px 12px',
  outline: 'none',
  boxSizing: 'border-box',
}
