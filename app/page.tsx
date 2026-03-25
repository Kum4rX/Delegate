'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) router.push('/chat')
  }, [user, isLoading, router])

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30
                        rounded-full px-4 py-1.5 mb-8 text-indigo-300 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Built with Auth0 Token Vault
        </div>

        <h1 className="font-serif text-6xl text-white mb-4 leading-none tracking-tight">
          Dele<span className="text-indigo-400 italic">gate</span>
        </h1>

        <p className="text-gray-500 text-lg mb-10 leading-relaxed font-light">
          Your AI chief of staff for Gmail and Calendar.
          <br />
          Acts on your behalf — never holds your keys.
        </p>

        <a
          href="/api/auth/login?returnTo=/chat"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                     text-white px-8 py-3 rounded-xl font-medium transition-colors text-sm"
        >
          Sign in with Google
          <span className="text-indigo-300">→</span>
        </a>

        <p className="text-gray-700 text-xs mt-6 font-mono">
          Gmail + Calendar scopes · revocable at any time
        </p>
      </div>
    </main>
  )
}
