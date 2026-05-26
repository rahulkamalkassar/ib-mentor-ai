'use client'

import { useState, useRef, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { Send, Scroll, ChevronDown, Sparkles, Bot, RotateCcw, BookOpen, FileText, CheckCircle } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const SUBJECTS = [
  'Mathematics: Analysis and Approaches',
  'Physics', 'Chemistry', 'Biology',
  'Economics', 'History', 'Geography', 'Psychology',
  'English A: Literature', 'English A: Language and Literature',
  'Computer Science', 'Business Management',
  'Visual Arts', 'Music', 'Theatre',
]

const CATEGORIES = [
  { label: 'Research Question', prompt: 'Help me craft and refine my Extended Essay research question.' },
  { label: 'Outline & Structure', prompt: 'Help me outline and structure my Extended Essay.' },
  { label: 'Introduction', prompt: 'Help me write a strong introduction for my Extended Essay.' },
  { label: 'Body & Arguments', prompt: 'Help me develop strong arguments and analysis for my Extended Essay body.' },
  { label: 'Conclusion', prompt: 'Help me write an effective conclusion for my Extended Essay.' },
  { label: 'Citations & RPPF', prompt: 'Help me with citations, bibliography, and my Reflection on Planning and Progress Form.' },
  { label: 'Grade Criteria', prompt: 'Explain the IB EE assessment criteria and how to maximise my grade.' },
]

const WORD_GOALS = [1000, 2000, 3000, 4000]

export default function EEHelperPage() {
  const [subject, setSubject] = useState('')
  const [rq, setRq] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    const context = subject ? `Subject: ${subject}. Research Question: "${rq || 'Not set yet'}". ` : ''
    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `You are an expert IB Extended Essay mentor. ${context}Be specific, encouraging, and always reference IB EE assessment criteria when relevant. Give structured, actionable advice.` },
            ...newMessages,
          ],
        }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.content }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const wordGoal = 4000
  const pct = Math.min((wordCount / wordGoal) * 100, 100)

  if (!started) {
    return (
      <MainLayout>
        <Header title="EE Helper" subtitle="Extended Essay AI Mentor" />
        <div style={{ padding: '40px 48px', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Scroll style={{ width: '26px', height: '26px', color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>EE Helper</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your AI mentor for the Extended Essay — from research question to final submission.
            </p>
          </div>

          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subject
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="select-dark"
                  style={{ width: '100%', paddingRight: '36px' }}
                >
                  <option value="">Select your EE subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Research Question <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional — you can refine it with AI)</span>
              </label>
              <input
                value={rq}
                onChange={e => setRq(e.target.value)}
                placeholder="e.g. To what extent did the Marshall Plan influence..."
                className="input-dark"
              />
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '12px' }}
              onClick={() => setStarted(true)}
            >
              <Sparkles style={{ width: '15px', height: '15px' }} />
              Start EE Session
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '20px' }}>
            {[
              { icon: FileText, label: 'Research support', desc: 'Find sources and evaluate evidence' },
              { icon: BookOpen, label: 'Structure guidance', desc: 'Plan and outline your essay' },
              { icon: CheckCircle, label: 'Criteria coaching', desc: 'Hit every IB grade descriptor' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <Icon style={{ width: '20px', height: '20px', color: '#7c3aed', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Header title="EE Helper" subtitle={subject || 'Extended Essay'} />
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

        {/* Sidebar panel */}
        <div className="card" style={{ width: '260px', flexShrink: 0, borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px', overflowY: 'auto' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Subject</p>
            <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{subject || '—'}</p>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Research Question</p>
            <textarea
              value={rq}
              onChange={e => setRq(e.target.value)}
              className="input-dark"
              style={{ resize: 'none', height: '80px', fontSize: '12px' }}
              placeholder="Your research question..."
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Word Count</p>
              <p style={{ fontSize: '11px', color: pct === 100 ? '#10b981' : '#a78bfa' }}>{wordCount} / {wordGoal}</p>
            </div>
            <input
              type="range" min={0} max={wordGoal}
              value={wordCount}
              onChange={e => setWordCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7c3aed' }}
            />
            <div className="progress-bar" style={{ marginTop: '8px' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: '10px', transition: 'width 0.3s' }} />
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Quick Prompts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.label}
                  className="btn-ghost"
                  style={{ justifyContent: 'flex-start', fontSize: '12px', textAlign: 'left', padding: '7px 10px' }}
                  onClick={() => sendMessage(c.prompt)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-ghost"
            style={{ marginTop: 'auto', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}
            onClick={() => { setMessages([]); setStarted(false) }}
          >
            <RotateCcw style={{ width: '12px', height: '12px' }} /> New session
          </button>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '440px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Sparkles style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Ready to help with your EE</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Ask me anything — research question help, structure, argumentation, citations, or assessment criteria.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot style={{ width: '14px', height: '14px', color: '#fff' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '72%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? '#7c3aed' : 'var(--bg-card)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  fontSize: '14px',
                  lineHeight: 1.65,
                  color: '#e8edf5',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot style={{ width: '14px', height: '14px', color: '#fff' }} />
                </div>
                <div className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c3aed', animation: 'bounce 1s infinite', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '16px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about your Extended Essay..."
              className="input-dark"
              style={{ flex: 1 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{ padding: '9px 16px', flexShrink: 0, opacity: !input.trim() || loading ? 0.45 : 1 }}
            >
              <Send style={{ width: '15px', height: '15px' }} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
