import { handleAuth, handleLogin } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      // Request Google scopes at login time via Auth0 connection
      connection: 'google-oauth2',
      connection_scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ].join(' '),
      access_type: 'offline', // needed to get refresh token
      prompt: 'consent',
    },
  }),
})
