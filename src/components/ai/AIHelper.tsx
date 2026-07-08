'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Bot, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

const SUGGESTED_PROMPTS = [
  'Help me make a study plan',
  'Explain a concept I&apos;m stuck on',
  'Give essay feedback',
  'Predict my grade',
]

const chipVariants = {
  hidden: { opacity: 0, y: 6 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.18, delay: 0.1 + i * 0.06, ease: 'easeOut' as const },
  }),
}

const bubbleVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' as const } },
}

export default function AIHelper() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading || isStreaming) return

    setInput('')
    const userMsg: Message = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let firstToken = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (!data) continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              if (firstToken) {
                firstToken = false
                setLoading(false)
                setIsStreaming(true)
                setMessages(prev => [...prev, { role: 'assistant', content: parsed.delta.text }])
              } else {
                setMessages(prev => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last?.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, content: last.content + parsed.delta.text }
                  }
                  return updated
                })
              }
            }
          } catch {
            // Non-JSON line (event: ...) — ignore
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setLoading(false)
      setMessages(prev => [...prev, { role: 'assistant', content: '', error: true }])
    } finally {
      setLoading(false)
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [input, messages, loading, isStreaming])

  const retry = () => {
    // Remove the last error message and the message before it (user message), then resend
    const trimmed = messages.slice(0, -1)
    const lastUser = [...trimmed].reverse().find(m => m.role === 'user')
    if (!lastUser) return
    setMessages(trimmed.filter(m => m !== lastUser))
    sendMessage(lastUser.content)
  }

  const isDisabled = loading || isStreaming

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            data-ai-trigger
            onClick={() => setOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 w-13 h-13 rounded-full flex items-center justify-center z-50 pulse-purple shadow-lg"
            style={{ width: 52, height: 52, background: 'var(--accent-purple)' }}
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-0 right-6 w-96 rounded-t-2xl z-50 flex flex-col"
            style={{
              height: 580,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderBottom: 'none',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-purple)' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">IB AI Tutor</p>
                  <p className="text-xs" style={{ color: 'var(--accent-green)' }}>● Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 chat-messages">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-purple)' }}>
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', maxWidth: '82%' }}>
                      Hi! I&apos;m your IB AI Tutor. Ask me anything — study plans, concept explanations, essay feedback, grade predictions, or specific IB topics.
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>Try asking</p>
                    {SUGGESTED_PROMPTS.map((p, i) => (
                      <motion.button
                        key={p}
                        custom={i}
                        variants={chipVariants}
                        initial="hidden"
                        animate="show"
                        onClick={() => sendMessage(p)}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-150"
                        style={{
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
                          e.currentTarget.style.color = 'var(--text-primary)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-color)'
                          e.currentTarget.style.color = 'var(--text-secondary)'
                        }}
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      variants={bubbleVariants}
                      initial="hidden"
                      animate="show"
                      className={cn('flex items-start gap-2.5', msg.role === 'user' && 'flex-row-reverse')}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--accent-purple)' }}>
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div>
                        <div
                          className="rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap"
                          style={{
                            maxWidth: '82%',
                            display: 'inline-block',
                            background: msg.role === 'user' ? 'var(--accent-purple)' : 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            opacity: msg.error ? 0.6 : 1,
                          }}
                        >
                          {msg.error ? (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Something went wrong.</span>
                          ) : (
                            msg.content || (isStreaming && i === messages.length - 1 ? (
                              <span style={{ color: 'var(--text-muted)' }}>…</span>
                            ) : null)
                          )}
                        </div>
                        {msg.error && (
                          <button
                            onClick={retry}
                            className="flex items-center gap-1 mt-1.5 text-xs ml-1"
                            style={{ color: 'var(--accent-purple)', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <RefreshCw className="w-3 h-3" /> Retry
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Thinking indicator — only while waiting for first token */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-purple)' }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(j => (
                        <motion.div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--accent-purple)' }}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: j * 0.12, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3.5 flex-shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask anything about IB…"
                  className="flex-1 input-dark text-sm"
                  disabled={isDisabled}
                  style={{ opacity: isDisabled ? 0.7 : 1 }}
                />
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isDisabled}
                  whileTap={{ scale: 0.93 }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40"
                  style={{ background: 'var(--accent-purple)', border: 'none', cursor: (!input.trim() || isDisabled) ? 'not-allowed' : 'pointer' }}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
