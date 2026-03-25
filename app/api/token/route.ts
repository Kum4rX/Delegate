import { getSession } from '@auth0/nextjs-auth0'
import { getGoogleToken } from '@/lib/auth/tokenVault'
import { NextRequest } from 'next/server'

/**
 * Returns metadata about the user's active Token Vault token.
 * Used by the permissions dashboard to show scope + expiry info.
 * Note: never returns the raw access_token to the client.
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  try {
    const token = await getGoogleToken(session.user.sub)
    return Response.json({
      active: true,
      scope: token.scope,
      token_type: token.token_type,
      // expires_in returned so client can show expiry — not the token itself
      expires_in: token.expires_in,
    })
  } catch (err) {
    return Response.json({ active: false, error: String(err) }, { status: 200 })
  }
}
