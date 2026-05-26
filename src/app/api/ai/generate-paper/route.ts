import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Durations in minutes [SL, HL]
const PAPER_DURATIONS: Record<string, Record<string, [number, number]>> = {
  'Paper 1': {
    'Mathematics': [90, 120], 'Physics': [45, 60], 'Chemistry': [45, 60],
    'Biology': [45, 60], 'Economics': [75, 75], 'History': [60, 60],
    'Geography': [75, 75], 'Psychology': [90, 90], 'Computer Science': [90, 90],
    'Business': [75, 75], 'Environmental Systems': [60, 60],
    'English A': [90, 120], 'English B': [75, 90],
  },
  'Paper 2': {
    'Mathematics': [90, 120], 'Physics': [75, 135], 'Chemistry': [75, 135],
    'Biology': [75, 135], 'Economics': [105, 105], 'History': [90, 90],
    'Geography': [90, 105], 'Psychology': [90, 120], 'Computer Science': [75, 90],
    'Business': [95, 120], 'Environmental Systems': [45, 45],
    'English A': [90, 120], 'English B': [75, 90],
  },
  'Paper 3': {
    'Mathematics': [60, 60], 'Physics': [60, 60], 'Chemistry': [60, 60],
    'Biology': [60, 60], 'Economics': [75, 75], 'History': [150, 150],
    'Geography': [105, 105], 'Psychology': [60, 60], 'Computer Science': [60, 60],
  },
}

const TOTAL_MARKS: Record<string, Record<string, [number, number]>> = {
  'Paper 1': {
    'Mathematics': [80, 110], 'Physics': [30, 40], 'Chemistry': [30, 40],
    'Biology': [30, 40], 'Economics': [25, 25], 'History': [30, 30],
    'Geography': [40, 40], 'Psychology': [35, 35], 'Computer Science': [40, 40],
    'Business': [25, 25], 'Environmental Systems': [35, 35],
    'English A': [20, 20], 'English B': [40, 40],
  },
  'Paper 2': {
    'Mathematics': [80, 110], 'Physics': [50, 72], 'Chemistry': [50, 72],
    'Biology': [50, 72], 'Economics': [40, 50], 'History': [45, 45],
    'Geography': [40, 50], 'Psychology': [44, 44], 'Computer Science': [45, 65],
    'Business': [50, 60], 'Environmental Systems': [30, 30],
    'English A': [25, 25], 'English B': [50, 50],
  },
  'Paper 3': {
    'Mathematics': [55, 55], 'Physics': [35, 35], 'Chemistry': [35, 35],
    'Biology': [35, 35], 'Economics': [50, 50], 'History': [60, 60],
    'Geography': [40, 40], 'Psychology': [30, 30], 'Computer Science': [30, 30],
  },
}

function getSubjectKey(subject: string): string {
  const keys = Object.keys(PAPER_DURATIONS['Paper 1'])
  return keys.find(k => subject.toLowerCase().includes(k.toLowerCase())) || 'Mathematics'
}

export function getPaperInfo(subject: string, level: 'SL' | 'HL', paperType: string): { duration: number; totalMarks: number } {
  const key = getSubjectKey(subject)
  const levelIdx = level === 'SL' ? 0 : 1
  const duration = PAPER_DURATIONS[paperType]?.[key]?.[levelIdx] ?? 90
  const totalMarks = TOTAL_MARKS[paperType]?.[key]?.[levelIdx] ?? 80
  return { duration, totalMarks }
}

