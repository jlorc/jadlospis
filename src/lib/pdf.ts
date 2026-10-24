import { jsPDF } from 'jspdf'
import type { MealPlan, Patient } from '../types'
import { dishesMap } from '../data/dishes'
import { productsMap } from '../data/productGenerator'
import { dayMacros, mealMacros, targetKcal } from './nutrition'
import { fmtGrams, fmtKcal, fmtNum } from './format'

export function exportPlanPdf(plan: MealPlan, patient: Patient) {
  const pmap = productsMap()
  const dmap = dishesMap()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 14
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(plan.name, margin, y)
  y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Pacjent: ${patient.name}`, margin, y)
  y += 6
  doc.text(`Cel energetyczny: ${targetKcal(patient)} kcal/dzień`, margin, y)
  y += 10

  for (const day of plan.days) {
    if (y > 260) {
      doc.addPage()
      y = margin
    }
    doc.setFont('helvetica', 'bold')
    doc.text(day.label, margin, y)
    y += 6
    const dm = dayMacros(day, pmap, dmap)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(
      `Suma: ${fmtKcal(dm.kcal)} | Białko ${fmtNum(dm.protein)} g | Tłuszcz ${fmtNum(dm.fat)} g | Węgle ${fmtNum(dm.carbs)} g`,
      margin,
      y,
    )
    y += 6

    for (const meal of day.meals) {
      if (y > 275) {
        doc.addPage()
        y = margin
      }
      const mm = mealMacros(meal, pmap, dmap)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${meal.time} — ${meal.name}`, margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(
        `${Math.round(mm.kcal)} / ${meal.targetKcal} kcal`,
        margin,
        y,
      )
      y += 4
      for (const entry of meal.entries) {
        let line = '• '
        if (entry.kind === 'product') {
          const p = pmap.get(entry.productId)
          line += `${p?.name ?? '?'} — ${fmtGrams(entry.grams)}`
        } else {
          const d = dmap.get(entry.dishId)
          line += `${d?.name ?? '?'} — ${entry.portions} por.`
        }
        const lines = doc.splitTextToSize(line, 180)
        doc.text(lines, margin + 2, y)
        y += lines.length * 4
      }
      y += 3
    }
    y += 4
  }

  doc.save(`${plan.name.replace(/\s+/g, '_')}.pdf`)
}
