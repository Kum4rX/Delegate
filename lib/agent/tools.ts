import { tool } from 'ai'
import { z } from 'zod'
import { readEmails } from '@/lib/tools/readEmails'
import { draftReply } from '@/lib/tools/draftReply'
import { getCalendarEvents } from '@/lib/tools/getCalendarEvents'
import { createEvent, deleteEvent } from '@/lib/tools/createOrDeleteEvent'

/**
 * Returns all agent tools bound to the given userId.
 * Each tool fetches a fresh token from Token Vault internally.
 */
export function buildTools(userId: string) {
  return {
    readEmails: tool({
      description: 'Read and summarise Gmail messages. Use for: checking inbox, finding emails from a person, searching for a thread.',
      parameters: z.object({
        query:      z.string().optional().describe('Gmail search query e.g. "is:unread from:boss@co.com"'),
        maxResults: z.number().optional().describe('Max emails to return, default 10'),
      }),
      execute: async ({ query, maxResults }) =>
        readEmails(userId, { query, maxResults }),
    }),

    draftReply: tool({
      description: 'Compose and send an email. Requires step-up confirmation from the user before sending.',
      parameters: z.object({
        to:       z.string().describe('Recipient email address'),
        subject:  z.string().describe('Email subject line'),
        body:     z.string().describe('Email body in plain text'),
        threadId: z.string().optional().describe('Thread ID if replying to an existing thread'),
      }),
      execute: async ({ to, subject, body, threadId }) =>
        draftReply({ userId, to, subject, body, threadId }),
    }),

    getCalendarEvents: tool({
      description: 'Fetch upcoming calendar events. Use for: checking schedule, finding a meeting, seeing availability.',
      parameters: z.object({
        timeMin:    z.string().optional().describe('Start of range, ISO 8601. Defaults to now.'),
        timeMax:    z.string().optional().describe('End of range, ISO 8601. Defaults to tomorrow.'),
        maxResults: z.number().optional().describe('Max events to return, default 20'),
      }),
      execute: async ({ timeMin, timeMax, maxResults }) =>
        getCalendarEvents(userId, { timeMin, timeMax, maxResults }),
    }),

    createEvent: tool({
      description: 'Create a new calendar event.',
      parameters: z.object({
        summary:     z.string().describe('Event title'),
        start:       z.string().describe('Start time, ISO 8601'),
        end:         z.string().describe('End time, ISO 8601'),
        attendees:   z.array(z.string()).optional().describe('List of attendee email addresses'),
        description: z.string().optional().describe('Event description or agenda'),
      }),
      execute: async ({ summary, start, end, attendees, description }) =>
        createEvent({ userId, summary, start, end, attendees, description }),
    }),

    deleteEvent: tool({
      description: 'Delete a calendar event. Requires step-up confirmation from the user.',
      parameters: z.object({
        eventId: z.string().describe('Google Calendar event ID'),
        summary: z.string().describe('Event title — shown in the confirmation prompt'),
      }),
      execute: async ({ eventId, summary }) =>
        deleteEvent({ userId, eventId, summary }),
    }),
  }
}
