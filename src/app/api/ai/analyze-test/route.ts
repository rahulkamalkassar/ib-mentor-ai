import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, testTitle, subject, level, totalMarks, paperContent } = await request.json()

    const imageContent = (imageUrls || []).map((url: string) => ({
      type: 'image' as const,
      source: { type: 'url' as const, url },
    }))

    const paperContext = paperContent
      ? `\n\nTHE EXAM PAPER THE STUDENT ANSWERED:\n${'─'.repeat(60)}\n${paperContent}\n${'─'.repeat(60)}\n`
      : ''

    const markingPrompt = `You are a senior IB examiner marking a ${subject} ${level} ${testTitle || 'paper'}.
${paperContext}
Analyse the student's handwritten answers in the uploaded images and return a full examiner report.

MARKING REPORT FORMAT:

## Overall Result
- **Score**: X / ${totalMarks} marks
- **Percentage**: X%
- **IB Grade**: [1–7] (with boundary explanation)
- **Examiner comment**: One sentence overall impression

---

## Question-by-Question Breakdown

For each question you can identify in the photos:

### Question [N](a/b/c) — [X] marks available
**Awarded**: X marks
**What the student wrote**: [brief summary]
**Mark scheme criteria met**:
- ✓ [criterion met]
**Mark scheme criteria missed**:
- ✗ [criterion missed + what was needed]
**Examiner note**: [specific IB examiner-style comment]

---

## Overall Examiner Feedback

### Strengths
- [specific strength 1]
- [specific strength 2]

### Areas for Improvement
- [specific improvement 1 with how to address it]
- [specific improvement 2]
- [specific improvement 3]

### IB Examiner Advice
[2–3 sentences on exam technique specific to this paper type and subject]

### Grade Boundary Reference
| Grade | Marks (approx) |
|-------|---------------|
| 7     | ${Math.round(totalMarks * 0.85)}–${totalMarks} |
| 6     | ${Math.round(totalMarks * 0.71)}–${Math.round(totalMarks * 0.84)} |
| 5     | ${Math.round(totalMarks * 0.59)}–${Math.round(totalMarks * 0.70)} |
| 4     | ${Math.round(totalMarks * 0.47)}–${Math.round(totalMarks * 0.58)} |
| 3     | ${Math.round(totalMarks * 0.35)}–${Math.round(totalMarks * 0.46)} |
| 2     | ${Math.round(totalMarks * 0.20)}–${Math.round(totalMarks * 0.34)} |
| 1     | 0–${Math.round(totalMarks * 0.19)} |

Be specific, use IB examiner language, and reference the actual mark scheme criteria where possible.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: imageContent.length > 0
          ? [...imageContent, { type: 'text' as const, text: markingPrompt }]
          : [{ type: 'text' as const, text: markingPrompt + '\n\n[Note: No images were provided. Generate a sample marking report based on the paper content above, assuming average student performance.]' }],
      }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ feedback: content.text })
  } catch (error) {
    console.error('Test analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze test' }, { status: 500 })
  }
}
