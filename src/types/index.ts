export type FoodSource = 'IZZ' | 'USDA'

export interface Macros {
  kcal: number
  protein: number
  fat: number
  carbs: number
  fiber: number
}

export interface HouseholdMeasure {
  label: string
  grams: number
}

export interface Product {
  id: string
  name: string
  source: FoodSource
  per100g: Macros
  measures: HouseholdMeasure[]
}

export interface DishIngredient {
  productId: string
  grams: number
}

export interface Dish {
  id: string
  name: string
  ingredients: DishIngredient[]
  portions: number
}

export type MealEntry =
  | {
      id: string
      kind: 'product'
      productId: string
      grams: number
    }
  | {
      id: string
      kind: 'dish'
      dishId: string
      portions: number
      ingredientOverrides?: DishIngredient[]
    }

export interface Meal {
  id: string
  name: string
  time: string
  targetKcal: number
  entries: MealEntry[]
}

export interface PlanDay {
  id: string
  label: string
  meals: Meal[]
}

export interface MealPlan {
  id: string
  patientId: string
  name: string
  days: PlanDay[]
}

export type Sex = 'female' | 'male'

export interface MealSplit {
  name: string
  percent: number
  time: string
}

export interface Patient {
  id: string
  name: string
  weightKg: number
  heightCm: number
  age: number
  sex: Sex
  pal: number
  macroSplit: { protein: number; fat: number; carbs: number }
  mealSplits: MealSplit[]
  targetKcalOverride?: number
}

export interface AppState {
  patients: Patient[]
  activePatientId: string
  plans: MealPlan[]
  activePlanId: string
  selectedDayId: string | null
  selectedMealId: string | null
  editPanelOpen: boolean
}

export type DeviationStatus = 'ok' | 'warn' | 'bad'

export interface NormComparison {
  actual: number
  target: number
  deviationPct: number
  status: DeviationStatus
}
