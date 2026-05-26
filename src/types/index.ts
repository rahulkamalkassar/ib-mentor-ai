export interface Profile {
  id: string
  user_id: string
  programme: 'MYP Year 4' | 'MYP Year 5' | 'DP Year 1' | 'DP Year 2'
  exam_session: string
  goal_points: number
  university_aim: string
  challenge: string[]
  study_hours_per_week: number
  study_times: string[]
  exam_proximity: string
  learning_styles: string[]
  ai_personality: 'strict exam coach' | 'friendly tutor' | 'concise and fast'
  onboarding_complete: boolean
}

export interface Subject {
  id: string
  user_id: string
  name: string
  group: string
  level: 'HL' | 'SL'
  color_accent: string
  icon: string
}

export interface Unit {
  id: string
  subject_id: string
  name: string
  code: string
  weak_topics: string[]
}

export interface Source {
  id: string
  unit_id: string
  title: string
  type: 'pdf' | 'link' | 'note'
  url: string
  content: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  type: 'exam' | 'summative' | 'formative' | 'IA' | 'oral' | 'study' | 'school' | 'eca' | 'plan'
  subject_id: string
  date: string
  time: string
  endTime?: string
  description: string
  subjectColor?: string
  recurring?: boolean
}

export interface ScheduleBlock {
  id: string
  type: 'school' | 'eca'
  title: string
  days: number[]   // 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun
  startTime: string
  endTime: string
  color?: string
}

export interface Grade {
  id: string
  user_id: string
  subject_id: string
  level: 'HL' | 'SL'
  goal_grade: number
  likely_grade: number
  ia_score: number
  mock_score: number
}

export interface TokEe {
  id: string
  user_id: string
  matrix_bonus: number
  tok_grade: string
  ee_grade: string
}

export interface AssessmentLog {
  id: string
  user_id: string
  subject_id: string
  date: string
  what_it_was: string
  type: string
  score: number
  out_of: number
  percentage: number
  notes: string
}

export interface PracticeTest {
  id: string
  title: string
  subject: string
  level: 'HL' | 'SL'
  paper_type: string
  duration_minutes: number
  pdf_url: string
  tags: string[]
}

export interface TestAttempt {
  id: string
  user_id: string
  test_id: string
  started_at: string
  submitted_at: string
  score: number
  feedback: string
  image_urls: string[]
}

export interface UpgradePlan {
  id: string
  name: string
  price: number
  period: string
  features: string[]
}

export interface OnboardingData {
  programme: string
  subjects: OnboardingSubject[]
  goalPoints: number
  universityAim: string
  challenges: string[]
  studyHours: number
  studyTimes: string[]
  examProximity: string
  weakTopics: Record<string, string[]>
  learningStyles: string[]
  aiPersonality: string
}

export interface OnboardingSubject {
  name: string
  group: string
  level: 'HL' | 'SL'
  selected: boolean
}
