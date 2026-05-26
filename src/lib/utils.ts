import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUBJECT_ACCENTS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']

export function getSubjectAccent(index: number): string {
  return SUBJECT_ACCENTS[index % SUBJECT_ACCENTS.length]
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const EVENT_COLORS: Record<string, string> = {
  exam: '#ef4444',
  summative: '#f59e0b',
  formative: '#06b6d4',
  IA: '#10b981',
  oral: '#ec4899',
  study: '#7c3aed',
  school: '#475569',
  eca: '#06b6d4',
  plan: '#8b5cf6',
}

export function gradeColor(grade: number): string {
  if (grade >= 6) return '#10b981'
  if (grade >= 5) return '#f59e0b'
  if (grade >= 4) return '#06b6d4'
  return '#ef4444'
}
