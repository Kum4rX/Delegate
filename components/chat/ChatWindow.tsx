'use client'

import { useState, useRef, useEffect } from 'react'
import Message from './Message'
import ConfirmCard from './ConfirmCard'
import InputBar from './InputBar'

export type MessageType = {
  id: string
  role: 'user' | 'assistant'
  content: string
  confirmRequest?: {
    action: string
    detail: string
    onConfirm: () => void
    onCancel: () => void
  }
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm Delegate. I can read your Gmail, draft replies, check your calendar, and schedule or cancel meetings — just ask in plain English.",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    const userMsg: MessageType = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)

        // Check for step-up signal from server
        if (chunk.includes('__STEPUP__')) {
          const parsed = JSON.parse(chunk.replace('__STEPUP__', ''))
          setMessages(prev => prev.map(m =>
            m.id === assistantId
              ? {
                  ...m,
                  content: parsed.preview,
                  confirmRequest: {
                    action: parsed.action,
                    detail: parsed.detail,
                    onConfirm: () => confirmAction(assistantId, parsed.token),
                    onCancel: () => cancelAction(assistantId),
                  },
                }
              : m
          ))
          setIsLoading(false)
          return
        }

        full += chunk
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m))
      }
    } catch (e) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.' } : m
      ))
    }

    setIsLoading(false)
  }

  async function confirmAction(msgId: string, token: string) {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, confirmRequest: undefined, content: m.content + '\n\n_Confirmed — executing..._' } : m
    ))
    await fetch('/api/stepup/confirm', { method: 'POST', body: JSON.stringify({ token }) })
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, content: m.content.replace('_Confirmed — executing..._', '_Done._') } : m
    ))
  }

  function cancelAction(msgId: string) {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, confirmRequest: undefined, content: m.content + '\n\n_Action cancelled._' } : m
    ))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm text-gray-400">Delegate</span>
        <span className="text-xs text-gray-700 font-mono ml-auto">Gmail + Calendar</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id}>
            <Message message={msg} />
            {msg.confirmRequest && (
              <ConfirmCard
                action={msg.confirmRequest.action}
                detail={msg.confirmRequest.detail}
                onConfirm={msg.confirmRequest.onConfirm}
                onCancel={msg.confirmRequest.onCancel}
              />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-1.5 pl-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <InputBar onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
