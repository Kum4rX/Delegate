'use client'

import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'

const NAV = [
  { href: '/chat',        label: 'Chat',        icon: '💬' },
  { href: '/permissions', label: 'Permissions',  icon: '🔐' },
]

export default function Sidebar({ active }: { active: string }) {
  const { user } = useUser()

  return (
    <aside className="w-52 bg-[#080810] border-r border-white/[0.06] flex flex-col py-7 px-4 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center
                        text-white text-sm font-semibold">
          D
        </div>
        <span className="text-white font-medium text-base">Delegate</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === label.toLowerCase()
                ? 'bg-indigo-500/12 text-indigo-300'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-base" style={{ fontSize: 15 }}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {user && (
        <div className="px-2 pt-4 border-t border-white/[0.06]">
          <div className="text-xs text-gray-600 truncate font-mono">{user.email}</div>
          <a
            href="/api/auth/logout"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors mt-1 block"
          >
            Sign out
          </a>
        </div>
      )}
    </aside>
  )
}
