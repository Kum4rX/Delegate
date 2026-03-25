import { getGoogleToken } from '@/lib/auth/tokenVault'

export type CalendarEvent = {
  id: string
  summary: string
  start: string
  end: string
  attendees: string[]
  location?: string
  description?: string
}

/**
 * Fetches calendar events for a given date range.
 */
export async function getCalendarEvents(
  userId: string,
  options: { timeMin?: string; timeMax?: string; maxResults?: number } = {}
): Promise<CalendarEvent[]> {
  const { access_token } = await getGoogleToken(userId)

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const params = new URLSearchParams({
    timeMin:    options.timeMin  ?? now.toISOString(),
    timeMax:    options.timeMax  ?? tomorrow.toISOString(),
    maxResults: String(options.maxResults ?? 20),
    singleEvents: 'true',
    orderBy: 'startTime',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)
  const data = await res.json()

  return (data.items ?? []).map((e: any) => ({
    id: e.id,
    summary: e.summary ?? '(no title)',
    start: e.start?.dateTime ?? e.start?.date ?? '',
    end:   e.end?.dateTime   ?? e.end?.date   ?? '',
    attendees: (e.attendees ?? []).map((a: any) => a.email),
    location: e.location,
    description: e.description,
  }))
}
