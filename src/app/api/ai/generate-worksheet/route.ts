import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const WORKSHEET_PROMPTS: Record<string, string> = {
  'concept-summary': `Create a comprehensive concept summary sheet.
Format:
- Title header with subject, unit, topic, level
- Key concepts section (6–10 bullet points with brief explanations)
- Essential definitions box (5–8 terms with IB-precise definitions)
- Key formulas / theories box (where applicable)
- Worked example (one fully worked example showing process)
- "Remember this!" box — 3 crucial exam tips
- Syllabus references at the bottom`,

  'practice-short': `Create a practice questions worksheet (short answer).
Format:
- 8–12 short answer questions (2–4 marks each)
- Mix of recall, understanding, and application
- Marks shown in brackets [2] [4]
- IB command terms appropriate for the subject
- Answer lines provided (dotted lines, appropriate length)
- Total marks shown at top`,

  'exam-style': `Create an exam-style questions worksheet.
Format:
- 2–3 exam-style questions (8–15 marks each)
- Multi-part questions [(a) (b) (c) structure]
- Appropriate command terms (evaluate, analyse, discuss, to what extent)
- Mark allocations per part shown in brackets
- Higher-order thinking required
- Answer spaces proportional to marks`,

  'key-terms': `Create a vocabulary and key terms reference sheet.
Format:
- Two-column table: TERM | IB DEFINITION
- 15–20 essential terms for this unit
- Group terms by sub-topic if applicable
- Include any relevant formulas/equations alongside terms
- "Self-test" box at bottom: blank version of 5 key terms for student to fill in`,

  'comparison-table': `Create a comparison table worksheet.
Format:
- Identify the 2–4 main concepts/theories/approaches to compare in this topic
- Grid table: Concept names as columns, comparison criteria as rows
- 8–10 comparison rows (characteristics, examples, advantages, limitations, etc.)
- Summary section: "Key Similarities" and "Key Differences" boxes
- Exam tip: how to write effective compare/contrast answers`,

  'diagram-labelling': `Create a diagram labelling exercise worksheet.
Format:
- Title with instructions
- [DIAGRAM: detailed description of what diagram would appear — label all key parts clearly]
- Numbered label lines (10–15 labels minimum)
- Answer key section (folded/separate — just list the answers)
- Extension: "Explain the function of [key part]" short answer question`,

  'case-study': `Create a case study analysis worksheet.
Format:
- Realistic case study stimulus (200–300 words) relevant to this IB topic
- Source attribution note: [Adapted from IB resources]
- 4–6 structured questions using IB command terms
- Mark allocations [2][4][6][8]
- Questions progress from identify/define → explain → analyse → evaluate
- Final question requires linking to the wider topic/theory`,

  'essay-plan': `Create an essay plan template for exam essays.
Format:
- Sample essay question (IB-style, using evaluate/discuss/to what extent)
- Introduction framework:
  • Hook/context sentence starter
  • Definition of key terms
  • Thesis statement template
- Body paragraph structure (PEEL/SEAL format):
  • Point [state your argument]
  • Evidence [specific example/data]
  • Explanation [how it supports the point]
  • Link [back to question]
- Counter-argument paragraph guide
- Conclusion template
- Mark scheme criteria reminder box`,

  'flashcard-set': `Create a printable flashcard set for this unit.
Format:
- 16–20 flashcards arranged in a 4×4 or 4×5 grid on the page
- Each card: dotted border, FRONT side shows term/question, BACK side shows definition/answer
- Print instruction at top: "Cut along dotted lines. Fold in half."
- Cards cover: key terms, key theories, key examples, key formulas
- Difficulty indicator on each card: ★☆☆ / ★★☆ / ★★★`,

  'mind-map': `Create a structured mind map outline for this unit.
Format:
- Central topic in the middle (clearly marked)
- 4–6 main branches (major sub-topics)
- Each branch: 3–5 sub-branches with key points
- Connection arrows noted: "Links to: [other concept]"
- Colour-coding guide at top (suggest colours for each branch)
- Print as text-based tree structure since this is a text worksheet
- At bottom: "Extension: Add your own examples and connections in a different colour"`,
}

export async function POST(request: NextRequest) {
  try {
    const { worksheetType, subjectName, unitName, level, weakTopics } = await request.json()

    const basePrompt = WORKSHEET_PROMPTS[worksheetType] || WORKSHEET_PROMPTS['practice-short']
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const worksheetTitle = worksheetType.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    const weakContext = weakTopics?.length
      ? `\n\nNote: The student has flagged these as weak areas — prioritise them: ${weakTopics.join(', ')}`
      : ''

    const prompt = `You are an experienced IB teacher creating a high-quality student worksheet.

WORKSHEET DETAILS:
- Subject: ${subjectName}
- Unit / Topic: ${unitName}
- IB Level: ${level}
- Worksheet Type: ${worksheetTitle}
${weakContext}

INSTRUCTIONS:
${basePrompt}

FORMATTING REQUIREMENTS:
1. Start with this exact header block:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${subjectName} ${level}
${unitName}
${worksheetTitle} Worksheet
Student: ______________________________    Date: _______________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. Use IB syllabus terminology and command terms for ${subjectName}
3. Include IB assessment objective references where relevant (AO1/AO2/AO3 or equivalent)
4. Make content specific to ${unitName} — not generic
5. All mark allocations must be realistic and add to a clean total
6. Include this footer at the very end:
─────────────────────────────────────────────────────────────
Generated by IB Mentor AI — ibmentorai.com | ${dateStr}
─────────────────────────────────────────────────────────────

Create the complete worksheet now:`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ content: content.text, worksheetType, subjectName, unitName, level })
  } catch (error) {
    console.error('Worksheet generation error:', error)
    return NextResponse.json({ error: 'Failed to generate worksheet' }, { status: 500 })
  }
}
