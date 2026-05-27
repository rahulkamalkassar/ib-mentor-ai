import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { sourceContent, unitName, subjectName, type } = await request.json()

    const prompts: Record<string, string> = {
      notes: `Create comprehensive IB study notes for ${subjectName} - ${unitName}.
Based on: ${sourceContent}

Structure the notes with:
- Key concepts and definitions
- Important formulas/theories
- Examples and applications
- IB exam tips and command terms
- Common mistakes to avoid
Format with clear headers and bullet points.`,

      slides: `Create a study slide deck outline for ${subjectName} - ${unitName}.
Based on: ${sourceContent}

Create 8-12 slides with:
- Slide title
- Key points (3-5 per slide)
- One example or application per slide
- Visual description (what diagram/chart would help)`,

      audio: `Write a conversational audio overview script for ${subjectName} - ${unitName}.
Based on: ${sourceContent}

Write as if explaining to a student in a friendly, engaging way. Include:
- Hook/intro (30 seconds)
- Key concept explanations
- Real-world examples
- Quick recap
Total length: about 3-5 minutes of speech.`,
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompts[type] || prompts.notes,
      }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ content: content.text })
  } catch (error) {
    console.error('Note generation error:', error)
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 })
  }
}
