import { getGoogleToken } from '@/lib/auth/tokenVault'
import { requestStepUp } from '@/lib/auth/stepup'

type CreateEventArgs = {
  userId: string
  summary: string
  start: string
  end: string
  attendees?: string[]
  description?: string
}

type DeleteEventArgs = {
  userId: string
  eventId: string
  summary: string
}

type EventResult =
  | { status: 'created'; eventId: string }
  | { status: 'deleted' }
  | { status: 'step_up_denied'; reason: string }
  | { status: 'error'; message: string }

export async function createEvent(args: CreateEventArgs): Promise<EventResult> {
  const { userId, summary, start, end, attendees = [], description } = args
  const { access_token } = await getGoogleToken(userId)

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: start },
        end:   { dateTime: end },
        attendees: attendees.map(email => ({ email })),
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return { status: 'error', message: `Calendar create error: ${err}` }
  }

  const { id } = await res.json()
  return { status: 'created', eventId: id }
}

export async function deleteEvent(args: DeleteEventArgs): Promise<EventResult> {
  const { userId, eventId, summary } = args

  const stepUp = await requestStepUp({
    userId,
    action: `Delete calendar event: "${summary}"`,
    detail: `Delegate will permanently delete "${summary}" from your calendar.`,
    bindingMessage: 'DEL-EVENT',
  })

  if (!stepUp.approved) {
    return { status: 'step_up_denied', reason: stepUp.reason }
  }

  const { access_token } = await getGoogleToken(userId)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${access_token}` },
    }
  )

  if (!res.ok && res.status !== 204) {
    const err = await res.text()
    return { status: 'error', message: `Calendar delete error: ${err}` }
  }

  return { status: 'deleted' }
}
