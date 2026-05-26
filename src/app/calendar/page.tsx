'use client'

import { useState, useEffect, useCallback } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import {
  ChevronLeft, ChevronRight, Plus, X, School, Dumbbell,
  Sparkles, CheckCircle2, Trash2, Clock, Calendar as CalIcon,
  ListChecks, AlertTriangle
} from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, addDays, getDay, addWeeks, startOfDay
} from 'date-fns'
import { EVENT_COLORS } from '@/lib/utils'
import { CalendarEvent, ScheduleBlock, OnboardingData } from '@/types'
import { getSubjectAccent } from '@/lib/utils'

// ── helpers ─────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function timeToMins(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}
function minsToTime(m: number) {
  const h = Math.floor(m / 60).toString().padStart(2, '0')
  const min = (m % 60).toString().padStart(2, '0')
  return `${h}:${min}`
}

const EVENT_TYPE_OPTIONS = ['exam', 'summative', 'formative', 'IA', 'oral', 'study'] as const

// ── scheduling algorithm ────────────────────────────────
function buildStudyEvents(
  userData: OnboardingData,
  blocks: ScheduleBlock[],
  planCfg: { hoursPerDay: number; daysPerWeek: number; examWeeks: number; includeWeekends: boolean; focusMode: string },
  subjectPriority: { name: string; hoursPerWeek: number }[],
  today: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  if (!subjectPriority.length) return events

  const STUDY_START_WEEKDAY = 15 * 60 + 30   // 15:30
  const STUDY_END_WEEKDAY   = 22 * 60         // 22:00
  const STUDY_START_WEEKEND = 9  * 60         // 09:00
  const STUDY_END_WEEKEND   = 18 * 60         // 18:00
  const SESSION_MINS        = planCfg.hoursPerDay * 60

  let subjectCursor = 0

  for (let week = 0; week < Math.min(planCfg.examWeeks, 26); week++) {
    let studyDaysThisWeek = 0

    for (let d = 0; d < 7 && studyDaysThisWeek < planCfg.daysPerWeek; d++) {
      const date = addDays(today, week * 7 + d)
      const jsDay  = getDay(date)                  // 0=Sun..6=Sat
      const monDay = jsDay === 0 ? 6 : jsDay - 1   // 0=Mon..6=Sun
      const isWeekend = monDay >= 5

      if (isWeekend && !planCfg.includeWeekends) continue

      // Blocked slots for this day (from schedule blocks)
      const blocked = blocks
        .filter(b => b.days.includes(monDay))
        .map(b => ({ start: timeToMins(b.startTime), end: timeToMins(b.endTime) }))
        .sort((a, b) => a.start - b.start)

      // Find earliest free slot in study window
      const winStart = isWeekend ? STUDY_START_WEEKEND : STUDY_START_WEEKDAY
      const winEnd   = isWeekend ? STUDY_END_WEEKEND   : STUDY_END_WEEKDAY

      let slotStart = winStart
      for (const b of blocked) {
        if (b.end <= slotStart) continue           // already past
        if (b.start > slotStart + SESSION_MINS) break  // gap big enough before this block
        slotStart = Math.max(slotStart, b.end)         // push past this block
      }

      if (slotStart + SESSION_MINS > winEnd) continue   // no room today

      const subj = subjectPriority[subjectCursor % subjectPriority.length]
      const color = getSubjectAccent(subjectCursor % subjectPriority.length)

      events.push({
        id: `plan-${week}-${d}-${Date.now()}`,
        user_id: '',
        title: `Study: ${subj.name.split(':')[0].trim()}`,
        type: 'plan',
        subject_id: '',
        date: format(date, 'yyyy-MM-dd'),
        time: minsToTime(slotStart),
        endTime: minsToTime(slotStart + SESSION_MINS),
        description: `Week ${week + 1} plan session`,
        subjectColor: color,
      })

      subjectCursor++
      studyDaysThisWeek++
    }
  }
  return events
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', user_id: '', title: 'Physics Paper 2 Mock', type: 'exam',      subject_id: '', date: '2026-05-30', time: '09:00', description: '' },
  { id: '2', user_id: '', title: 'Math IA Draft',         type: 'IA',        subject_id: '', date: '2026-05-27', time: '23:59', description: '' },
  { id: '3', user_id: '', title: 'Chemistry Lab Report',  type: 'summative', subject_id: '', date: '2026-06-02', time: '17:00', description: '' },
  { id: '5', user_id: '', title: 'English IO Practice',   type: 'oral',      subject_id: '', date: '2026-06-05', time: '10:00', description: '' },
]

