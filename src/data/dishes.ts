import type { Dish } from '../types'

export const DISHES: Dish[] = [
  {
    id: 'dish-1',
    name: 'Owsianka z bananem i orzechami',
    portions: 1,
    ingredients: [
      { productId: 'prod-9', grams: 50 },
      { productId: 'prod-18', grams: 80 },
      { productId: 'prod-31', grams: 15 },
      { productId: 'prod-3', grams: 150 },
    ],
  },
  {
    id: 'dish-2',
    name: 'Jajecznica z warzywami na chlebie',
    portions: 1,
    ingredients: [
      { productId: 'prod-1', grams: 110 },
      { productId: 'prod-16', grams: 80 },
      { productId: 'prod-38', grams: 60 },
      { productId: 'prod-8', grams: 70 },
      { productId: 'prod-30', grams: 5 },
    ],
  },
  {
    id: 'dish-3',
    name: 'Sałatka z kurczakiem i quinoa',
    portions: 1,
    ingredients: [
      { productId: 'prod-24', grams: 120 },
      { productId: 'prod-47', grams: 150 },
      { productId: 'prod-36', grams: 40 },
      { productId: 'prod-17', grams: 100 },
      { productId: 'prod-30', grams: 10 },
    ],
  },
  {
    id: 'dish-4',
    name: 'Łosoś z ryżem i brokułem',
    portions: 1,
    ingredients: [
      { productId: 'prod-22', grams: 150 },
      { productId: 'prod-10', grams: 180 },
      { productId: 'prod-14', grams: 150 },
      { productId: 'prod-30', grams: 8 },
    ],
  },
  {
    id: 'dish-5',
    name: 'Wrap z indykiem i hummusem',
    portions: 1,
    ingredients: [
      { productId: 'prod-44', grams: 45 },
      { productId: 'prod-25', grams: 100 },
      { productId: 'prod-43', grams: 40 },
      { productId: 'prod-36', grams: 30 },
    ],
  },
  {
    id: 'dish-6',
    name: 'Placuszki bananowe z serkiem i borówkami',
    portions: 1,
    ingredients: [
      { productId: 'prod-1', grams: 50 },
      { productId: 'prod-18', grams: 100 },
      { productId: 'prod-78', grams: 40 },
      { productId: 'prod-4', grams: 100 },
      { productId: 'prod-20', grams: 60 },
    ],
  },
  {
    id: 'dish-7',
    name: 'Bowl z tofu i kaszą gryczaną',
    portions: 1,
    ingredients: [
      { productId: 'prod-27', grams: 150 },
      { productId: 'prod-11', grams: 170 },
      { productId: 'prod-15', grams: 80 },
      { productId: 'prod-42', grams: 80 },
      { productId: 'prod-88', grams: 15 },
    ],
  },
  {
    id: 'dish-8',
    name: 'Makaron z tuńczykiem i pomidorami',
    portions: 1,
    ingredients: [
      { productId: 'prod-12', grams: 200 },
      { productId: 'prod-49', grams: 80 },
      { productId: 'prod-16', grams: 150 },
      { productId: 'prod-30', grams: 10 },
    ],
  },
  {
    id: 'dish-9',
    name: 'Smoothie jagodowe z jogurtem',
    portions: 1,
    ingredients: [
      { productId: 'prod-20', grams: 100 },
      { productId: 'prod-61', grams: 80 },
      { productId: 'prod-54', grams: 150 },
      { productId: 'prod-34', grams: 10 },
    ],
  },
  {
    id: 'dish-10',
    name: 'Kanapka z awokado i jajkiem',
    portions: 1,
    ingredients: [
      { productId: 'prod-7', grams: 60 },
      { productId: 'prod-21', grams: 70 },
      { productId: 'prod-1', grams: 55 },
      { productId: 'prod-36', grams: 30 },
    ],
  },
]

export function dishesMap(): Map<string, Dish> {
  return new Map(DISHES.map((d) => [d.id, d]))
}
