import { v4 as uuid } from 'uuid'
import type { AppState, Meal, MealPlan, Patient, PlanDay } from '../types'
import { mealTargetKcal } from '../lib/nutrition'

export const DEFAULT_MEAL_SPLITS = [
  { name: 'Śniadanie', percent: 25, time: '07:30' },
  { name: 'II śniadanie', percent: 10, time: '10:30' },
  { name: 'Obiad', percent: 35, time: '13:30' },
  { name: 'Podwieczorek', percent: 10, time: '16:30' },
  { name: 'Kolacja', percent: 20, time: '19:30' },
]

export function createPatient(partial?: Partial<Patient>): Patient {
  return {
    id: partial?.id ?? uuid(),
    name: partial?.name ?? 'Anna Nowak',
    weightKg: partial?.weightKg ?? 68,
    heightCm: partial?.heightCm ?? 168,
    age: partial?.age ?? 32,
    sex: partial?.sex ?? 'female',
    pal: partial?.pal ?? 1.55,
    macroSplit: partial?.macroSplit ?? { protein: 30, fat: 25, carbs: 45 },
    mealSplits: partial?.mealSplits ?? DEFAULT_MEAL_SPLITS.map((m) => ({ ...m })),
    targetKcalOverride: partial?.targetKcalOverride,
  }
}

function createMealsForPatient(patient: Patient): Meal[] {
  return patient.mealSplits.map((split) => ({
    id: uuid(),
    name: split.name,
    time: split.time,
    targetKcal: mealTargetKcal(patient, split.percent),
    entries: [],
  }))
}

export function createPlanDay(patient: Patient, label: string): PlanDay {
  return {
    id: uuid(),
    label,
    meals: createMealsForPatient(patient),
  }
}

export function createSamplePlan(patient: Patient): MealPlan {
  const days = [1, 2, 3].map((n) => createPlanDay(patient, `Dzień ${n}`))
  const breakfast = days[0]?.meals[0]
  if (breakfast) {
    breakfast.entries = [
      { id: uuid(), kind: 'dish', dishId: 'dish-6', portions: 1 },
    ]
  }
  const lunch = days[0]?.meals[2]
  if (lunch) {
    lunch.entries = [
      { id: uuid(), kind: 'dish', dishId: 'dish-3', portions: 1 },
    ]
  }
  return {
    id: uuid(),
    patientId: patient.id,
    name: 'Plan przykładowy — tradycyjny',
    days,
  }
}

export function createInitialState(): AppState {
  const anna = createPatient()
  const plan = createSamplePlan(anna)
  return {
    patients: [anna],
    activePatientId: anna.id,
    plans: [plan],
    activePlanId: plan.id,
    selectedDayId: plan.days[0]?.id ?? null,
    selectedMealId: plan.days[0]?.meals[0]?.id ?? null,
    editPanelOpen: false,
  }
}