const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { id: 'school-default', type: 'school', title: 'School', days: [0,1,2,3,4], startTime: '08:00', endTime: '15:30', color: '#475569' },
]

type PanelTab = 'add' | 'schedule' | 'plan'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [panelTab, setPanelTab] = useState<PanelTab>('add')
  const [showPanel, setShowPanel] = useState(false)

  // Add event form
  const [newEvent, setNewEvent] = useState({ title: '', type: 'study' as typeof EVENT_TYPE_OPTIONS[number], time: '', endTime: '', description: '' })

  // Schedule blocks (school + ECAs)
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(DEFAULT_SCHEDULE)
  const [addingBlock, setAddingBlock] = useState(false)
  const [newBlock, setNewBlock] = useState<Omit<ScheduleBlock, 'id'>>({ type: 'eca', title: '', days: [], startTime: '16:00', endTime: '17:30', color: '#06b6d4' })

  // User / plan data
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [planCfg, setPlanCfg] = useState<{ hoursPerDay: number; daysPerWeek: number; examWeeks: number; includeWeekends: boolean; focusMode: string } | null>(null)
  const [planSubjects, setPlanSubjects] = useState<{ name: string; hoursPerWeek: number }[]>([])
  const [planApplied, setPlanApplied] = useState(false)
  const [applyingPlan, setApplyingPlan] = useState(false)

  useEffect(() => {
    // Load persisted events
    const saved = localStorage.getItem('ib_calendar_events')
    if (saved) setEvents(JSON.parse(saved))
    else setEvents(MOCK_EVENTS)

    // Load schedule blocks
    const savedBlocks = localStorage.getItem('ib_schedule_blocks')
    if (savedBlocks) setBlocks(JSON.parse(savedBlocks))

    // Load user data
    const ud = localStorage.getItem('ib_onboarding_data')
    if (ud) setUserData(JSON.parse(ud))

    // Load plan config
    const sp = localStorage.getItem('ib_study_plan')
    if (sp) {
      const { cfg } = JSON.parse(sp)
      setPlanCfg(cfg)
    }
  }, [])

  // Persist events on change
  useEffect(() => {
    if (events !== MOCK_EVENTS) localStorage.setItem('ib_calendar_events', JSON.stringify(events))
  }, [events])

  // Persist blocks on change
  useEffect(() => {
    localStorage.setItem('ib_schedule_blocks', JSON.stringify(blocks))
  }, [blocks])

  // Build subject priority from user data + plan
  useEffect(() => {
    if (!userData || !planCfg) return
    const subjects = userData.subjects || []
    const weakTopics = userData.weakTopics || {}
    const hoursPerWeek = planCfg.hoursPerDay * planCfg.daysPerWeek
    const baseHours = Math.max(1, Math.floor(hoursPerWeek / Math.max(subjects.length, 1)))

    const priority = subjects.map((s, i) => {
      const isWeak = (weakTopics[s.name] || []).length > 0
      return { name: s.name, hoursPerWeek: isWeak ? baseHours + 2 : baseHours }
    })
    setPlanSubjects(priority)
    setPlanApplied(events.some(e => e.type === 'plan'))
  }, [userData, planCfg])

  const monthStart = startOfMonth(currentDate)
  const monthEnd   = endOfMonth(currentDate)
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd     = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days       = eachDayOfInterval({ start: calStart, end: calEnd })

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.date + 'T00:00:00'), day))

  // Week view days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // ── add event ─────────────────────────────────────────
  const addEvent = () => {
    if (!newEvent.title || !selectedDay) return
    const ev: CalendarEvent = {
      id: Date.now().toString(),
      user_id: '',
      title: newEvent.title,
      type: newEvent.type,
      subject_id: '',
      date: format(selectedDay, 'yyyy-MM-dd'),
      time: newEvent.time,
      endTime: newEvent.endTime,
      description: newEvent.description,
    }
    setEvents(e => [...e, ev])
    setNewEvent({ title: '', type: 'study', time: '', endTime: '', description: '' })
  }

  const deleteEvent = (id: string) => setEvents(e => e.filter(ev => ev.id !== id))

  // ── schedule block helpers ─────────────────────────────
  const saveBlock = () => {
    if (!newBlock.title || !newBlock.days.length) return
    const b: ScheduleBlock = { ...newBlock, id: Date.now().toString() }
    setBlocks(prev => [...prev, b])
    setNewBlock({ type: 'eca', title: '', days: [], startTime: '16:00', endTime: '17:30', color: '#06b6d4' })
    setAddingBlock(false)
  }

  const updateSchoolBlock = (field: keyof ScheduleBlock, value: string | number[]) => {
    setBlocks(prev => prev.map(b => b.id === 'school-default' ? { ...b, [field]: value } : b))
  }

  // ── apply plan to calendar ─────────────────────────────
  const applyPlan = useCallback(() => {
    if (!planCfg || !planSubjects.length) return
    setApplyingPlan(true)

    // Remove existing plan events
    const base = events.filter(e => e.type !== 'plan')
    const studyEvents = buildStudyEvents(
      userData!,
      blocks,
      planCfg,
      planSubjects,
      startOfDay(new Date())
    )
    const merged = [...base, ...studyEvents]
    setEvents(merged)
    setPlanApplied(true)
    setApplyingPlan(false)
  }, [planCfg, planSubjects, blocks, events, userData])

  const clearPlanEvents = () => {
    setEvents(e => e.filter(ev => ev.type !== 'plan'))
    setPlanApplied(false)
  }

  const schoolBlock = blocks.find(b => b.id === 'school-default')
  const ecaBlocks   = blocks.filter(b => b.id !== 'school-default')

  // ── colour helper ──────────────────────────────────────
  const eventColor = (e: CalendarEvent) =>
    e.type === 'plan' ? (e.subjectColor || '#8b5cf6') : EVENT_COLORS[e.type] || '#64748b'

  return (
    <MainLayout>
      <Header title="Calendar" subtitle="Assessments, schedule and study plan in one place" />
      <div style={{ display: 'flex', height: 'calc(100vh - 61px)' }}>

        {/* ── Main calendar area ─────────────────────────── */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setCurrentDate(new Date())} className="btn-secondary" style={{ fontSize: '13px', padding: '7px 14px' }}>Today</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button onClick={() => setCurrentDate(v => view === 'month' ? subMonths(v, 1) : addDays(v, -7))} style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
                <button onClick={() => setCurrentDate(v => view === 'month' ? addMonths(v, 1) : addDays(v, 7))} style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                {view === 'month' ? format(currentDate, 'MMMM yyyy') : `${format(weekDays[0], 'd MMM')} – ${format(weekDays[6], 'd MMM yyyy')}`}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* View toggle */}
              <div style={{ display: 'flex', borderRadius: '9px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['month', 'week'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, background: view === v ? '#7c3aed' : 'transparent', color: view === v ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
                ))}
              </div>
              <button onClick={() => { setSelectedDay(new Date()); setPanelTab('add'); setShowPanel(true) }} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Event
              </button>
              <button onClick={() => { setPanelTab('schedule'); setShowPanel(true) }} style={{ padding: '8px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <School style={{ width: '14px', height: '14px' }} /> Schedule
              </button>
              <button onClick={() => { setPanelTab('plan'); setShowPanel(true) }} style={{ padding: '8px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, background: planApplied ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${planApplied ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)'}`, color: planApplied ? '#c4b5fd' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ListChecks style={{ width: '14px', height: '14px' }} /> {planApplied ? 'Plan Active' : 'Study Plan'}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {([...EVENT_TYPE_OPTIONS, 'plan', 'eca', 'school'] as const).map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: EVENT_COLORS[type] || '#64748b' }} />
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{type === 'plan' ? 'study plan' : type}</span>
              </div>
            ))}
          </div>

          {/* ── MONTH VIEW ───────────────────────────────── */}
          {view === 'month' && (
            <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', flex: 1 }}>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: '#0f1120' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ padding: '12px 0', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>{d}</div>
                ))}
              </div>
              {/* Cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
                {days.map((day, i) => {
                  const dayEvents = getEventsForDay(day)
                  const inMonth = isSameMonth(day, currentDate)
                  const todayDay = isToday(day)
                  const isSelected = selectedDay && isSameDay(day, selectedDay)
                  return (
                    <div key={i} onClick={() => { setSelectedDay(day); setPanelTab('add'); setShowPanel(true) }} style={{ minHeight: '96px', padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', background: isSelected ? 'rgba(124,58,237,0.1)' : todayDay ? 'rgba(124,58,237,0.05)' : 'transparent', opacity: inMonth ? 1 : 0.35, transition: 'background 0.12s' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', fontSize: '13px', fontWeight: todayDay ? 700 : 500, background: todayDay ? '#7c3aed' : 'transparent', color: todayDay ? '#fff' : inMonth ? '#e2e8f0' : '#475569', marginBottom: '4px' }}>
                        {format(day, 'd')}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: `${eventColor(ev)}22`, color: eventColor(ev), border: `1px solid ${eventColor(ev)}40` }}>
                            {ev.time && <span style={{ opacity: 0.7, marginRight: '3px' }}>{ev.time.slice(0,5)}</span>}{ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && <p style={{ fontSize: '10px', color: '#475569' }}>+{dayEvents.length - 3} more</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── WEEK VIEW ────────────────────────────────── */}
          {view === 'week' && (
            <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Week day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7,1fr)', background: '#0f1120', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div />
                {weekDays.map((d, i) => (
                  <div key={i} style={{ padding: '10px 0', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{DAYS[i]}</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: isToday(d) ? '#a78bfa' : '#fff', marginTop: '2px' }}>{format(d, 'd')}</p>
                  </div>
                ))}
              </div>

              {/* Time slots 7am-22pm */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {Array.from({ length: 16 }, (_, h) => h + 7).map(hour => (
                  <div key={hour} style={{ display: 'grid', gridTemplateColumns: '48px repeat(7,1fr)', borderBottom: '1px solid rgba(255,255,255,0.04)', minHeight: '52px' }}>
                    <div style={{ padding: '4px 8px 0', fontSize: '10px', color: '#475569', fontWeight: 600, flexShrink: 0, textAlign: 'right' }}>{hour}:00</div>
                    {weekDays.map((day, di) => {
                      const monDay = di
                      const dayEventsInSlot = events.filter(e => {
                        if (!isSameDay(new Date(e.date + 'T00:00:00'), day)) return false
                        if (!e.time) return false
                        const evHour = parseInt(e.time.split(':')[0])
                        return evHour === hour
                      })
                      // Show schedule blocks that cover this hour
                      const blockHere = blocks.filter(b => {
                        if (!b.days.includes(monDay)) return false
                        const bStart = timeToMins(b.startTime) / 60
                        const bEnd   = timeToMins(b.endTime) / 60
                        return hour >= Math.floor(bStart) && hour < Math.ceil(bEnd)
                      })

                      return (
                        <div key={di} style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', padding: '2px 3px', position: 'relative', background: blockHere.length ? `${blockHere[0].color || '#475569'}10` : 'transparent' }}>
                          {blockHere.length > 0 && (
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: blockHere[0].color || '#475569', borderLeft: `3px solid ${blockHere[0].color || '#475569'}` }} />
                          )}
                          {dayEventsInSlot.map(ev => (
                            <div key={ev.id} style={{ fontSize: '10px', padding: '3px 5px', borderRadius: '5px', fontWeight: 600, marginBottom: '2px', background: `${eventColor(ev)}25`, color: eventColor(ev), border: `1px solid ${eventColor(ev)}40`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', position: 'relative', zIndex: 1 }}>
                              {ev.time} {ev.title}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ────────────────────────────────── */}
        {showPanel && (
          <div style={{ width: '320px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.07)', background: '#0f1120', display: 'flex', flexDirection: 'column' }}>

            {/* Panel tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              {([
                { id: 'add' as PanelTab, label: 'Add Event', icon: Plus },
                { id: 'schedule' as PanelTab, label: 'Schedule', icon: School },
                { id: 'plan' as PanelTab, label: 'Plan', icon: ListChecks },
              ]).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setPanelTab(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 6px', fontSize: '10px', fontWeight: 700, background: 'none', border: 'none', borderBottom: panelTab === id ? '2px solid #7c3aed' : '2px solid transparent', color: panelTab === id ? '#a78bfa' : '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <Icon style={{ width: '14px', height: '14px' }} />
                  {label}
                </button>
              ))}
              <button onClick={() => setShowPanel(false)} style={{ padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

              {/* ── ADD EVENT TAB ── */}
              {panelTab === 'add' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedDay && (
                    <div style={{ padding: '10px 14px', borderRadius: '9px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: '13px', fontWeight: 700, color: '#c4b5fd' }}>
                      {format(selectedDay, 'EEEE, d MMMM yyyy')}
                    </div>
                  )}
                  {(['title', 'description'] as const).map(field => (
                    <div key={field}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>{field}</label>
                      {field === 'description' ? (
                        <textarea value={newEvent[field]} onChange={e => setNewEvent(n => ({ ...n, [field]: e.target.value }))} placeholder="Details (optional)..." rows={2} className="input-dark" style={{ width: '100%', fontSize: '13px', resize: 'none' }} />
                      ) : (
                        <input value={newEvent[field]} onChange={e => setNewEvent(n => ({ ...n, [field]: e.target.value }))} placeholder="Event title..." className="input-dark" style={{ width: '100%', fontSize: '13px' }} />
                      )}
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Type</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {EVENT_TYPE_OPTIONS.map(t => (
                        <button key={t} onClick={() => setNewEvent(n => ({ ...n, type: t }))} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: newEvent.type === t ? `${EVENT_COLORS[t]}25` : 'rgba(255,255,255,0.04)', border: `1px solid ${newEvent.type === t ? EVENT_COLORS[t] : 'rgba(255,255,255,0.07)'}`, color: newEvent.type === t ? EVENT_COLORS[t] : 'var(--text-secondary)' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(['time', 'endTime'] as const).map(field => (
                      <div key={field}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>{field === 'time' ? 'Start' : 'End'}</label>
                        <input type="time" value={newEvent[field]} onChange={e => setNewEvent(n => ({ ...n, [field]: e.target.value }))} className="input-dark" style={{ width: '100%', fontSize: '13px' }} />
                      </div>
                    ))}
                  </div>
                  <button onClick={addEvent} disabled={!newEvent.title} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, opacity: !newEvent.title ? 0.5 : 1 }}>
                    Add to Calendar
                  </button>

                  {/* Events for selected day */}
                  {selectedDay && (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        {format(selectedDay, 'd MMM')} Events ({getEventsForDay(selectedDay).length})
                      </p>
                      {getEventsForDay(selectedDay).length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No events this day</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {getEventsForDay(selectedDay).map(ev => (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '9px', background: `${eventColor(ev)}10`, border: `1px solid ${eventColor(ev)}30` }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: eventColor(ev), flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                                {ev.time && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}</p>}
                              </div>
                              <button onClick={() => deleteEvent(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', flexShrink: 0, opacity: 0.6 }}>
                                <Trash2 style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── SCHEDULE TAB ── */}
              {panelTab === 'schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Set your weekly commitments so the study plan is scheduled around them.</p>

                  {/* School hours */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <School style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>School Hours</p>
                    </div>
                    {schoolBlock && (
                      <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>START</label>
                            <input type="time" value={schoolBlock.startTime} onChange={e => updateSchoolBlock('startTime', e.target.value)} className="input-dark" style={{ width: '100%', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>END</label>
                            <input type="time" value={schoolBlock.endTime} onChange={e => updateSchoolBlock('endTime', e.target.value)} className="input-dark" style={{ width: '100%', fontSize: '12px' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>DAYS</label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {DAYS.map((d, i) => {
                              const on = schoolBlock.days.includes(i)
                              return (
                                <button key={d} onClick={() => { const days = on ? schoolBlock.days.filter(x => x !== i) : [...schoolBlock.days, i]; updateSchoolBlock('days', days) }} style={{ width: '30px', height: '30px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', background: on ? 'rgba(71,85,105,0.4)' : 'rgba(255,255,255,0.03)', border: `1px solid ${on ? '#475569' : 'rgba(255,255,255,0.07)'}`, color: on ? '#94a3b8' : 'var(--text-muted)' }}>{d[0]}</button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ECAs */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Dumbbell style={{ width: '14px', height: '14px', color: '#06b6d4' }} />
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>ECAs & Commitments</p>
                      </div>
                      <button onClick={() => setAddingBlock(true)} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#67e8f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus style={{ width: '10px', height: '10px' }} /> Add
                      </button>
                    </div>

                    {addingBlock && (
                      <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input value={newBlock.title} onChange={e => setNewBlock(n => ({ ...n, title: e.target.value }))} placeholder="Activity name..." className="input-dark" style={{ fontSize: '13px', width: '100%' }} />
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>DAYS</label>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {DAYS.map((d, i) => {
                              const on = newBlock.days.includes(i)
                              return (
                                <button key={d} onClick={() => setNewBlock(n => ({ ...n, days: on ? n.days.filter(x => x !== i) : [...n.days, i] }))} style={{ width: '30px', height: '30px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', background: on ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${on ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.07)'}`, color: on ? '#67e8f9' : 'var(--text-muted)' }}>{d[0]}</button>
                              )
                            })}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>START</label>
                            <input type="time" value={newBlock.startTime} onChange={e => setNewBlock(n => ({ ...n, startTime: e.target.value }))} className="input-dark" style={{ width: '100%', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>END</label>
                            <input type="time" value={newBlock.endTime} onChange={e => setNewBlock(n => ({ ...n, endTime: e.target.value }))} className="input-dark" style={{ width: '100%', fontSize: '12px' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={saveBlock} disabled={!newBlock.title || !newBlock.days.length} className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '8px', opacity: (!newBlock.title || !newBlock.days.length) ? 0.5 : 1 }}>Save</button>
                          <button onClick={() => setAddingBlock(false)} className="btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '8px' }}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {ecaBlocks.length === 0 && !addingBlock ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No ECAs added yet</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ecaBlocks.map(b => (
                          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                            <Dumbbell style={{ width: '13px', height: '13px', color: '#67e8f9', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{b.title}</p>
                              <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{b.days.map(d => DAYS[d]).join(', ')} · {b.startTime}–{b.endTime}</p>
                            </div>
                            <button onClick={() => setBlocks(prev => prev.filter(x => x.id !== b.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', opacity: 0.6 }}>
                              <Trash2 style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PLAN TAB ── */}
              {panelTab === 'plan' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {!planCfg ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                      <AlertTriangle style={{ width: '32px', height: '32px', color: '#f59e0b', margin: '0 auto 12px' }} />
                      <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px', fontSize: '14px' }}>No plan yet</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>Generate a study plan first on the Study Plan page, then come back to push it to your calendar.</p>
                      <a href="/study-plan" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '9px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Go to Study Plan</a>
                    </div>
                  ) : (
                    <>
                      {/* Plan summary */}
                      <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <ListChecks style={{ width: '14px', height: '14px', color: '#a78bfa' }} />
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Your Study Plan</p>
                        </div>
                        {[
                          { label: 'Duration', value: `${planCfg.examWeeks} weeks` },
                          { label: 'Daily study', value: `${planCfg.hoursPerDay}h/day` },
                          { label: 'Days/week', value: `${planCfg.daysPerWeek} days` },
                          { label: 'Subjects', value: `${planSubjects.length}` },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Schedule conflicts info */}
                      <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Blocked Times Respected</p>
                        {blocks.map(b => (
                          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <CheckCircle2 style={{ width: '12px', height: '12px', color: '#34d399', flexShrink: 0 }} />
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{b.title}: {b.days.map(d => DAYS[d]).join(', ')} {b.startTime}–{b.endTime}</p>
                          </div>
                        ))}
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Study sessions placed in free windows after school / ECAs end.</p>
                      </div>

                      {/* Apply / clear buttons */}
                      {planApplied ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                            <CheckCircle2 style={{ width: '14px', height: '14px', color: '#34d399' }} />
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>Plan applied to calendar</p>
                          </div>
                          <button onClick={applyPlan} disabled={applyingPlan} style={{ width: '100%', padding: '10px', borderRadius: '9px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Sparkles style={{ width: '13px', height: '13px' }} /> Recalculate Schedule
                          </button>
                          <button onClick={clearPlanEvents} style={{ width: '100%', padding: '10px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                            Remove Plan Events
                          </button>
                        </div>
                      ) : (
                        <button onClick={applyPlan} disabled={applyingPlan} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {applyingPlan ? <><Sparkles style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Scheduling...</> : <><Sparkles style={{ width: '15px', height: '15px' }} /> Push Plan to Calendar</>}
                        </button>
                      )}

                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                        Study sessions are placed in the first available slot each day after your school hours and ECAs. Update your schedule in the Schedule tab to recalculate.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </MainLayout>
  )
}
