import { getSession } from '@auth0/nextjs-auth0'

export async function GET() {
  const session = await getSession()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  return Response.json({
    integrations: [
      {
        service: 'Gmail',
        connected: true,
        scopes: ['gmail.readonly', 'gmail.send', 'gmail.compose'],
        grantedAt: '2026-03-12',
      },
      {
        service: 'Google Calendar',
        connected: true,
        scopes: ['calendar.readonly', 'calendar.events'],
        grantedAt: '2026-03-12',
      },
    ],
  })
}
