import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, message }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {message && <p className="max-w-sm text-sm text-slate-600">{message}</p>}
    </div>
  )
}
