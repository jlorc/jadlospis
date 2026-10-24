import { useApp, updatePatientInState, addPatient } from '../../context/AppContext'
import { bmi, bmr, cpm, macroTargetsFromKcal, targetKcal } from '../../lib/nutrition'
import { fmtNum } from '../../lib/format'

export function PatientSidebar() {
  const { state, commit, activePatient } = useApp()

  const tk = targetKcal(activePatient)
  const macros = macroTargetsFromKcal(tk, activePatient.macroSplit)
  const bmiVal = bmi(activePatient.weightKg, activePatient.heightCm)

  const update = (patch: Parameters<typeof updatePatientInState>[2]) => {
    commit((s) => updatePatientInState(s, activePatient.id, patch))
  }

  const mealPercentSum = activePatient.mealSplits.reduce(
    (a, m) => a + m.percent,
    0,
  )

  return (
    <aside
      className="no-print flex w-full shrink-0 flex-col gap-4 border-b border-slate-200 bg-white p-4 lg:w-72 lg:border-b-0 lg:border-r xl:w-80"
    >
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Pacjenci
        </h2>
        <ul className="mt-2 space-y-1">
          {state.patients.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() =>
                  commit((s) => {
                    const plan =
                      s.plans.find((pl) => pl.patientId === p.id) ??
                      s.plans[0]
                    return {
                      ...s,
                      activePatientId: p.id,
                      activePlanId: plan.id,
                      selectedDayId: plan.days[0]?.id ?? null,
                      selectedMealId: plan.days[0]?.meals[0]?.id ?? null,
                      editPanelOpen: false,
                    }
                  })
                }
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  p.id === state.activePatientId
                    ? 'bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-100'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => commit(addPatient)}
          className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-brand-500 hover:text-brand-700"
        >
          + Dodaj pacjenta
        </button>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Dane i cele
        </h2>
        <label className="block text-sm">
          <span className="text-slate-500">Imię i nazwisko</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            value={activePatient.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            <span className="text-slate-500">Waga (kg)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={activePatient.weightKg}
              onChange={(e) =>
                update({ weightKg: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Wzrost (cm)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={activePatient.heightCm}
              onChange={(e) =>
                update({ heightCm: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Wiek</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={activePatient.age}
              onChange={(e) => update({ age: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Płeć</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={activePatient.sex}
              onChange={(e) =>
                update({ sex: e.target.value as 'female' | 'male' })
              }
            >
              <option value="female">Kobieta</option>
              <option value="male">Mężczyzna</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-500">PAL (aktywność)</span>
          <input
            type="number"
            step="0.05"
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            value={activePatient.pal}
            onChange={(e) => update({ pal: Number(e.target.value) || 1.2 })}
          />
        </label>

        <dl className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
          <div>
            <dt className="text-slate-500">BMI</dt>
            <dd className="font-semibold text-slate-900">{fmtNum(bmiVal)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">PPM</dt>
            <dd className="font-semibold">{Math.round(bmr(activePatient))} kcal</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-500">CPM (wydatek)</dt>
            <dd className="font-semibold">{cpm(activePatient)} kcal</dd>
          </div>
        </dl>

        <label className="block text-sm">
          <span className="text-slate-500">Cel energetyczny (kcal)</span>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            value={activePatient.targetKcalOverride ?? cpm(activePatient)}
            onChange={(e) =>
              update({
                targetKcalOverride: Number(e.target.value) || undefined,
              })
            }
          />
        </label>

        <div>
          <span className="text-sm text-slate-500">Makroskładniki (%)</span>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(['protein', 'fat', 'carbs'] as const).map((key) => (
              <label key={key} className="text-xs">
                <span className="text-slate-400">
                  {key === 'protein' ? 'Białko' : key === 'fat' ? 'Tłuszcz' : 'Węgle'}
                </span>
                <input
                  type="number"
                  className="mt-0.5 w-full rounded-md border border-slate-200 px-2 py-1"
                  value={activePatient.macroSplit[key]}
                  onChange={(e) =>
                    update({
                      macroSplit: {
                        ...activePatient.macroSplit,
                        [key]: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            ≈ {Math.round(macros.protein)} g białka, {Math.round(macros.fat)} g
            tłuszczu, {Math.round(macros.carbs)} g węgli / dzień
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Posiłki (% energii)</span>
            <span
              className={`text-xs ${mealPercentSum === 100 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              Σ {mealPercentSum}%
            </span>
          </div>
          <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
            {activePatient.mealSplits.map((m, i) => (
              <li
                key={`${m.name}-${i}`}
                className="grid grid-cols-[1fr_3rem_4rem] gap-1 text-xs"
              >
                <input
                  className="rounded border border-slate-200 px-1.5 py-1"
                  value={m.name}
                  onChange={(e) => {
                    const mealSplits = [...activePatient.mealSplits]
                    mealSplits[i] = { ...m, name: e.target.value }
                    update({ mealSplits })
                  }}
                />
                <input
                  type="number"
                  className="rounded border border-slate-200 px-1 py-1 text-center"
                  value={m.percent}
                  onChange={(e) => {
                    const mealSplits = [...activePatient.mealSplits]
                    mealSplits[i] = {
                      ...m,
                      percent: Number(e.target.value) || 0,
                    }
                    update({ mealSplits })
                  }}
                />
                <input
                  className="rounded border border-slate-200 px-1 py-1"
                  value={m.time}
                  onChange={(e) => {
                    const mealSplits = [...activePatient.mealSplits]
                    mealSplits[i] = { ...m, time: e.target.value }
                    update({ mealSplits })
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
