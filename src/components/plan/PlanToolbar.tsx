import { useApp } from '../../context/AppContext'
import { setPlanDayCount, duplicateMeal } from '../../context/AppContext'
import { exportPlanPdf } from '../../lib/pdf'

export function PlanToolbar() {
  const {
    state,
    commit,
    canUndo,
    canRedo,
    undo,
    redo,
    activePlan,
    activePatient,
  } = useApp()

  const selectedMealId = state.selectedMealId

  return (
    <header
      className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6"
    >
      <div className="min-w-0 flex-1">
        <input
          className="w-full max-w-xl truncate border-0 bg-transparent text-lg font-semibold text-slate-900 outline-none focus:ring-0"
          value={activePlan.name}
          onChange={(e) =>
            commit((s) => ({
              ...s,
              plans: s.plans.map((p) =>
                p.id === activePlan.id ? { ...p, name: e.target.value } : p,
              ),
            }))
          }
        />
        <p className="text-sm text-slate-500">
          {activePlan.days.length}{' '}
          {activePlan.days.length === 1 ? 'dzień' : 'dni'} · typ: tradycyjny ·
          pacjent: {activePatient.name}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Dni:
          <select
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            value={activePlan.days.length}
            onChange={(e) =>
              commit((s) =>
                setPlanDayCount(s, Number(e.target.value), activePatient),
              )
            }
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <div className="flex rounded-lg border border-slate-200 p-0.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={undo}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            title="Cofnij"
          >
            Cofnij
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={redo}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            title="Ponów"
          >
            Ponów
          </button>
        </div>

        <button
          type="button"
          disabled={!selectedMealId}
          onClick={() =>
            selectedMealId &&
            commit((s) => duplicateMeal(s, selectedMealId))
          }
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Duplikuj posiłek
        </button>

        <button
          type="button"
          onClick={() => exportPlanPdf(activePlan, activePatient)}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Eksport PDF
        </button>
      </div>
    </header>
  )
}
