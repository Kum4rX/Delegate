import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'
import ChatWindow from '@/components/chat/ChatWindow'
import Sidebar from '@/components/Sidebar'

export default async function ChatPage() {
  const session = await getSession()
  if (!session) redirect('/api/auth/login?returnTo=/chat')

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <Sidebar active="chat" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  )
}
