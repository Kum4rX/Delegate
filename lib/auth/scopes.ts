/**
 * scopes.ts
 * Minimum viable Google scopes for Delegate.
 * Principle of least privilege — only request what you actually use.
 */

export const GOOGLE_SCOPES = {
  GMAIL_READ:     'https://www.googleapis.com/auth/gmail.readonly',
  GMAIL_SEND:     'https://www.googleapis.com/auth/gmail.send',
  GMAIL_COMPOSE:  'https://www.googleapis.com/auth/gmail.compose',
  CALENDAR_READ:  'https://www.googleapis.com/auth/calendar.readonly',
  CALENDAR_WRITE: 'https://www.googleapis.com/auth/calendar.events',
} as const

export const ALL_SCOPES = Object.values(GOOGLE_SCOPES).join(' ')

/** Actions that require step-up confirmation before executing */
export const STEP_UP_ACTIONS = ['sendEmail', 'deleteEvent'] as const
export type StepUpAction = typeof STEP_UP_ACTIONS[number]

export function requiresStepUp(toolName: string): boolean {
  return STEP_UP_ACTIONS.includes(toolName as StepUpAction)
}
