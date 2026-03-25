'use client'

type Props = {
  action: string
  detail: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmCard({ action, detail, onConfirm, onCancel }: Props) {
  return (
    <div className="ml-8 mt-2 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 max-w-[80%]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
          ⚠ Step-up confirmation required
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{detail}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs px-4 py-1.5
                     rounded-lg font-medium transition-colors"
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-300 border border-white/10 text-xs
                     px-4 py-1.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
