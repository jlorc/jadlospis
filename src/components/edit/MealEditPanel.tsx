import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../context/AppContext'
import { updateMealEntries } from '../../context/AppContext'
import { PRODUCTS } from '../../data/productGenerator'
import { DISHES } from '../../data/dishes'
import type { Dish, MealEntry, Product } from '../../types'
import {
  dishIngredients,
  dishMacros,
  entryMacros,
  mealMacros,
} from '../../lib/nutrition'
import { dishesMap } from '../../data/dishes'
import { productsMap } from '../../data/productGenerator'
import { fmtGrams, fmtKcal, fmtNum } from '../../lib/format'

type SearchMode = 'product' | 'dish'

export function MealEditPanel() {
  const { state, commit, activePatient, activePlan } = useApp()
  const [mode, setMode] = useState<SearchMode>('product')
  const [query, setQuery] = useState('')
  const [expandedDish, setExpandedDish] = useState<string | null>(null)

  const pmap = useMemo(() => productsMap(), [])
  const dmap = useMemo(() => dishesMap(), [])

  const meal = useMemo(() => {
    for (const day of activePlan.days) {
      const m = day.meals.find((x) => x.id === state.selectedMealId)
      if (m) return m
    }
    return null
  }, [activePlan, state.selectedMealId])

  if (!state.editPanelOpen || !meal) {
    return (
      <div className="no-print hidden w-full shrink-0 flex-col items-center justify-center border-l border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 xl:flex xl:w-96">
        <p className="font-medium text-slate-700">Edycja posiłku</p>
        <p className="mt-2 max-w-xs">
          Wybierz posiłek z siatki, aby wyszukać produkty lub potrawy i zobaczyć
          bilans w czasie rzeczywistym.
        </p>
      </div>
    )
  }

  const macros = mealMacros(meal, pmap, dmap)
  const split = activePatient.mealSplits.find((s) => s.name === meal.name)
  const mealMacroTarget = {
    kcal: meal.targetKcal,
    protein: (meal.targetKcal * (activePatient.macroSplit.protein / 100)) / 4,
    fat: (meal.targetKcal * (activePatient.macroSplit.fat / 100)) / 9,
    carbs: (meal.targetKcal * (activePatient.macroSplit.carbs / 100)) / 4,
    fiber: (meal.targetKcal / 1000) * 14 * (split?.percent ?? 20) / 100,
  }

  const remaining = {
    kcal: mealMacroTarget.kcal - macros.kcal,
    protein: mealMacroTarget.protein - macros.protein,
    fat: mealMacroTarget.fat - macros.fat,
    carbs: mealMacroTarget.carbs - macros.carbs,
  }

  const q = query.trim().toLowerCase()
  const productResults = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(q),
  ).slice(0, 12)
  const dishResults = DISHES.filter((d) =>
    d.name.toLowerCase().includes(q),
  ).slice(0, 8)

  const setEntries = (entries: MealEntry[]) => {
    commit((s) => updateMealEntries(s, meal.id, entries))
  }

  const addProduct = (product: Product, grams = 100) => {
    setEntries([
      ...meal.entries,
      { id: uuid(), kind: 'product', productId: product.id, grams },
    ])
  }

  const addDish = (dish: Dish) => {
    setEntries([
      ...meal.entries,
      { id: uuid(), kind: 'dish', dishId: dish.id, portions: 1 },
    ])
  }

  const removeEntry = (id: string) => {
    setEntries(meal.entries.filter((e) => e.id !== id))
  }

  const updateEntry = (id: string, patch: Partial<MealEntry>) => {
    setEntries(
      meal.entries.map((e) =>
        e.id === id ? { ...e, ...patch } as MealEntry : e,
      ),
    )
  }

  return (
    <aside
      className="no-print flex w-full shrink-0 flex-col border-l border-slate-200 bg-white xl:w-[420px] 2xl:w-[480px]"
      aria-label="Edycja posiłku"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="font-semibold text-slate-900">Edycja posiłku</h2>
          <p className="text-sm text-slate-500">
            {meal.time} · {meal.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            commit((s) => ({ ...s, editPanelOpen: false }), false)
          }
          className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
        >
          Zamknij
        </button>
      </div>

      <div className="space-y-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm">
        <div>
          <span className="text-xs font-medium uppercase text-slate-400">
            Suma wartości odżywczych
          </span>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-medium text-slate-800">
            <span>{fmtKcal(macros.kcal)}</span>
            <span>Białko {fmtNum(macros.protein)} g</span>
            <span>Tłuszcz {fmtNum(macros.fat)} g</span>
            <span>Węgle {fmtNum(macros.carbs)} g</span>
          </div>
        </div>
        <div>
          <span className="text-xs font-medium uppercase text-slate-400">
            Do normy posiłku pozostało
          </span>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <Remain label="Energia" value={remaining.kcal} unit="kcal" />
            <Remain label="Białko" value={remaining.protein} unit="g" />
            <Remain label="Tłuszcz" value={remaining.fat} unit="g" />
            <Remain label="Węgle" value={remaining.carbs} unit="g" />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="flex gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={mode === 'product'}
                onChange={() => setMode('product')}
              />
              Produkt
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={mode === 'dish'}
                onChange={() => setMode('dish')}
              />
              Potrawa
            </label>
          </div>
          <input
            type="search"
            placeholder="Szukaj…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase text-slate-400">
            Wyniki wyszukiwania
          </h3>
          <ul className="space-y-2">
            {mode === 'product'
              ? productResults.map((p) => (
                  <SearchProductCard
                    key={p.id}
                    product={p}
                    onAdd={(g) => addProduct(p, g)}
                  />
                ))
              : dishResults.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">{d.name}</p>
                      <button
                        type="button"
                        onClick={() => addDish(d)}
                        className="shrink-0 rounded-md bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                      >
                        Dodaj
                      </button>
                    </div>
                    <MacroRow m={dishMacros(d, 1, pmap)} />
                  </li>
                ))}
          </ul>

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase text-slate-400">
            Skład posiłku
          </h3>
          <ul className="space-y-2">
            {meal.entries.length === 0 && (
              <p className="text-sm text-slate-500">Brak pozycji.</p>
            )}
            {meal.entries.map((entry) => {
              const em = entryMacros(entry, pmap, dmap)
              if (entry.kind === 'product') {
                const p = pmap.get(entry.productId)
                return (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{p?.name}</p>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Usuń
                      </button>
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      Gramatura
                      <input
                        type="number"
                        className="w-20 rounded border border-slate-200 px-2 py-1"
                        value={entry.grams}
                        onChange={(e) =>
                          updateEntry(entry.id, {
                            grams: Number(e.target.value) || 0,
                          })
                        }
                      />
                      g
                    </label>
                    <MacroRow m={em} />
                  </li>
                )
              }
              const d = dmap.get(entry.dishId)!
              const open = expandedDish === entry.id
              const ings = dishIngredients(d, entry.ingredientOverrides)
              return (
                <li
                  key={entry.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      className="text-left text-sm font-medium text-slate-900"
                      onClick={() =>
                        setExpandedDish(open ? null : entry.id)
                      }
                    >
                      {open ? '▼' : '▶'} {d.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Usuń
                    </button>
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    Porcje
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      className="w-16 rounded border border-slate-200 px-2 py-1"
                      value={entry.portions}
                      onChange={(e) =>
                        updateEntry(entry.id, {
                          portions: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </label>
                  <MacroRow m={em} />
                  {open && (
                    <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-xs">
                      {ings.map((ing) => {
                        const p = pmap.get(ing.productId)
                        const grams =
                          entry.ingredientOverrides?.find(
                            (o) => o.productId === ing.productId,
                          )?.grams ?? ing.grams
                        return (
                          <li
                            key={ing.productId}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-slate-600">{p?.name}</span>
                            <input
                              type="number"
                              className="w-16 rounded border border-slate-200 px-1 py-0.5"
                              value={grams}
                              onChange={(e) => {
                                const g = Number(e.target.value) || 0
                                const base = dishIngredients(d)
                                const overrides = base.map((b) => {
                                  const existing =
                                    entry.ingredientOverrides?.find(
                                      (o) => o.productId === b.productId,
                                    )
                                  return {
                                    productId: b.productId,
                                    grams:
                                      b.productId === ing.productId
                                        ? g
                                        : (existing?.grams ?? b.grams),
                                  }
                                })
                                updateEntry(entry.id, {
                                  ingredientOverrides: overrides,
                                })
                              }}
                            />
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </aside>
  )
}

function Remain({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: string
}) {
  const over = value < 0
  return (
    <span className={over ? 'text-rose-600' : 'text-emerald-700'}>
      {label}: {over ? 'nadwyżka ' : ''}
      {fmtNum(Math.abs(value))} {unit}
    </span>
  )
}

function MacroRow({ m }: { m: { kcal: number; protein: number; fat: number; carbs: number } }) {
  return (
    <p className="mt-1 text-[11px] text-slate-500">
      {Math.round(m.kcal)} kcal · B {fmtNum(m.protein)} g · T {fmtNum(m.fat)} g ·
      W {fmtNum(m.carbs)} g
    </p>
  )
}

function SearchProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (grams: number) => void
}) {
  const [grams, setGrams] = useState(100)
  const measure = product.measures[0]

  return (
    <li className="rounded-lg border border-slate-200 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{product.name}</p>
          <span
            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
              product.source === 'IZZ'
                ? 'bg-fuchsia-100 text-fuchsia-800'
                : 'bg-sky-100 text-sky-800'
            }`}
          >
            {product.source === 'IZZ' ? 'IŻŻ' : 'USDA'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(grams)}
          className="shrink-0 rounded-md bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Dodaj
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <input
          type="number"
          className="w-20 rounded border border-slate-200 px-2 py-1"
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value) || 0)}
        />
        <span>g</span>
        {measure && (
          <button
            type="button"
            className="text-brand-700 hover:underline"
            onClick={() => setGrams(measure.grams)}
          >
            {measure.label} ({fmtGrams(measure.grams)})
          </button>
        )}
      </div>
      <MacroRow m={product.per100g} />
      <p className="mt-0.5 text-[10px] text-slate-400">wartości na 100 g</p>
    </li>
  )
}
