function Block({ className = '' }) {
  return <div className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}>
    <div className="h-3 w-28 rounded bg-slate-200" />
    <div className="mt-5 h-10 w-32 rounded bg-slate-200" />
    <div className="mt-4 h-3 w-3/4 rounded bg-slate-100" />
  </div>
}

/** Simple first-load placeholder matching the dashboard grid. */
export default function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 lg:grid-cols-3" aria-hidden="true">
      <Block className="lg:col-span-2" />
      <Block />
      <Block />
      <Block />
      <Block />
      <Block className="h-72" />
      <Block className="h-72 lg:col-span-2" />
      <Block className="h-72 lg:col-span-3" />
    </div>
  )
}
