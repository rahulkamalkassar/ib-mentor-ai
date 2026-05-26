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
  // Step 0
  programme: string
  // Step 1
  subjects: OnboardingSubject[]
  subjectGoalGrades: Record<string, number>
  // Step 2 – Goals
  goalPoints: number
  universityAim: string
  backupUniversity: string
  careerInterest: string
  challenges: string[]
  // Step 3 – Academic standing
  selfAssessment: string
  biggestWorries: string[]
  // Step 4 – Study schedule
  studyHours: number
  studyTimes: string[]
  sessionLength: number
  studyEnvironment: string[]
  examProximity: string
  // Step 5 – IA / EE / TOK (DP only)
  iaStatus: Record<string, string>
  eeSubject: string
  eeStatus: string
  tokEssayStatus: string
  casHours: number
  // Step 6 – Weak topics
  weakTopics: Record<string, string[]>
  // Step 7 – Exam prep
  examTimeManagement: string
  examFears: string[]
  mockGrades: Record<string, number>
  // Step 8 – Resources & learning
  learningStyles: string[]
  resourcePreferences: string[]
  noteTakingStyle: string
  // Step 9 – AI setup
  aiPersonality: string
  motivationStyle: string
  responseLength: string
  checkInFrequency: string
}

export interface OnboardingSubject {
  name: string
  group: string
  level: 'HL' | 'SL'
  selected: boolean
}
