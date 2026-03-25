import { getGoogleToken } from '@/lib/auth/tokenVault'

type EmailSummary = {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
  unread: boolean
}

/**
 * Fetches and summarises recent emails from Gmail.
 * Token retrieved fresh from Token Vault — never stored locally.
 */
export async function readEmails(
  userId: string,
  options: { maxResults?: number; query?: string } = {}
): Promise<EmailSummary[]> {
  const { access_token } = await getGoogleToken(userId)
  const { maxResults = 10, query = 'is:unread' } = options

  // List messages
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?` +
    new URLSearchParams({ q: query, maxResults: String(maxResults) }),
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!listRes.ok) throw new Error(`Gmail list error: ${listRes.status}`)
  const { messages = [] } = await listRes.json()

  // Fetch each message in parallel
  const emails = await Promise.all(
    messages.map(async ({ id }: { id: string }) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata` +
        `&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      const msg = await msgRes.json()
      const headers: Record<string, string> = {}
      for (const h of msg.payload?.headers ?? []) {
        headers[h.name] = h.value
      }
      return {
        id,
        from: headers['From'] ?? '',
        subject: headers['Subject'] ?? '(no subject)',
        snippet: msg.snippet ?? '',
        date: headers['Date'] ?? '',
        unread: (msg.labelIds ?? []).includes('UNREAD'),
      }
    })
  )

  return emails
}
