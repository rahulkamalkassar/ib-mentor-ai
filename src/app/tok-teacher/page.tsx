'use client'

import { useState, useRef, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { Send, Brain, Sparkles, Bot, RotateCcw, Lightbulb, BookOpen, PenTool } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const AOKS = [
  { id: 'natural-sciences', label: 'Natural Sciences',  color: '#06b6d4' },
  { id: 'human-sciences',   label: 'Human Sciences',    color: '#7c3aed' },
  { id: 'history',          label: 'History',           color: '#f59e0b' },
  { id: 'arts',             label: 'The Arts',          color: '#ec4899' },
  { id: 'ethics',           label: 'Ethics',            color: '#10b981' },
  { id: 'mathematics',      label: 'Mathematics',       color: '#8b5cf6' },
  { id: 'indigenous',       label: 'Indigenous Knowledge', color: '#f97316' },
  { id: 'religious',        label: 'Religious Knowledge',  color: '#e879f9' },
]

const MODES = [
  { id: 'essay', label: 'Essay Planner', icon: PenTool },
  { id: 'exhibition', label: 'Exhibition Helper', icon: BookOpen },
  { id: 'explore', label: 'Explore KQs', icon: Lightbulb },
]

const QUICK_PROMPTS = [
  'Give me a strong Knowledge Question for my essay.',
  'What are the best real-life situations for this AOK?',
  'Explain the key perspectives I should address.',
  'Help me develop a counterclaim.',
  'How do I structure the TOK essay?',
  'What makes a good TOK exhibition object?',
  'Explain the concept of "shared knowledge".',
  'How do I earn top marks on the TOK essay?',
]

export default function TOKTeacherPage() {
  const [selectedAOK, setSelectedAOK] = useState('')
  const [mode, setMode] = useState('essay')
  const [kq, setKq] = useState('')
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
    const aokLabel = AOKS.find(a => a.id === selectedAOK)?.label || ''
    const context = `You are an expert TOK teacher helping an IB student. Mode: ${mode}. AOK: ${aokLabel || 'General'}. KQ: "${kq || 'Not set'}". Be Socratic, philosophical, and encourage the student to think critically. Reference IB TOK assessment criteria and use proper TOK terminology (AOK, WOK, knowledge claim, counterclaim, real-life situation, etc.).`
    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: context }, ...newMessages],
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

  if (!started) {
    return (
      <MainLayout>
        <Header title="TOK Teacher" subtitle="Theory of Knowledge AI Mentor" />
        <div style={{ padding: '40px 48px', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Brain style={{ width: '26px', height: '26px', color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>TOK Teacher</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your AI Theory of Knowledge mentor — explore KQs, develop arguments, and ace your essay or exhibition.
            </p>
          </div>

          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Mode selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                What do you need help with?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {MODES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: `1px solid ${mode === id ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      background: mode === id ? 'rgba(6,182,212,0.1)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon style={{ width: '18px', height: '18px', color: mode === id ? '#67e8f9' : 'var(--text-muted)', margin: '0 auto 6px' }} />
                    <p style={{ fontSize: '12px', fontWeight: 600, color: mode === id ? '#67e8f9' : 'var(--text-secondary)' }}>{label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* AOK selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                Area of Knowledge
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                {AOKS.map(aok => (
                  <button
                    key={aok.id}
                    onClick={() => setSelectedAOK(aok.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '9px',
                      border: `1px solid ${selectedAOK === aok.id ? aok.color + '60' : 'rgba(255,255,255,0.07)'}`,
                      background: selectedAOK === aok.id ? aok.color + '18' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontSize: '11px', fontWeight: 600, color: selectedAOK === aok.id ? aok.color : 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {aok.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* KQ */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Knowledge Question <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
              </label>
              <input
                value={kq}
                onChange={e => setKq(e.target.value)}
                className="input-dark"
                placeholder="e.g. To what extent does language shape our knowledge?"
              />
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '12px' }}
              onClick={() => setStarted(true)}
            >
              <Sparkles style={{ width: '15px', height: '15px' }} />
              Start TOK Session
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const aokData = AOKS.find(a => a.id === selectedAOK)

  return (
    <MainLayout>
      <Header title="TOK Teacher" subtitle={aokData?.label || 'Theory of Knowledge'} />
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

        {/* Sidebar */}
        <div className="card" style={{ width: '260px', flexShrink: 0, borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px', overflowY: 'auto' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Mode</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className="btn-ghost"
                  style={{ justifyContent: 'flex-start', gap: '8px', fontSize: '12px', background: mode === id ? 'rgba(6,182,212,0.1)' : 'transparent', color: mode === id ? '#67e8f9' : 'var(--text-secondary)' }}
                  onClick={() => setMode(id)}
                >
                  <Icon style={{ width: '13px', height: '13px' }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>AOK</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {AOKS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAOK(a.id)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    border: `1px solid ${selectedAOK === a.id ? a.color + '60' : 'rgba(255,255,255,0.07)'}`,
                    background: selectedAOK === a.id ? a.color + '18' : 'transparent',
                    color: selectedAOK === a.id ? a.color : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Knowledge Question</p>
            <textarea
              value={kq}
              onChange={e => setKq(e.target.value)}
              className="input-dark"
              style={{ resize: 'none', height: '72px', fontSize: '12px' }}
              placeholder="Your KQ..."
            />
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Quick Prompts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  className="btn-ghost"
                  style={{ justifyContent: 'flex-start', fontSize: '11px', textAlign: 'left', padding: '6px 10px', lineHeight: 1.4 }}
                  onClick={() => sendMessage(p)}
                >
                  {p}
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

        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '440px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Brain style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Your TOK mentor is ready</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Ask about Knowledge Questions, real-life situations, arguments, counterclaims, or essay structure.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot style={{ width: '14px', height: '14px', color: '#fff' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '72%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? '#06b6d4' : 'var(--bg-card)',
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
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot style={{ width: '14px', height: '14px', color: '#fff' }} />
                </div>
                <div className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06b6d4', animation: 'bounce 1s infinite', animationDelay: `${i * 0.15}s` }} />
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
              placeholder="Ask about Theory of Knowledge..."
              className="input-dark"
              style={{ flex: 1 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{ padding: '9px 16px', flexShrink: 0, background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', opacity: !input.trim() || loading ? 0.45 : 1 }}
            >
              <Send style={{ width: '15px', height: '15px' }} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
