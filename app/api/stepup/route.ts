import { getSession } from '@auth0/nextjs-auth0'
import { requestStepUp } from '@/lib/auth/stepup'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const { action, detail, bindingMessage } = await req.json()

  const result = await requestStepUp({
    userId: session.user.sub,
    action,
    detail,
    bindingMessage: bindingMessage ?? 'CONFIRM',
  })

  return Response.json(result)
}
