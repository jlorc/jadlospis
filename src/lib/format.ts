export function fmtNum(n: number, digits = 1): string {
  if (Math.abs(n) >= 100) return Math.round(n).toString()
  return n.toFixed(digits)
}

export function fmtSignedPct(pct: number): string {
  if (pct > 0) return `+${pct}%`
  return `${pct}%`
}

export function fmtGrams(g: number): string {
  return `${fmtNum(g)} g`
}

export function fmtKcal(k: number): string {
  return `${Math.round(k)} kcal`
}
