import type {
  DeviationStatus,
  Dish,
  DishIngredient,
  Macros,
  Meal,
  MealEntry,
  NormComparison,
  Patient,
  PlanDay,
  Product,
} from '../types'

export function bmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100
  return weightKg / (h * h)
}

export function bmr(patient: Patient): number {
  const { weightKg, heightCm, age, sex } = patient
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function cpm(patient: Patient): number {
  return Math.round(bmr(patient) * patient.pal)
}

export function targetKcal(patient: Patient): number {
  return patient.targetKcalOverride ?? cpm(patient)
}

export function macroTargetsFromKcal(
  kcal: number,
  split: Patient['macroSplit'],
): Macros {
  const proteinKcal = (kcal * split.protein) / 100
  const fatKcal = (kcal * split.fat) / 100
  const carbsKcal = (kcal * split.carbs) / 100
  return {
    kcal,
    protein: proteinKcal / 4,
    fat: fatKcal / 9,
    carbs: carbsKcal / 4,
    fiber: (kcal / 1000) * 14,
  }
}

export function mealTargetKcal(patient: Patient, mealPercent: number): number {
  return Math.round((targetKcal(patient) * mealPercent) / 100)
}

export function scaleMacros(m: Macros, factor: number): Macros {
  return {
    kcal: m.kcal * factor,
    protein: m.protein * factor,
    fat: m.fat * factor,
    carbs: m.carbs * factor,
    fiber: m.fiber * factor,
  }
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    fat: a.fat + b.fat,
    carbs: a.carbs + b.carbs,
    fiber: a.fiber + b.fiber,
  }
}

export const emptyMacros = (): Macros => ({
  kcal: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
})

export function productMacros(product: Product, grams: number): Macros {
  return scaleMacros(product.per100g, grams / 100)
}

export function dishIngredients(
  dish: Dish,
  overrides?: DishIngredient[],
): DishIngredient[] {
  if (!overrides?.length) return dish.ingredients
  const map = new Map(dish.ingredients.map((i) => [i.productId, i.grams]))
  for (const o of overrides) map.set(o.productId, o.grams)
  return dish.ingredients.map((i) => ({
    productId: i.productId,
    grams: map.get(i.productId) ?? i.grams,
  }))
}

export function dishMacros(
  dish: Dish,
  portions: number,
  products: Map<string, Product>,
  overrides?: DishIngredient[],
): Macros {
  const ings = dishIngredients(dish, overrides)
  let total = emptyMacros()
  for (const ing of ings) {
    const p = products.get(ing.productId)
    if (!p) continue
    const factor = (ing.grams * portions) / dish.portions
    total = addMacros(total, productMacros(p, factor))
  }
  return total
}

export function entryMacros(
  entry: MealEntry,
  products: Map<string, Product>,
  dishes: Map<string, Dish>,
): Macros {
  if (entry.kind === 'product') {
    const p = products.get(entry.productId)
    if (!p) return emptyMacros()
    return productMacros(p, entry.grams)
  }
  const d = dishes.get(entry.dishId)
  if (!d) return emptyMacros()
  return dishMacros(d, entry.portions, products, entry.ingredientOverrides)
}

export function mealMacros(
  meal: Meal,
  products: Map<string, Product>,
  dishes: Map<string, Dish>,
): Macros {
  return meal.entries.reduce(
    (acc, e) => addMacros(acc, entryMacros(e, products, dishes)),
    emptyMacros(),
  )
}

export function dayMacros(
  day: PlanDay,
  products: Map<string, Product>,
  dishes: Map<string, Dish>,
): Macros {
  return day.meals.reduce(
    (acc, m) => addMacros(acc, mealMacros(m, products, dishes)),
    emptyMacros(),
  )
}

export function deviationStatus(deviationPct: number): DeviationStatus {
  const abs = Math.abs(deviationPct)
  if (abs <= 10) return 'ok'
  if (abs <= 20) return 'warn'
  return 'bad'
}

export function compareToTarget(actual: number, target: number): NormComparison {
  if (target === 0) {
    return { actual, target, deviationPct: 0, status: 'ok' }
  }
  const deviationPct = Math.round(((actual - target) / target) * 100)
  return {
    actual,
    target,
    deviationPct,
    status: deviationStatus(deviationPct),
  }
}

export function compareMacros(actual: Macros, target: Macros): Record<
  keyof Macros,
  NormComparison
> {
  return {
    kcal: compareToTarget(actual.kcal, target.kcal),
    protein: compareToTarget(actual.protein, target.protein),
    fat: compareToTarget(actual.fat, target.fat),
    carbs: compareToTarget(actual.carbs, target.carbs),
    fiber: compareToTarget(actual.fiber, target.fiber),
  }
}
