# Delegate — AI Chief of Staff
 
<div align="center">
 
![Delegate Banner](https://img.shields.io/badge/Delegate-AI%20Chief%20of%20Staff-6366f1?style=for-the-badge&logo=anthropic&logoColor=white)
 
[![Built with Auth0](https://img.shields.io/badge/Auth0-Token%20Vault-EB5424?style=flat-square&logo=auth0&logoColor=white)](https://auth0.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Claude](https://img.shields.io/badge/Claude-Sonnet%204-8B5CF6?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
 
**Chat in plain English. Delegate reads your Gmail, drafts replies, checks your calendar,
schedules meetings, and cancels events — all on your behalf.**
 
Auth0 Token Vault holds your Google credentials.
The agent never touches raw tokens.
 
[Live Demo](#) · [Video Walkthrough](#) · [Devpost Submission](#)
 
</div>
 
---
 
## ✨ What is Delegate?
 
Delegate is an AI chief of staff powered by Claude that manages your Gmail and Google Calendar. It's built on top of **Auth0 Token Vault**, which means your Google credentials are stored and refreshed by Auth0 — your application and the agent never hold raw OAuth tokens.
 
```
You: "Cancel my 3pm with Bhanu and send her an apology"
 
Delegate: Found "Product sync with Bhanu" at 3:00 PM today.
 
  ┌─────────────────────────────────────────┐
  │  ⚠  Step-up confirmation required       │
  │                                         │
  │  Send an apology email to bhanu@co.com     │
  │  and delete the calendar event?         │
  │                                         │
  │  [Confirm]          [Cancel]            │
  └─────────────────────────────────────────┘
 
You: Confirm
 
Delegate: Done. Event deleted and apology sent. ✓
```
 
---
 
## 🎯 Core features
 
| Feature | Description |
|---|---|
| 📧 **Read & summarise emails** | Fetches unread Gmail threads and surfaces what matters |
| ✍️ **Draft replies** | Composes emails in your tone, sends only after you confirm |
| 📅 **Check calendar** | Lists upcoming events, finds availability |
| ➕ **Schedule meetings** | Creates calendar events with attendees and descriptions |
| 🗑️ **Cancel events** | Deletes events — always with step-up confirmation |
| 🔐 **Permissions dashboard** | See every scope, toggle access, revoke at any time |
 
---
 
## 🏗️ Architecture
 
### System layers
 
```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                          │
│                                                             │
│   Landing page → Sign in → Chat UI → Permissions dashboard  │
│                                                             │
│   Next.js App Router · React · Tailwind CSS                 │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                  SERVER (Next.js API routes)                 │
│                                                             │
│   /api/auth/[auth0]   Auth0 login / callback / logout       │
│   /api/chat           AI agent streaming endpoint           │
│   /api/token          Token metadata for permissions page   │
│   /api/stepup         Triggers CIBA confirmation flow       │
│   /api/permissions    Returns active scopes                 │
└───────────┬───────────────────────────────────┬─────────────┘
            │  OAuth + Token Vault              │  Claude API
┌───────────▼───────────────┐   ┌───────────────▼─────────────┐
│       AUTH0               │   │       ANTHROPIC              │
│                           │   │                              │
│  Login · Consent          │   │  claude-sonnet-4-20250514    │
│  Token Vault              │   │  Vercel AI SDK streaming     │
│  Step-up auth (CIBA)      │   │                              │
└───────────┬───────────────┘   └─────────────────────────────┘
            │  Scoped Google tokens (server-side only)
┌───────────▼───────────────────────────────────────────────────┐
│                     GOOGLE APIs                               │
│                                                               │
│   Gmail API  (readonly · send · compose)                      │
│   Google Calendar API  (readonly · events)                    │
└───────────────────────────────────────────────────────────────┘
```
 
### Request flow
 
```
User types a message
        │
        ▼
  ChatWindow.tsx ────── POST /api/chat ──────► AI Agent (Claude)
                                                      │
                                           Plans tool calls
                                                      │
                                ┌─────────────────────┤
                                │                     │
                      Risky action?             Safe action?
                      (send/delete)             (read/list)
                                │                     │
                                ▼                     ▼
                       Auth0 CIBA flow        getGoogleToken()
                       User confirms on             │
                       their device                 │
                                │                   │
                                └─────────┬─────────┘
                                          │
                                    Token Vault
                                  returns fresh token
                                          │
                                          ▼
                                   Google API call
                                          │
                                          ▼
                            Result streamed back to UI
```
 
### Token Vault — why it matters
 
```
  WITHOUT Token Vault              WITH Token Vault
  ──────────────────────           ──────────────────────────
  Your DB stores tokens       vs   Auth0 stores tokens
  You write refresh logic     vs   Auth0 refreshes automatically
  Raw tokens in app memory    vs   Agent gets a reference only
  Breach = credentials leak   vs   Breach = no credentials exposed
  Scope management = manual   vs   Scope management = dashboard
  ~1 week to build correctly  vs   ~1 day end-to-end
```
 
---
 
## 🔐 Security model
 
```
  Layer 1 ─── Token Vault credential isolation
               Google OAuth tokens are stored and refreshed by Auth0.
               The agent exchanges a reference, never the raw token.
 
  Layer 2 ─── Minimum viable scopes
               gmail.readonly · gmail.send · gmail.compose
               calendar.readonly · calendar.events
               Nothing broader is ever requested.
 
  Layer 3 ─── Step-up auth for destructive actions
               Sending email or deleting events triggers Auth0 CIBA.
               Agent pauses until the user approves on their device.
 
  Layer 4 ─── One-click revocation
               Permissions dashboard shows all active scopes.
               User can revoke any integration instantly.
```
 
> **Key guarantee:** Raw Google tokens never reach the browser or your database.
> `lib/auth/tokenVault.ts` is the single file that calls Auth0's token exchange —
> every tool imports it. Nothing else in the codebase ever holds a credential.
 
---
 
## 📁 Project structure
 
```
delegate/
├── app/                               Next.js App Router
│   ├── layout.tsx                     Root layout + UserProvider
│   ├── page.tsx                       Landing / login page
│   ├── globals.css                    Global styles
│   ├── chat/
│   │   └── page.tsx                   Chat interface
│   ├── permissions/
│   │   └── page.tsx                   Permissions dashboard
│   └── api/
│       ├── auth/[auth0]/route.ts      Auth0 handler (login · callback · logout)
│       ├── chat/route.ts              Agent streaming endpoint  ◄── main
│       ├── token/route.ts             Token metadata for UI
│       ├── stepup/route.ts            CIBA trigger
│       └── permissions/route.ts      Active scopes list
│
├── components/
│   ├── Sidebar.tsx                    Navigation
│   ├── chat/
│   │   ├── ChatWindow.tsx             Streaming chat + step-up logic
│   │   ├── Message.tsx                Message bubbles
│   │   ├── InputBar.tsx               Input field + suggestion chips
│   │   └── ConfirmCard.tsx            Step-up confirmation UI  ◄── key UX
│   └── permissions/
│       ├── ScopeCard.tsx              Per-service scope + toggle
│       └── ActivityLog.tsx            Recent agent actions
│
├── lib/
│   ├── agent/
│   │   ├── tools.ts                   Vercel AI SDK tool definitions
│   │   └── prompt.ts                  Claude system prompt
│   ├── auth/
│   │   ├── tokenVault.ts              getGoogleToken()  ◄── most important
│   │   ├── stepup.ts                  CIBA request + polling loop
│   │   ├── auth0.ts                   Auth0 SDK config
│   │   └── scopes.ts                  Google scope constants
│   └── tools/
│       ├── readEmails.ts              Gmail read
│       ├── draftReply.ts              Send email + step-up
│       ├── getCalendarEvents.ts       Calendar read
│       └── createOrDeleteEvent.ts    Create / delete + step-up on delete
│
├── proxy.ts                           Route protection
├── .env.example                       Environment variable template
└── README.md                          You are here
```
 
---
 
## 🚀 Getting started
 
### Prerequisites
 
- Node.js 18+
- An [Auth0](https://auth0.com) account (free tier works)
- A [Google Cloud](https://console.cloud.google.com) project with Gmail + Calendar APIs enabled
- An [Anthropic](https://console.anthropic.com) API key
 
### Step 1 — Clone and install
 
```bash
git clone https://github.com/YOUR_USERNAME/delegate.git
cd delegate
npm install
```
 
### Step 2 — Create your Auth0 application
 
1. Go to **Auth0 Dashboard → Applications → Create Application**
2. Choose **Regular Web Application**
3. Under **Settings**, add:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
4. Go to **Authentication → Social** and enable **Google OAuth2**
5. Enable **Token Vault** in your Auth0 tenant settings
 
### Step 3 — Enable Google APIs
 
In [Google Cloud Console](https://console.cloud.google.com):
 
1. Enable **Gmail API** and **Google Calendar API**
2. Add these scopes to your OAuth consent screen:
 
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.compose
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
```
 
### Step 4 — Configure environment
 
```bash
cp .env.example .env.local
```
 
```env
# Auth0 — from your Auth0 dashboard
AUTH0_SECRET=          # run: openssl rand -hex 32
AUTH0_BASE_URL=        # http://localhost:3000
AUTH0_ISSUER_BASE_URL= # https://YOUR_TENANT.us.auth0.com
AUTH0_CLIENT_ID=       # from Auth0 dashboard
AUTH0_CLIENT_SECRET=   # from Auth0 dashboard
AUTH0_AUDIENCE=        # https://YOUR_TENANT.us.auth0.com/api/v2/
 
# Anthropic — from console.anthropic.com
ANTHROPIC_API_KEY=     # sk-ant-...
```
 
### Step 5 — Run
 
```bash
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000), sign in with Google, and start chatting.
 
---
 
## 💬 Example conversations
 
```
"Summarise my unread emails"
→ Reads inbox and returns a summary of each thread
 
"What meetings do I have tomorrow?"
→ Fetches calendar events for the next day
 
"Draft a reply to the last email from my manager"
→ Reads the email, drafts a reply, shows step-up card before sending
 
"Schedule a 30-min call with john@example.com Thursday at 2pm"
→ Creates the calendar event (no step-up needed for create)
 
"Cancel my standup and tell the team I'm sick"
→ Finds the event, shows step-up card, deletes + sends email on confirm
```
 
---
 
## 🧰 Tech stack
 
| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 App Router | Pages, API routes, streaming |
| Language | TypeScript 5 | Type-safe throughout |
| Auth | Auth0 nextjs-auth0 v3 | Login, OAuth, Token Vault |
| AI agent | Vercel AI SDK + Claude Sonnet 4 | Reasoning + tool execution |
| Email | Gmail API | Read, draft, send |
| Calendar | Google Calendar API | Read, create, delete |
| Styling | Tailwind CSS 3 | UI components |
| Deployment | Vercel | Recommended hosting |
 
---
 
## 🚢 Deploy to Vercel
 
```bash
npm install -g vercel
vercel
```
 
Set all `.env.local` variables in your Vercel project settings. Update `AUTH0_BASE_URL` to your production URL and add it to Auth0's allowed callback and logout URLs.
 
---
 
## 📊 Hackathon judging criteria
 
Submitted to the **Authorized to Act** hackathon by Auth0 (2026).
 
| Criterion | What we built |
|---|---|
| 🔒 **Security model** | Token Vault + CIBA step-up for every destructive action. Zero raw tokens in app. |
| 👤 **User control** | `/permissions` dashboard — visible scopes, live toggles, one-click revoke |
| ⚙️ **Technical execution** | Streaming agent, fully typed tools, production error handling |
| 🎨 **Design** | Dark UI, ConfirmCard, activity log, suggestion chips |
| 🌍 **Potential impact** | Reusable pattern for any agentic Google Workspace integration |
| 💡 **Insight value** | Blog post covers token delegation patterns for AI agents in production |
 
---
 
## 📝 License
 
MIT — use freely, attribution appreciated.
 
---
 
<div align="center">
 
Built for the **Authorized to Act** hackathon · Auth0 + Anthropic · 2026
 
</div>
