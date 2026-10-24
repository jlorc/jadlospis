import type { DeviationStatus } from '../../types'

const styles: Record<DeviationStatus, string> = {
  ok: 'bg-emerald-500 text-white',
  warn: 'bg-amber-400 text-amber-950',
  bad: 'bg-rose-500 text-white',
}

const labels: Record<DeviationStatus, string> = {
  ok: 'W normie',
  warn: 'Lekkie odchylenie',
  bad: 'Poza normą',
}

export function StatusDot({
  status,
  className = '',
}: {
  status: DeviationStatus
  className?: string
}) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${styles[status]} ${className}`}
      title={labels[status]}
      aria-label={labels[status]}
    >
      {status === 'ok' ? '✓' : status === 'warn' ? '~' : '!'}
    </span>
  )
}
