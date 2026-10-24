import type { Meal } from '../../types'
import { mealMacros } from '../../lib/nutrition'
import { productsMap } from '../../data/productGenerator'
import { dishesMap } from '../../data/dishes'
import { compareToTarget } from '../../lib/nutrition'
import { fmtNum } from '../../lib/format'
import { StatusDot } from '../ui/StatusDot'
import { useMemo } from 'react'

interface MealCardProps {
  meal: Meal
  selected: boolean
  onSelect: () => void
}

export function MealCard({ meal, selected, onSelect }: MealCardProps) {
  const pmap = useMemo(() => productsMap(), [])
  const dmap = useMemo(() => dishesMap(), [])
  const macros = mealMacros(meal, pmap, dmap)
  const kcalNorm = compareToTarget(macros.kcal, meal.targetKcal)

  const summary =
    meal.entries.length === 0
      ? 'Kliknij, aby dodać produkty lub potrawy'
      : meal.entries.length === 1
        ? entryLabel(meal.entries[0], pmap, dmap)
        : `${meal.entries.length} pozycji`

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-full min-h-[148px] w-full flex-col rounded-xl border p-3 text-left transition shadow-sm ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-100 bg-white'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{meal.name}</p>
          <p className="text-xs text-slate-500">{meal.time}</p>
        </div>
        <StatusDot status={kcalNorm.status} />
      </div>

      <div className="mt-2 flex items-baseline gap-1 text-sm">
        <span className="font-bold text-slate-900">
          {Math.round(macros.kcal)}
        </span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-600">{meal.targetKcal} kcal</span>
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-600">
        {summary}
      </p>

      <dl className="mt-2 grid grid-cols-3 gap-1 border-t border-slate-100 pt-2 text-[11px]">
        <div>
          <dt className="text-slate-400">Białko</dt>
          <dd className="font-medium text-slate-800">{fmtNum(macros.protein)} g</dd>
        </div>
        <div>
          <dt className="text-slate-400">Tłuszcz</dt>
          <dd className="font-medium text-slate-800">{fmtNum(macros.fat)} g</dd>
        </div>
        <div>
          <dt className="text-slate-400">Węgle</dt>
          <dd className="font-medium text-slate-800">{fmtNum(macros.carbs)} g</dd>
        </div>
      </dl>
    </button>
  )
}

function entryLabel(
  entry: Meal['entries'][0],
  pmap: Map<string, { name: string }>,
  dmap: Map<string, { name: string }>,
) {
  if (entry.kind === 'product') {
    const p = pmap.get(entry.productId)
    return `${p?.name ?? '?'} (${entry.grams} g)`
  }
  const d = dmap.get(entry.dishId)
  return `${d?.name ?? '?'} (${entry.portions} por.)`
}
