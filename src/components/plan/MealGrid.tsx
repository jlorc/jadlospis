import { useApp } from '../../context/AppContext'
import { duplicateDay } from '../../context/AppContext'
import { MealCard } from './MealCard'

export function MealGrid() {
  const { activePlan, state, commit } = useApp()

  const mealCount = activePlan.days[0]?.meals.length ?? 0

  return (
    <div className="min-w-0 flex-1 overflow-auto pb-28">
      <div
        className="grid w-full gap-3"
        style={{
          gridTemplateColumns: `repeat(${activePlan.days.length}, minmax(200px, 1fr))`,
        }}
      >
        {activePlan.days.map((day) => (
          <div key={day.id} className="min-w-0">
            <div className="sticky top-0 z-10 mb-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50/95 px-2 py-2 backdrop-blur">
              <h3 className="truncate font-semibold text-slate-800">
                {day.label}
              </h3>
              <button
                type="button"
                title="Duplikuj dzień"
                onClick={() => commit((s) => duplicateDay(s, day.id))}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-brand-700"
              >
                Duplikuj
              </button>
            </div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateRows: `repeat(${mealCount}, minmax(148px, auto))`,
              }}
            >
              {day.meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  selected={state.selectedMealId === meal.id}
                  onSelect={() =>
                    commit(
                      (s) => ({
                        ...s,
                        selectedDayId: day.id,
                        selectedMealId: meal.id,
                        editPanelOpen: true,
                      }),
                      false,
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