const SUBJECT_PAPER_RULES: Record<string, string> = {
  Mathematics: `Paper 1: No calculator allowed. Short response and extended response questions.
Paper 2: Graphic display calculator required. Short response and extended response questions.
Paper 3 (HL only): Two extended-response problem-solving questions.
Use command terms: Find, Calculate, Prove, Show that, Hence, Sketch, Determine.`,

  Physics: `Paper 1: Multiple choice only — 4-option MCQ, single best answer.
Paper 2: Short answer (Section A) and extended response (Section B). Include data-based questions.
Paper 3 (HL only): Data analysis question + section on HL optional topics.
Use command terms: State, Define, Describe, Explain, Outline, Deduce, Derive.`,

  Chemistry: `Paper 1: Multiple choice only — 4-option MCQ, single best answer.
Paper 2: Short answer and extended response including data analysis, calculations.
Paper 3 (HL only): Data analysis + questions on HL additional topics.
Use command terms: State, Define, Identify, Describe, Explain, Distinguish, Compare, Evaluate.`,

  Biology: `Paper 1: Multiple choice only — 4-option MCQ, single best answer.
Paper 2: Structured short answer (Section A) + extended response (Section B).
Paper 3 (HL only): Short answer + HL option content, scientific method question.
Use command terms: State, List, Define, Describe, Explain, Annotate, Draw, Evaluate, Discuss.`,

  Economics: `Paper 1: Two-part question (a) define/explain [10 marks] + (b) evaluate/discuss [15 marks]. Answer ONE.
Paper 2: Data response — stimulus material with structured questions. Answer TWO from four.
Paper 3 (HL only): Extended response essay, analyse/evaluate an economics issue. Answer ONE.
Use command terms: Define, Explain, Discuss, Evaluate, Analyse, To what extent, Examine.`,

  History: `Paper 1: Source analysis — 3 structured questions on 4 primary/secondary sources [25 marks].
Paper 2: Two essay questions from different topics [25+25 marks per essay chosen]. Answer TWO.
Paper 3 (HL only): Three extended essays from one HL regional option [60 marks total]. Answer THREE.
Use command terms: Evaluate, Analyse, Examine, To what extent, Discuss, Compare, Contrast.`,

  Geography: `Paper 1: Core and optional themes — structured responses using maps/graphs/data.
Paper 2: Optional themes — structured and extended response questions.
Paper 3 (HL only): Extended response on HL core extension topics.
Use command terms: Describe, Explain, Suggest, Examine, Evaluate, Discuss, Compare.`,

  Psychology: `Paper 1: Biological approach (3 short answers), Cognitive (3 short answers), Sociocultural (3 short answers). Answer 3 per approach [9+9+9 = 27 marks in exams; here: full structured paper].
Paper 2: Essay questions — one from each approach. Answer TWO. [22 marks each]
Paper 3 (HL only): Qualitative research methods — 3 structured questions on stimulus material.
Use command terms: Describe, Outline, Explain, Evaluate, Discuss, To what extent.`,

  'Computer Science': `Paper 1: Structured questions covering all core topics. Section A and B.
Paper 2: Case study based — pre-released case study questions + programming questions.
Paper 3 (HL only): Higher-level topics — abstract data structures, resource management, control.
Use command terms: State, Define, Describe, Explain, Construct, Trace, Evaluate, Suggest.`,

  Business: `Paper 1: Two structured questions with multiple parts [a-d]. Based on unseen stimulus.
Paper 2: Four to five questions from pre-released case study. Structured responses.
Use command terms: Define, Outline, Explain, Analyse, Evaluate, Justify, Recommend.`,

  'English A': `Paper 1 (Unseen): Guided literary analysis of unseen text(s). SL: one text. HL: two texts comparative.
Paper 2: Comparative essay on two literary works studied. Must reference at least two works.
Use literary command terms: Analyse, Explore, Examine, Compare, Discuss, Evaluate.
Note IB assessment criteria A (Understanding/Interpretation), B (Analysis), C (Focus/Organisation), D (Language).`,

  'English B': `Paper 1: Comprehension — 4 texts on different themes, structured questions testing reading skills.
Paper 2: Writing — TWO written tasks (formal/informal) from specified text types with word counts.
Focus on: register, text type conventions, audience awareness, purpose.`,

  'Environmental Systems': `Paper 1: Short answer MCQ + short answer (Section A) and data-based (Section B).
Paper 2: Data-based and extended response using structured stimuli.
Use command terms: State, Describe, Explain, Evaluate, Discuss, Suggest, Analyse.`,
}

export async function POST(request: NextRequest) {
  try {
    const { subject, level, paperType, topics, difficulty } = await request.json()

    const { duration, totalMarks } = getPaperInfo(subject, level, paperType)
    const subjectKey = getSubjectKey(subject)
    const rules = SUBJECT_PAPER_RULES[subjectKey] || SUBJECT_PAPER_RULES['Mathematics']
    const topicList = topics?.length ? topics.join(', ') : 'all core topics'
    const now = new Date()
    const monthYear = now.toLocaleString('en-GB', { month: 'long', year: 'numeric' })

    const prompt = `Generate a complete, realistic IB ${subject} ${level} ${paperType} practice examination paper.

CONFIGURATION:
- Subject: ${subject}
- Level: ${level}
- Paper Type: ${paperType}
- Topics to cover: ${topicList}
- Difficulty: ${difficulty}
- Time allowed: ${duration} minutes
- Total marks: ${totalMarks}

SUBJECT-SPECIFIC RULES:
${rules}

FORMAT REQUIREMENTS — follow these exactly:
1. Start with a formal IB-style header block:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IB DIPLOMA PROGRAMME
${subject.toUpperCase()}
${level} — ${paperType}
${monthYear}                    Time allowed: ${Math.floor(duration / 60) > 0 ? `${Math.floor(duration / 60)} hour${Math.floor(duration / 60) > 1 ? 's' : ''}` : ''}${duration % 60 > 0 ? ` ${duration % 60} minutes` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS TO CANDIDATES:
• Do not open this paper until instructed to do so.
• Write your answers in the spaces provided.
• [Calculator is permitted / No calculator is permitted — based on paper type]
• The maximum mark for this examination is [${totalMarks}].
• Where appropriate, show all working.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. Use SECTION A, SECTION B, SECTION C dividers with descriptions where applicable
3. Number questions as: 1. (a) [2], 1. (b) [4], 2. (a) [3] etc.
4. Put mark allocations in square brackets after each question: [2] [4] [6] [10]
5. Use correct IB command terms for ${subject}
6. Where a diagram/graph/map is needed, write: [DIAGRAM: brief description of what would appear here]
7. For MCQ questions (Physics/Chemistry/Biology Paper 1), format as:
   A. [option]
   B. [option]
   C. [option]
   D. [option]
8. Leave answer space notation: ............................................. (${difficulty === 'Challenging' ? '8' : '4'} lines)
9. Mark the end: End of ${paperType} — Total: ${totalMarks} marks

QUALITY REQUIREMENTS:
- Questions must be genuinely challenging and IB-appropriate
- Use real IB terminology and syllabus language
- ${difficulty === 'Challenging' ? 'Push higher on Bloom\'s taxonomy — evaluate, analyse, justify' : difficulty === 'Mixed' ? 'Mix recall, understanding and analysis questions' : 'Balance knowledge recall and application'}
- Questions must be answerable based on the IB syllabus (${level})
- Do NOT reference external sources or specific textbooks
- Total marks must add up to exactly ${totalMarks}

Generate the complete paper now:`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({
      paper: content.text,
      duration,
      totalMarks,
      subject,
      level,
      paperType,
      topics,
      difficulty,
    })
  } catch (error) {
    console.error('Paper generation error:', error)
    return NextResponse.json({ error: 'Failed to generate paper' }, { status: 500 })
  }
}
