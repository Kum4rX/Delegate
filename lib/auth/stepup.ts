/**
 * stepup.ts
 *
 * Implements Auth0 CIBA (Client-Initiated Backchannel Authentication).
 * Called before any destructive action — send email, delete event.
 * Agent pauses and waits for the user to confirm on their device.
 */

export type StepUpRequest = {
  userId: string
  action: string       // human-readable e.g. "Send email to priya@co.com"
  detail: string       // full description shown in confirm card
  bindingMessage: string // short code shown on both screens
}

export type StepUpResult =
  | { approved: true;  token: string }
  | { approved: false; reason: string }

/**
 * Initiates a CIBA auth request and polls until the user approves or denies.
 * Returns approved + auth token, or rejected reason.
 */
export async function requestStepUp(req: StepUpRequest): Promise<StepUpResult> {
  // Step 1: Initiate backchannel authentication
  const cibaRes = await fetch(
    `${process.env.AUTH0_ISSUER_BASE_URL}/bc-authorize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
        login_hint: JSON.stringify({ format: 'iss_sub', sub: req.userId }),
        scope: 'openid',
        binding_message: req.bindingMessage,
        request_expiry: '120',
      }),
    }
  )

  if (!cibaRes.ok) {
    const err = await cibaRes.text()
    return { approved: false, reason: `CIBA initiation failed: ${err}` }
  }

  const { auth_req_id, expires_in, interval = 5 } = await cibaRes.json()

  // Step 2: Poll token endpoint until approved/denied/expired
  const deadline = Date.now() + expires_in * 1000

  while (Date.now() < deadline) {
    await sleep(interval * 1000)

    const tokenRes = await fetch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:openid:params:grant-type:ciba',
          client_id: process.env.AUTH0_CLIENT_ID!,
          client_secret: process.env.AUTH0_CLIENT_SECRET!,
          auth_req_id,
        }),
      }
    )

    const body = await tokenRes.json()

    if (tokenRes.ok) {
      return { approved: true, token: body.access_token }
    }

    if (body.error === 'access_denied') {
      return { approved: false, reason: 'User denied the request' }
    }

    if (body.error === 'expired_token') {
      return { approved: false, reason: 'Confirmation timed out' }
    }

    // authorization_pending — keep polling
  }

  return { approved: false, reason: 'Step-up timed out' }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
