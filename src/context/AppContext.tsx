import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { v4 as uuid } from 'uuid'
import { createInitialState, createPatient, createPlanDay, createSamplePlan } from '../data/defaults'
import {
  loadHistory,
  pushHistory,
  redo,
  type HistoryState,
  undo,
} from '../store/history'
import type { AppState, MealEntry, Patient, PlanDay } from '../types'
import { mealTargetKcal } from '../lib/nutrition'

type Updater = (state: AppState) => AppState

interface AppContextValue {
  state: AppState
  canUndo: boolean
  canRedo: boolean
  commit: (updater: Updater, recordHistory?: boolean) => void
  undo: () => void
  redo: () => void
  activePatient: Patient
  activePlan: AppState['plans'][0]
}

const AppContext = createContext<AppContextValue | null>(null)

function initHistory(): HistoryState {
  const loaded = loadHistory()
  if (loaded) return loaded
  const present = createInitialState()
  const h = { present, past: [], future: [] }
  return h
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryState>(initHistory)

  const commit = useCallback((updater: Updater, recordHistory = true) => {
    setHistory((h) => pushHistory(h, updater(h.present), recordHistory))
  }, [])

  const handleUndo = useCallback(() => {
    setHistory((h) => undo(h) ?? h)
  }, [])

  const handleRedo = useCallback(() => {
    setHistory((h) => redo(h) ?? h)
  }, [])

  const state = history.present

  const activePatient = useMemo(
    () =>
      state.patients.find((p) => p.id === state.activePatientId) ??
      state.patients[0],
    [state],
  )

  const activePlan = useMemo(
    () =>
      state.plans.find((p) => p.id === state.activePlanId) ?? state.plans[0],
    [state],
  )

  const value: AppContextValue = {
    state,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    commit,
    undo: handleUndo,
    redo: handleRedo,
    activePatient,
    activePlan,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp outside provider')
  return ctx
}

export function updatePatientInState(
  state: AppState,
  patientId: string,
  patch: Partial<Patient>,
): AppState {
  const patients = state.patients.map((p) =>
    p.id === patientId ? { ...p, ...patch } : p,
  )
  const patient = patients.find((p) => p.id === patientId)!
  const plans = state.plans.map((plan) => {
    if (plan.patientId !== patientId) return plan
    return {
      ...plan,
      days: plan.days.map((day) => ({
        ...day,
        meals: day.meals.map((meal, i) => {
          const split = patient.mealSplits[i]
          if (!split) return meal
          return {
            ...meal,
            name: split.name,
            time: split.time,
            targetKcal: mealTargetKcal(patient, split.percent),
          }
        }),
      })),
    }
  })
  return { ...state, patients, plans }
}

export function duplicateMeal(state: AppState, mealId: string): AppState {
  const plan = state.plans.find((p) => p.id === state.activePlanId)
  if (!plan) return state
  const days = plan.days.map((day) => {
    const idx = day.meals.findIndex((m) => m.id === mealId)
    if (idx < 0) return day
    const source = day.meals[idx]
    const copy = {
      ...source,
      id: uuid(),
      entries: source.entries.map((e) => ({ ...e, id: uuid() })),
    }
    const meals = [...day.meals]
    meals.splice(idx + 1, 0, copy)
    return { ...day, meals }
  })
  return {
    ...state,
    plans: state.plans.map((p) =>
      p.id === plan.id ? { ...plan, days } : p,
    ),
  }
}

export function duplicateDay(state: AppState, dayId: string): AppState {
  const plan = state.plans.find((p) => p.id === state.activePlanId)
  if (!plan) return state
  const idx = plan.days.findIndex((d) => d.id === dayId)
  if (idx < 0) return state
  const source = plan.days[idx]
  const copy: PlanDay = {
    id: uuid(),
    label: `${source.label} (kopia)`,
    meals: source.meals.map((m) => ({
      ...m,
      id: uuid(),
      entries: m.entries.map((e) => ({ ...e, id: uuid() })),
    })),
  }
  const days = [...plan.days]
  days.splice(idx + 1, 0, copy)
  return {
    ...state,
    plans: state.plans.map((p) => (p.id === plan.id ? { ...plan, days } : p)),
    selectedDayId: copy.id,
  }
}

export function setPlanDayCount(
  state: AppState,
  count: number,
  patient: Patient,
): AppState {
  const plan = state.plans.find((p) => p.id === state.activePlanId)
  if (!plan) return state
  let days = [...plan.days]
  if (count > days.length) {
    for (let i = days.length; i < count; i++) {
      days.push(createPlanDay(patient, `Dzień ${i + 1}`))
    }
  } else {
    days = days.slice(0, count)
  }
  return {
    ...state,
    plans: state.plans.map((p) =>
      p.id === plan.id ? { ...plan, days } : p,
    ),
  }
}

export function addPatient(state: AppState): AppState {
  const patient = createPatient({
    name: `Pacjent ${state.patients.length + 1}`,
  })
  const plan = createSamplePlan(patient)
  return {
    ...state,
    patients: [...state.patients, patient],
    plans: [...state.plans, plan],
    activePatientId: patient.id,
    activePlanId: plan.id,
    selectedDayId: plan.days[0]?.id ?? null,
    selectedMealId: plan.days[0]?.meals[0]?.id ?? null,
    editPanelOpen: false,
  }
}

export function updateMealEntries(
  state: AppState,
  mealId: string,
  entries: MealEntry[],
): AppState {
  const plan = state.plans.find((p) => p.id === state.activePlanId)
  if (!plan) return state
  const days = plan.days.map((day) => ({
    ...day,
    meals: day.meals.map((m) =>
      m.id === mealId ? { ...m, entries } : m,
    ),
  }))
  return {
    ...state,
    plans: state.plans.map((p) =>
      p.id === plan.id ? { ...plan, days } : p,
    ),
  }
}
