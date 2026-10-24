import type { NormComparison } from '../../types'
import { fmtNum, fmtSignedPct } from '../../lib/format'
import { StatusDot } from '../ui/StatusDot'

interface NormChipProps {
  label: string
  unit: string
  norm: NormComparison
  compact?: boolean
}

export function NormChip({ label, unit, norm, compact }: NormChipProps) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border border-slate-200 bg-white px-3 py-2 ${compact ? 'text-xs' : 'text-sm'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium text-slate-600">{label}</span>
        <StatusDot status={norm.status} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-slate-900">
          {fmtNum(norm.actual)} {unit}
        </span>
        <span
          className={`shrink-0 text-xs font-medium ${
            norm.status === 'ok'
              ? 'text-emerald-600'
              : norm.status === 'warn'
                ? 'text-amber-600'
                : 'text-rose-600'
          }`}
        >
          {fmtSignedPct(norm.deviationPct)}
        </span>
      </div>
      <span className="text-[11px] text-slate-400">
        Cel: {fmtNum(norm.target)} {unit}
      </span>
    </div>
  )
}
