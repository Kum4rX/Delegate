import { getGoogleToken } from '@/lib/auth/tokenVault'
import { requestStepUp } from '@/lib/auth/stepup'

type DraftReplyArgs = {
  userId: string
  to: string
  subject: string
  body: string
  threadId?: string
}

type DraftReplyResult =
  | { status: 'sent'; messageId: string }
  | { status: 'step_up_denied'; reason: string }
  | { status: 'error'; message: string }

/**
 * Sends an email reply after step-up confirmation.
 * CIBA flow pauses execution until the user approves on their device.
 */
export async function draftReply(args: DraftReplyArgs): Promise<DraftReplyResult> {
  const { userId, to, subject, body, threadId } = args

  // Step-up required before sending anything
  const stepUp = await requestStepUp({
    userId,
    action: `Send email to ${to}`,
    detail: `Subject: "${subject}" — Delegate will send this email on your behalf.`,
    bindingMessage: 'SEND-EMAIL',
  })

  if (!stepUp.approved) {
    return { status: 'step_up_denied', reason: stepUp.reason }
  }

  const { access_token } = await getGoogleToken(userId)

  // Build RFC 2822 raw message
  const raw = btoa(
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
    body
  ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const payload: Record<string, string> = { raw }
  if (threadId) payload.threadId = threadId

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return { status: 'error', message: `Gmail send error: ${err}` }
  }

  const { id } = await res.json()
  return { status: 'sent', messageId: id }
}
