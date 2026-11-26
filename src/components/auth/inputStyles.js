export const INPUT_CLASSES =
  'block h-12 w-full rounded-xl border bg-white px-4 text-sm text-ink placeholder:text-slate-400 shadow-xs transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-4'

export function inputStateClasses(hasError) {
  return hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
    : 'border-brand-soft/40 hover:border-brand-soft/70 focus:border-brand-500 focus:ring-brand-500/15'
}
