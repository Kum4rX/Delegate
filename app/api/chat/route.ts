import { getSession } from '@auth0/nextjs-auth0'
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextRequest } from 'next/server'
import { buildTools } from '@/lib/agent/tools'
import { SYSTEM_PROMPT } from '@/lib/agent/prompt'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.sub as string
  const { messages } = await req.json()

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: SYSTEM_PROMPT,
      messages,
      tools: buildTools(userId),
      maxSteps: 5,
    })
    return result.toDataStreamResponse()
  } catch (err) {
    console.error('[agent error]', err)
    return new Response('Agent error', { status: 500 })
  }
}
