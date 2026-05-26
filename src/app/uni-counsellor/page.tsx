'use client'

import { useState, useRef, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  Search, GraduationCap, Send, Bot, BookOpen, Briefcase,
  Calendar, Award, Sparkles, X, MapPin, Star, ChevronRight, Loader2,
} from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

interface UniProfile {
  name: string
  country: string
  worldRank?: string
  ibPoints: string
  subjectReqs: string[]
  languageReq: string
  deadline: string
  notes: string
  topCourses: string[]
}

type Mode = 'essay' | 'eca' | 'subjects' | 'timeline' | 'chat'

const POPULAR_UNIS = [
  'University of Oxford', 'University of Cambridge', 'Imperial College London',
  'University College London', 'University of Edinburgh', 'Kings College London',
  'MIT', 'Harvard University', 'Stanford University', 'ETH Zurich',
  'University of Toronto', 'McGill University', 'NYU', 'University of Amsterdam',
]

const MODES: { id: Mode; label: string; icon: React.ElementType; color: string; prompt: string }[] = [
  {
    id: 'essay', label: 'Application Essay', icon: BookOpen, color: '#7c3aed',
    prompt: 'Help me write and improve my personal statement / application essays for this university.',
  },
  {
    id: 'eca', label: 'ECA Strategy', icon: Briefcase, color: '#06b6d4',
    prompt: 'What extracurricular activities (ECAs) should I do to strengthen my application to this university?',
  },
  {
    id: 'subjects', label: 'Subject Strategy', icon: Award, color: '#10b981',
    prompt: 'Which IB subjects and HL/SL choices will best support my application to this university?',
  },
  {
    id: 'timeline', label: 'App Timeline', icon: Calendar, color: '#f59e0b',
    prompt: 'Give me a step-by-step application timeline and list of key deadlines for this university.',
  },
  {
    id: 'chat', label: 'Free Chat', icon: Bot, color: '#ec4899',
    prompt: '',
  },
]

