'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'
import { gradeColor, getSubjectAccent } from '@/lib/utils'
import { OnboardingData } from '@/types'
import { Info, Plus, Target, TrendingUp, Edit3, Check, X, Star, Zap, Award } from 'lucide-react'

interface SubjectGrade {
  name: string
  level: 'HL' | 'SL'
  goal: number
  likely: number
  ia: number
  mock: number
}

interface AssessmentEntry {
  id: string
  date: string
  subject: string
  what: string
  type: string
  score: number
  outOf: number
  notes: string
}

const TOK_EE_MATRIX: Record<string, Record<string, number>> = {
  'A': { A: 3, B: 3, C: 2, D: 2, E: 0 },
  'B': { A: 3, B: 2, C: 2, D: 1, E: 0 },
  'C': { A: 2, B: 2, C: 1, D: 1, E: 0 },
  'D': { A: 2, B: 1, C: 1, D: 0, E: 0 },
}

function BigStatCard({
  label, value, sub, icon: Icon, iconBg, iconColor, editable, onEdit
}: {
  label: string
  value: React.ReactNode
  sub: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  editable?: boolean
  onEdit?: () => void
}) {
  return (
    <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px', background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
      }}>
        <Icon style={{ width: '22px', height: '22px', color: iconColor }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <p style={{ fontSize: '52px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
        {editable && (
          <button onClick={onEdit} style={{ opacity: 0.5, marginTop: '4px' }}>
            <Edit3 style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          </button>
        )}
      </div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 4px' }}>{label}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}

export default function GradesPage() {
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [grades, setGrades] = useState<SubjectGrade[]>([])
  const [tokGrade, setTokGrade] = useState('B')
  const [eeGrade, setEeGrade] = useState('B')
  const [goalPoints, setGoalPoints] = useState(38)
  const [universityAim, setUniversityAim] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [log, setLog] = useState<AssessmentEntry[]>([])
  const [newEntry, setNewEntry] = useState({ date: '', subject: '', what: '', type: 'formative', score: 0, outOf: 100, notes: '' })

  useEffect(() => {
    const data = localStorage.getItem('ib_onboarding_data')
    if (data) {
      const parsed: OnboardingData = JSON.parse(data)
      setUserData(parsed)
      setGoalPoints(parsed.goalPoints || 38)
      setUniversityAim(parsed.universityAim || '')
      setGrades(parsed.subjects.map(s => ({
        name: s.name,
        level: s.level,
        goal: 6,
        likely: 5,
        ia: 0,
        mock: 0,
      })))
    }
  }, [])

  const matrixBonus = TOK_EE_MATRIX[tokGrade]?.[eeGrade] ?? 0
  const subjectSum = grades.reduce((sum, g) => sum + g.likely, 0)
  const predictedTotal = subjectSum + matrixBonus
  const pointsLeft = Math.max(0, goalPoints - predictedTotal)

  const updateGrade = (name: string, field: keyof SubjectGrade, value: number | string) => {
    setGrades(g => g.map(s => s.name === name ? { ...s, [field]: value } : s))
  }

  const addLog = () => {
    if (!newEntry.what || !newEntry.subject) return
    setLog(l => [...l, { id: Date.now().toString(), ...newEntry }])
    setNewEntry({ date: '', subject: '', what: '', type: 'formative', score: 0, outOf: 100, notes: '' })
  }

  return (
    <MainLayout>
      <Header title="Grade Tracking" subtitle="Monitor your predicted performance and set targets" />
      <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Target style={{ width: '22px', height: '22px', color: '#a78bfa' }} />
            </div>
            {editingGoal ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <input
                  type="number" min={24} max={45}
                  value={goalPoints}
                  onChange={e => setGoalPoints(Number(e.target.value))}
                  className="input-dark"
                  style={{ width: '80px', textAlign: 'center', fontSize: '36px', fontWeight: 800, padding: '4px 8px' }}
                />
                <button onClick={() => setEditingGoal(false)}>
                  <Check style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <p style={{ fontSize: '52px', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>{goalPoints}</p>
                <button onClick={() => setEditingGoal(true)} style={{ opacity: 0.5, marginTop: '4px' }}>
                  <Edit3 style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                </button>
              </div>
            )}
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 4px' }}>Your Goal</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>out of 45</p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <TrendingUp style={{ width: '22px', height: '22px', color: '#34d399' }} />
            </div>
            <p style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1, color: predictedTotal >= goalPoints ? '#34d399' : '#fbbf24' }}>{predictedTotal}</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 4px' }}>Predicted Total</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>subjects + matrix</p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Zap style={{ width: '22px', height: '22px', color: '#fbbf24' }} />
            </div>
            <p style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1, color: pointsLeft > 0 ? '#fbbf24' : '#34d399' }}>
              {pointsLeft > 0 ? pointsLeft : '✓'}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 4px' }}>Points Left</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pointsLeft > 0 ? 'until goal' : 'Goal reached!'}</p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Award style={{ width: '22px', height: '22px', color: '#67e8f9' }} />
            </div>
            <p style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1, color: matrixBonus === 3 ? '#34d399' : matrixBonus > 0 ? '#67e8f9' : '#4e5e78' }}>
              +{matrixBonus}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 4px' }}>Matrix Bonus</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOK/EE bonus pts</p>
          </div>
        </div>

        {/* Progress banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <TrendingUp style={{ width: '18px', height: '18px', color: '#a78bfa', flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
              {predictedTotal >= goalPoints
                ? <><span style={{ color: '#34d399', fontWeight: 700 }}>On track!</span> Predicted {predictedTotal} pts — above your goal of {goalPoints}. Keep it up.</>
                : <><span style={{ color: '#fbbf24', fontWeight: 700 }}>{pointsLeft} pts to go.</span> Focus on {grades.filter(g => g.likely < g.goal).map(g => g.name.split(':')[0]).slice(0, 2).join(' & ') || 'your weakest subjects'} to close the gap.</>
              }
            </p>
          </div>
          <input
            value={universityAim}
            onChange={e => setUniversityAim(e.target.value)}
            placeholder="University offer (e.g. UCL CS: 38 pts)"
            className="input-dark"
            style={{ width: '260px', fontSize: '13px', flexShrink: 0 }}
          />
        </div>

        {/* Main grid: subjects table + TOK/EE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>

          {/* Subject Grades */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '20px' }}>Subject Grades</h3>
            {grades.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Subject', 'Level', 'Goal', 'Predicted', 'IA %', 'Mock %'].map(h => (
                        <th key={h} style={{ paddingBottom: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', paddingRight: '16px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, i) => (
                      <tr key={grade.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 16px 14px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '3px', height: '32px', borderRadius: '2px', background: getSubjectAccent(i), flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{grade.name.split(':')[0]}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px 14px 0' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                            background: grade.level === 'HL' ? 'rgba(124,58,237,0.2)' : 'rgba(6,182,212,0.15)',
                            color: grade.level === 'HL' ? '#c4b5fd' : '#67e8f9',
                            border: `1px solid ${grade.level === 'HL' ? 'rgba(124,58,237,0.3)' : 'rgba(6,182,212,0.25)'}`,
                          }}>
                            {grade.level}
                          </span>
                        </td>
                        {(['goal', 'likely'] as const).map(field => (
                          <td key={field} style={{ padding: '14px 16px 14px 0' }}>
                            <select
                              value={grade[field]}
                              onChange={e => updateGrade(grade.name, field, Number(e.target.value))}
                              className="select-dark"
                              style={{ width: '60px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: gradeColor(grade[field] as number), padding: '6px 8px', fontWeight: 700, fontSize: '14px', borderRadius: '8px' }}
                            >
                              {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                        ))}
                        {(['ia', 'mock'] as const).map(field => (
                          <td key={field} style={{ padding: '14px 16px 14px 0' }}>
                            <input
                              type="number" min={0} max={100}
                              value={grade[field] || ''}
                              onChange={e => updateGrade(grade.name, field, Number(e.target.value))}
                              placeholder="—"
                              className="input-dark"
                              style={{ width: '72px', padding: '6px 8px', fontSize: '13px' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No subjects yet. Complete onboarding to add subjects.</p>
              </div>
            )}
          </div>

          {/* TOK & EE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '20px' }}>TOK & EE Matrix</h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>TOK Grade</label>
                  <select value={tokGrade} onChange={e => setTokGrade(e.target.value)} className="select-dark" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '10px 12px', fontSize: '14px', fontWeight: 700, borderRadius: '8px' }}>
                    {['A', 'B', 'C', 'D'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>EE Grade</label>
                  <select value={eeGrade} onChange={e => setEeGrade(e.target.value)} className="select-dark" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '10px 12px', fontSize: '14px', fontWeight: 700, borderRadius: '8px' }}>
                    {['A', 'B', 'C', 'D', 'E'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', marginBottom: '20px', background: matrixBonus === 3 ? 'rgba(16,185,129,0.1)' : 'rgba(124,58,237,0.1)', border: `1px solid ${matrixBonus === 3 ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.3)'}` }}>
                <p style={{ fontSize: '36px', fontWeight: 800, color: matrixBonus === 3 ? '#34d399' : '#a78bfa', lineHeight: 1 }}>+{matrixBonus}</p>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Bonus Points</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>TOK {tokGrade} + EE {eeGrade}</p>
                </div>
              </div>

              {/* Matrix table */}
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ padding: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>TOK\EE</div>
                  {['A','B','C','D','E'].map(g => <div key={g} style={{ padding: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{g}</div>)}
                </div>
                {['A','B','C','D'].map(tok => (
                  <div key={tok} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ padding: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{tok}</div>
                    {['A','B','C','D','E'].map(ee => {
                      const val = TOK_EE_MATRIX[tok]?.[ee] ?? 0
                      const isActive = tok === tokGrade && ee === eeGrade
                      return (
                        <div key={ee} style={{ padding: '8px', fontSize: '12px', fontWeight: 700, color: val === 3 ? '#34d399' : val === 2 ? '#fbbf24' : val === 1 ? '#a78bfa' : 'rgba(255,255,255,0.15)', background: isActive ? 'rgba(124,58,237,0.25)' : 'transparent' }}>{val}</div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Log */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Assessment Log</h3>
          </div>

          {/* Add Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 120px auto', gap: '10px', marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <input type="date" value={newEntry.date} onChange={e => setNewEntry(n => ({ ...n, date: e.target.value }))} className="input-dark" style={{ fontSize: '13px' }} />
            <select value={newEntry.subject} onChange={e => setNewEntry(n => ({ ...n, subject: e.target.value }))} className="select-dark" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
              <option value="">Subject</option>
              {grades.map(g => <option key={g.name} value={g.name}>{g.name.split(':')[0]}</option>)}
            </select>
            <input placeholder="Assessment name" value={newEntry.what} onChange={e => setNewEntry(n => ({ ...n, what: e.target.value }))} className="input-dark" style={{ fontSize: '13px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input type="number" placeholder="Score" value={newEntry.score || ''} onChange={e => setNewEntry(n => ({ ...n, score: Number(e.target.value) }))} className="input-dark" style={{ width: '52px', fontSize: '13px', padding: '10px 8px', textAlign: 'center' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/</span>
              <input type="number" placeholder="100" value={newEntry.outOf || ''} onChange={e => setNewEntry(n => ({ ...n, outOf: Number(e.target.value) }))} className="input-dark" style={{ width: '52px', fontSize: '13px', padding: '10px 8px', textAlign: 'center' }} />
            </div>
            <button onClick={addLog} className="btn-primary" style={{ fontSize: '13px', padding: '10px 16px' }}>Add</button>
          </div>

          {/* Log Table */}
          {log.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Date', 'Subject', 'Assessment', 'Score', '%', ''].map(h => (
                    <th key={h} style={{ paddingBottom: '10px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', paddingRight: '16px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.map(entry => {
                  const pct = entry.outOf > 0 ? Math.round((entry.score / entry.outOf) * 100) : 0
                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>{entry.date}</td>
                      <td style={{ padding: '12px 16px 12px 0', fontSize: '13px', fontWeight: 600, color: '#fff' }}>{entry.subject.split(':')[0]?.split(' ')[0]}</td>
                      <td style={{ padding: '12px 16px 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{entry.what}</td>
                      <td style={{ padding: '12px 16px 12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>{entry.score}/{entry.outOf}</td>
                      <td style={{ padding: '12px 16px 12px 0' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: pct >= 70 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171' }}>{pct}%</span>
                      </td>
                      <td style={{ padding: '12px 0' }}>
                        <button onClick={() => setLog(l => l.filter(e => e.id !== entry.id))} style={{ opacity: 0.5 }}>
                          <X style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: '13px', textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>No assessments logged yet. Add one above.</p>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
