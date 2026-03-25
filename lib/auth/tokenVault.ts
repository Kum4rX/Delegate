/**
 * tokenVault.ts
 * 
 * Single source of truth for fetching Google tokens from Auth0 Token Vault.
 * Every tool calls getGoogleToken() — nothing else in the app ever holds
 * a raw Google credential.
 */

const TOKEN_VAULT_URL = `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/token-vault/tokens`

export type GoogleToken = {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

/**
 * Retrieves a fresh Google OAuth token for the given user from Auth0 Token Vault.
 * Auth0 handles refresh automatically — caller always gets a valid token.
 */
export async function getGoogleToken(userId: string): Promise<GoogleToken> {
  const mgmtToken = await getManagementToken()

  const res = await fetch(
    `${TOKEN_VAULT_URL}/${encodeURIComponent(userId)}/google-oauth2`,
    {
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token Vault error (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data as GoogleToken
}

/**
 * Gets a short-lived Auth0 Management API token using client credentials.
 * Used only server-side to call Token Vault on behalf of the user.
 */
async function getManagementToken(): Promise<string> {
  const res = await fetch(
    `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
      }),
    }
  )

  if (!res.ok) throw new Error('Failed to fetch management token')
  const { access_token } = await res.json()
  return access_token
}
