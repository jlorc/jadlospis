import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { productsMap } from '../../data/productGenerator'
import { dishesMap } from '../../data/dishes'
import {
  addMacros,
  compareMacros,
  dayMacros,
  emptyMacros,
  macroTargetsFromKcal,
  targetKcal,
} from '../../lib/nutrition'
import { NormChip } from './NormChip'

export function StickyNormsBar() {
  const { activePatient, activePlan, state } = useApp()
  const pmap = useMemo(() => productsMap(), [])
  const dmap = useMemo(() => dishesMap(), [])

  const selectedDay = activePlan.days.find((d) => d.id === state.selectedDayId)

  const dailyActual = selectedDay
    ? dayMacros(selectedDay, pmap, dmap)
    : emptyMacros()

  const weeklyActual = activePlan.days.reduce(
    (acc, day) => addMacros(acc, dayMacros(day, pmap, dmap)),
    emptyMacros(),
  )

  const dayCount = activePlan.days.length || 1
  const weeklyTargetScale = dayCount
  const dailyTarget = macroTargetsFromKcal(
    targetKcal(activePatient),
    activePatient.macroSplit,
  )
  const weeklyTarget = {
    ...dailyTarget,
    kcal: dailyTarget.kcal * weeklyTargetScale,
    protein: dailyTarget.protein * weeklyTargetScale,
    fat: dailyTarget.fat * weeklyTargetScale,
    carbs: dailyTarget.carbs * weeklyTargetScale,
    fiber: dailyTarget.fiber * weeklyTargetScale,
  }

  const dailyNorms = compareMacros(dailyActual, dailyTarget)
  const weeklyNorms = compareMacros(weeklyActual, weeklyTarget)

  const dayLabel = selectedDay?.label ?? '—'

  return (
    <div
      className="no-print sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1920px] px-4 py-3 lg:px-6">
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
          <span className="text-slate-700">Bilans odżywczy</span>
          <span className="hidden sm:inline">|</span>
          <span>
            Normy dobowe — <strong className="text-slate-800">{dayLabel}</strong>
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">
            Normy tygodniowe ({dayCount}{' '}
            {dayCount === 1 ? 'dzień' : 'dni'})
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <section aria-label="Normy dobowe">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Dobowe
            </div>
            <div className="flex flex-wrap gap-2">
              <NormChip label="Energia" unit="kcal" norm={dailyNorms.kcal} compact />
              <NormChip label="Białko" unit="g" norm={dailyNorms.protein} compact />
              <NormChip label="Tłuszcz" unit="g" norm={dailyNorms.fat} compact />
              <NormChip label="Węglowodany" unit="g" norm={dailyNorms.carbs} compact />
              <NormChip label="Błonnik" unit="g" norm={dailyNorms.fiber} compact />
            </div>
          </section>
          <section aria-label="Normy tygodniowe" className="hidden lg:block">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Tygodniowe (suma)
            </div>
            <div className="flex flex-wrap gap-2">
              <NormChip label="Energia" unit="kcal" norm={weeklyNorms.kcal} compact />
              <NormChip label="Białko" unit="g" norm={weeklyNorms.protein} compact />
              <NormChip label="Tłuszcz" unit="g" norm={weeklyNorms.fat} compact />
              <NormChip label="Węglowodany" unit="g" norm={weeklyNorms.carbs} compact />
              <NormChip label="Błonnik" unit="g" norm={weeklyNorms.fiber} compact />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
