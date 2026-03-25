'use client'

import { useState } from 'react'

type Props = { onSend: (text: string) => void; disabled: boolean }

const SUGGESTIONS = [
  'Summarise my unread emails',
  'What meetings do I have tomorrow?',
  'Draft a reply to the last email from my manager',
  'Cancel my 3pm and send an apology',
]

export default function InputBar({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className="px-6 pb-6">
      {/* Suggestion chips — only show when input is empty */}
      {!value && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => onSend(s)}
              disabled={disabled}
              className="text-xs text-gray-500 border border-white/[0.07] bg-white/[0.02]
                         hover:bg-white/[0.05] hover:text-gray-300 px-3 py-1.5 rounded-full
                         transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3 bg-white/[0.04] border border-white/[0.08]
                      rounded-2xl px-4 py-3 focus-within:border-indigo-500/40 transition-colors">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder="Ask Delegate anything..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600
                     resize-none outline-none leading-relaxed max-h-32 disabled:opacity-50"
          style={{ minHeight: 24 }}
        />
        <button
          onClick={submit}
          disabled={!value.trim() || disabled}
          className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/[0.06]
                     disabled:text-gray-600 text-white rounded-xl flex items-center justify-center
                     shrink-0 transition-colors text-sm"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
