import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const systemPrompt = `You are an expert IB (International Baccalaureate) tutor and study coach. You help students with:
- Understanding complex IB concepts across all subjects
- Creating personalized study plans
- Essay writing and TOK/EE guidance
- Practice question help and mark scheme explanations
- Grade prediction and improvement strategies
- Time management and exam technique

${context ? `Student context: ${JSON.stringify(context)}` : ''}

Be encouraging, specific, and always reference IB assessment criteria and mark schemes. Keep responses concise but thorough. Use markdown formatting for clarity.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
