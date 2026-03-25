'use client'

const MOCK_ACTIVITY = [
  { type: 'read',    text: 'Read 12 unread emails',          time: '2m ago',  confirmed: false },
  { type: 'send',    text: 'Send email — confirmed by you',  time: '14m ago', confirmed: true  },
  { type: 'create',  text: 'Created calendar event',         time: '1h ago',  confirmed: false },
  { type: 'delete',  text: 'Delete event — confirmed by you',time: '2h ago',  confirmed: true  },
  { type: 'read',    text: 'Read calendar for tomorrow',     time: '3h ago',  confirmed: false },
  { type: 'draft',   text: 'Drafted reply to Priya',         time: '4h ago',  confirmed: false },
]

const DOT: Record<string, string> = {
  read:   'bg-emerald-400',
  send:   'bg-amber-400',
  create: 'bg-emerald-400',
  delete: 'bg-amber-400',
  draft:  'bg-indigo-400',
}

export default function ActivityLog() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 h-full">
      <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4">
        Recent activity
      </div>
      <div className="flex flex-col gap-0">
        {MOCK_ACTIVITY.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
          >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[a.type]}`} />
            <div className="flex-1 text-sm text-gray-400">
              <span className="text-gray-200">{a.text.split('—')[0].trim()}</span>
              {a.text.includes('—') && (
                <span className="text-gray-600"> — {a.text.split('—')[1].trim()}</span>
              )}
            </div>
            <div className="text-[11px] text-gray-700 font-mono shrink-0">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
