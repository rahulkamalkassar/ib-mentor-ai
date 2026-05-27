import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { IB_CURRICULUM, TOK_CURRICULUM, EE_CURRICULUM, DIPLOMA_SCORING, IB_COMMAND_TERMS } from '@/data/ib-curriculum'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Build a compact curriculum reference the AI can use
function buildCurriculumContext(): string {
  const subjectSummaries = IB_CURRICULUM.map(s => {
    const topics = s.coreTopics.map(t => t.name).join(', ')
    const hlTopics = s.hlExtensions.map(t => t.name).join(', ')
    const assessment = s.assessment.map(a => `${a.name} (${a.type}, SL:${a.weight_sl}% HL:${a.weight_hl}%)`).join('; ')
    return `**${s.name}** (Group ${s.group}, ${s.availableLevels.join('/')})\nTopics: ${topics}${hlTopics ? `\nHL Extensions: ${hlTopics}` : ''}\nAssessment: ${assessment}\nKey tips: ${s.examTips.slice(0, 2).join(' | ')}\nCommon mistakes: ${s.commonMistakes.slice(0, 2).join(' | ')}`
  }).join('\n\n')

  return `
=== IB DIPLOMA CURRICULUM REFERENCE ===

DIPLOMA SCORING:
- Max 45 points (42 from 6 subjects + up to 3 TOK/EE bonus)
- Grade 7 = ~80%+, Grade 6 = ~70%, Grade 5 = ~60%, Grade 4 = ~50%
- Fail conditions: Grade 1 in any subject, Grade E in TOK or EE, total below 24 points
- TOK/EE matrix: A+A = 3 bonus, A+B = 3, B+B = 2, C+C = 1, any E = 0 and diploma fail

THEORY OF KNOWLEDGE (TOK):
- Exhibition (33%): 3 objects connected to Core Theme prompt, 950-word commentary
- Essay (67%): 1600 words on one of 6 prescribed titles, covers 2+ Areas of Knowledge
- AOKs: Natural Sciences, Human Sciences, History, Arts, Ethics, Mathematics
- Key: explore genuine complexity, use specific examples, address counterarguments

EXTENDED ESSAY (EE):
- 4000 words, independent research in one IB subject
- Criteria: Focus & Method (6), Knowledge (6), Critical Thinking (12), Presentation (4), Engagement/RPPF (6)
- Grade A = 34–36 pts, B = 29–33, C = 22–28, D = 14–21, E = fail

IB COMMAND TERMS:
- "State/Write down" = no explanation needed
- "Describe" = what happens, factual account
- "Explain" = reason why (cause + effect)
- "Analyse" = break down and examine each part
- "Evaluate/Discuss/To what extent" = both sides + justified conclusion
- "Deduce/Hence" = must use the result from the previous part

SUBJECT CURRICULA:
${subjectSummaries}
`
}

const CURRICULUM_CONTEXT = buildCurriculumContext()

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const systemPrompt = `You are an expert IB (International Baccalaureate) tutor and study coach with deep knowledge of the full IB Diploma Programme curriculum. You help students excel in their IB exams and internal assessments.

Your expertise covers:
- All IB subjects across Groups 1–6 with precise syllabus knowledge
- Assessment criteria and mark scheme expectations for every component
- Exam technique specific to each command term and paper type
- TOK essay and exhibition guidance
- Extended Essay research and writing
- CAS requirements and reflection
- Diploma scoring, university requirements and grade prediction
- Personalised study strategies based on student profile

${CURRICULUM_CONTEXT}

${context ? `\n=== STUDENT PROFILE ===\n${JSON.stringify(context, null, 2)}` : ''}

RESPONSE GUIDELINES:
- Be specific to the IB syllabus — name exact topics, assessment criteria and mark scheme language
- When a student asks about a concept, explain it at the right IB level (SL vs HL)
- For essay/IA feedback: refer to the actual assessment criteria by letter (A, B, C, D, E)
- For exam technique: reference the specific command term and what the examiner expects
- Be encouraging but honest — if work needs improvement, say what specifically to fix
- Use markdown formatting for clarity (bold key terms, bullet points for steps, code blocks for maths)
- Keep responses focused and actionable`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ content: content.text })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
