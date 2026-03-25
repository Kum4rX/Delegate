import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ScopeCard from '@/components/permissions/ScopeCard'
import ActivityLog from '@/components/permissions/ActivityLog'

export default async function PermissionsPage() {
  const session = await getSession()
  if (!session) redirect('/api/auth/login?returnTo=/permissions')
  return (
    <div className="flex h-screen bg-[#0d0d14] text-white overflow-hidden">
      <Sidebar active="permissions" />
      <main className="flex-1 overflow-y-auto p-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-medium text-white">Agent permissions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Delegate's access to your Google account — managed via Auth0 Token Vault
            </p>
          </div>
          <a
            href="/api/auth/logout"
            className="text-xs text-red-400 border border-red-400/20 bg-red-400/5
                       hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors"
          >
            Revoke all &amp; sign out
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { value: '2', label: 'Active integrations' },
            { value: '0', label: 'Tokens stored in app', accent: true },
            { value: '47', label: 'Actions this week' },
            { value: '100%', label: 'Destructive actions confirmed', accent: true },
          ].map(({ value, label, accent }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
              <div className={`text-2xl font-semibold ${accent ? 'text-emerald-400' : 'text-white'}`}>
                {value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Scope cards + activity */}
        <div className="flex gap-4">
          <div className="flex-[1.2] flex flex-col gap-4">
            <ScopeCard
              service="Gmail"
              emoji="📧"
              scopes={['gmail.readonly', 'gmail.send', 'gmail.compose']}
              badges={['read', 'send', 'send requires confirm']}
              grantedAt="12 Mar 2026"
            />
            <ScopeCard
              service="Google Calendar"
              emoji="📅"
              scopes={['calendar.readonly', 'calendar.events']}
              badges={['read', 'create', 'delete', 'delete requires confirm']}
              grantedAt="12 Mar 2026"
            />
          </div>
          <div className="flex-[0.8]">
            <ActivityLog />
          </div>
        </div>

      </main>
    </div>
  )
}