function UniCard({ profile, onClear }: { profile: UniProfile; onClear: () => void }) {
  return (
    <div style={{ background: '#161827', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GraduationCap style={{ width: 20, height: 20, color: '#a78bfa' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '15px', lineHeight: 1.2 }}>{profile.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <MapPin style={{ width: 11, height: 11, color: '#64748b' }} />
              <span style={{ fontSize: '12px', color: '#64748b' }}>{profile.country}</span>
              {profile.worldRank && (
                <>
                  <span style={{ color: '#2d3748', fontSize: '12px' }}>·</span>
                  <Star style={{ width: 11, height: 11, color: '#f59e0b' }} />
                  <span style={{ fontSize: '12px', color: '#f59e0b' }}>#{profile.worldRank} World</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px' }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Req label="IB Points" value={profile.ibPoints} color="#a78bfa" />
        {profile.subjectReqs.length > 0 && (
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject Requirements</span>
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {profile.subjectReqs.map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <ChevronRight style={{ width: 12, height: 12, color: '#06b6d4', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <Req label="Language" value={profile.languageReq} color="#10b981" />
        <Req label="Deadline" value={profile.deadline} color="#f59e0b" />
        {profile.topCourses.length > 0 && (
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular Courses</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
              {profile.topCourses.map(c => (
                <span key={c} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(124,58,237,0.12)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>{c}</span>
              ))}
            </div>
          </div>
        )}
        {profile.notes && (
          <div style={{ marginTop: '4px', padding: '10px', borderRadius: '8px', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{profile.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Req({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '12px', color, fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '8px', marginTop: '2px' }}>
          <Sparkles style={{ width: 13, height: 13, color: 'white' }} />
        </div>
      )}
      <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isUser ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#1e2a3a', color: 'white', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function UniCounsellorPage() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [profile, setProfile] = useState<UniProfile | null>(null)
  const [mode, setMode] = useState<Mode>('essay')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const lookupUniversity = async (name: string) => {
    if (!name.trim()) return
    setSearching(true)
    setProfile(null)
    setMessages([])
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are a university admissions expert. Provide structured entry requirements for "${name}" for IB students. Return ONLY a valid JSON object (no markdown, no extra text) with exactly these fields:
{
  "name": "full official university name",
  "country": "country",
  "worldRank": "approximate QS or THE world ranking number as string, or null",
  "ibPoints": "typical IB total points required (e.g. '38-42 points' or '36+ points')",
  "subjectReqs": ["list of specific subject requirements as strings"],
  "languageReq": "English language requirement (IELTS/TOEFL scores or native speaker)",
  "deadline": "main application deadline (e.g. 'UCAS: January 15' or 'Common App: January 1')",
  "topCourses": ["3-5 popular/well-known courses at this university"],
  "notes": "one or two important notes about this university's admissions (e.g. interview process, portfolio requirements, early decision)"
}`
          }]
        })
      })
      const data = await res.json()
      const text: string = data.content ?? data.message ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as UniProfile
        setProfile(parsed)
      }
    } catch {
      setProfile({ name, country: 'Unknown', ibPoints: 'Unavailable', subjectReqs: [], languageReq: 'See university website', deadline: 'See university website', notes: 'Could not load requirements automatically. Please check the university website.', topCourses: [] })
    }
    setSearching(false)
  }

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    const ctx = profile
      ? `University context: ${profile.name} (${profile.country}). IB requirement: ${profile.ibPoints}. Subject requirements: ${profile.subjectReqs.join('; ')}.`
      : 'No specific university selected.'
    const systemPrompt = `You are an expert IB university admissions counsellor. You help IB students with university applications. ${ctx} Be specific, practical, and encouraging. Use bullet points where helpful.`
    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: systemPrompt + '\n\n' + msg },
            ...newMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
          ]
        })
      })
      const data = await res.json()
      const reply = data.content ?? data.message ?? 'Sorry, something went wrong.'
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' }])
    }
    setLoading(false)
  }

  const startMode = (m: Mode) => {
    setMode(m)
    const modeObj = MODES.find(x => x.id === m)
    if (modeObj && modeObj.prompt) {
      setMessages([])
      sendMessage(modeObj.prompt)
    }
  }

  return (
    <MainLayout>
      <Header title="University Counsellor" subtitle="Find requirements, write essays, plan your application" />

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

        {/* Left Panel */}
        <div style={{ width: '340px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto' }}>

          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Search University</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#1e2a3a', borderRadius: '10px', padding: '0 12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Search style={{ width: 15, height: 15, color: '#475569', flexShrink: 0 }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') lookupUniversity(query) }}
                  placeholder="e.g. University of Oxford"
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '13px', flex: 1, padding: '10px 0' }}
                />
              </div>
              <button
                onClick={() => lookupUniversity(query)}
                disabled={searching || !query.trim()}
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0, opacity: searching || !query.trim() ? 0.5 : 1 }}
              >
                {searching ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <ChevronRight style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </div>

          {/* University profile card */}
          {searching && (
            <div style={{ background: '#161827', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Loader2 style={{ width: 22, height: 22, color: '#7c3aed', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Looking up requirements...</p>
            </div>
          )}
          {profile && !searching && <UniCard profile={profile} onClear={() => { setProfile(null); setMessages([]) }} />}

          {/* Popular universities */}
          {!profile && !searching && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Popular Universities</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {POPULAR_UNIS.map(uni => (
                  <button
                    key={uni}
                    onClick={() => { setQuery(uni); lookupUniversity(uni) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <GraduationCap style={{ width: 14, height: 14, color: '#475569', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{uni}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — AI Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Mode tabs */}
          <div style={{ padding: '16px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {MODES.map(m => {
              const Icon = m.icon
              const active = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => startMode(m.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: active ? 600 : 400, background: active ? '#161827' : 'none', color: active ? m.color : '#64748b', borderBottom: active ? '2px solid ' + m.color : '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* Empty state / chat messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {messages.length === 0 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap style={{ width: 26, height: 26, color: 'white' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, color: 'white', fontSize: '17px', marginBottom: '6px' }}>
                    {profile ? `Planning your application to ${profile.name}` : 'Your personal university counsellor'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', lineHeight: 1.6 }}>
                    {profile
                      ? 'Choose a tab above to get started, or type a question below.'
                      : 'Search for a university on the left to see requirements, then use the tabs to get help with essays, ECAs, and more.'}
                  </p>
                </div>
                {profile && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '500px', width: '100%' }}>
                    {MODES.filter(m => m.id !== 'chat').map(m => {
                      const Icon = m.icon
                      return (
                        <button
                          key={m.id}
                          onClick={() => startMode(m.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: '#161827', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = m.color + '60')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: '8px', background: m.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon style={{ width: 15, height: 15, color: m.color }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{m.label}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{m.id === 'essay' ? 'Personal statement help' : m.id === 'eca' ? 'What activities to join' : m.id === 'subjects' ? 'IB subject selection' : 'Deadlines & milestones'}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles style={{ width: 13, height: 13, color: 'white' }} />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: '#1e2a3a', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'block', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={profile ? `Ask about applying to ${profile.name}...` : 'Search for a university first, or ask a general application question...'}
                rows={1}
                style={{ flex: 1, background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '13px', resize: 'none', outline: 'none', lineHeight: 1.5, minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }}
                onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: loading || !input.trim() ? 0.4 : 1, transition: 'opacity 0.15s' }}
              >
                <Send style={{ width: 16, height: 16, color: 'white' }} />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#334155', marginTop: '8px', textAlign: 'center' }}>
              AI-powered guidance · Always verify requirements on the official university website
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      `}</style>
    </MainLayout>
  )
}
