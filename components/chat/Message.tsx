'use client'

import type { MessageType } from './ChatWindow'

export default function Message({ message }: { message: MessageType }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center
                        text-white text-xs font-semibold mr-2.5 mt-0.5 shrink-0">
          D
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-white/[0.05] text-gray-200 rounded-tl-sm'
        }`}
      >
        {message.content || <span className="text-gray-600 italic">thinking...</span>}
      </div>
    </div>
  )
}
