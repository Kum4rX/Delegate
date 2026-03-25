'use client'

import { useState } from 'react'

type Props = {
  service: string
  emoji: string
  scopes: string[]
  badges: string[]
  grantedAt: string
}

const BADGE_STYLES: Record<string, string> = {
  'read':                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'send':                    'bg-amber-500/10  text-amber-400  border-amber-500/20',
  'create':                  'bg-amber-500/10  text-amber-400  border-amber-500/20',
  'delete':                  'bg-red-500/10    text-red-400    border-red-500/15',
  'send requires confirm':   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'delete requires confirm': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function ScopeCard({ service, emoji, scopes, badges, grantedAt }: Props) {
  const [enabled, setEnabled] = useState(true)

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center
                        text-lg shrink-0">
          {emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-200 mb-1">{service}</div>
          <div className="text-xs text-gray-600 font-mono mb-3">{scopes.join(' · ')}</div>
          <div className="flex flex-wrap gap-1.5">
            {badges.map(b => (
              <span
                key={b}
                className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono
                  ${BADGE_STYLES[b] ?? 'bg-white/5 text-gray-500 border-white/10'}`}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setEnabled(p => !p)}
          className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 mt-1 ${
            enabled ? 'bg-emerald-500' : 'bg-white/10'
          }`}
          style={{ height: 22, width: 40 }}
          aria-label={`Toggle ${service}`}
        >
          <span
            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
            style={{ transform: enabled ? 'translateX(20px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.04] text-[11px] text-gray-700 font-mono">
        Granted via Auth0 · {grantedAt} · Token managed by Vault · auto-refreshes
      </div>
    </div>
  )
}
