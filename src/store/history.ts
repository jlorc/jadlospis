import type { AppState } from '../types'

const STORAGE_KEY = 'jadlospis-mvp-v1'

export interface HistoryState {
  present: AppState
  past: AppState[]
  future: AppState[]
}

export function loadHistory(): HistoryState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as HistoryState
  } catch {
    return null
  }
}

export function saveHistory(h: HistoryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h))
  } catch {
    /* ignore quota */
  }
}

export function pushHistory(
  h: HistoryState,
  next: AppState,
  recordHistory = true,
): HistoryState {
  if (!recordHistory) {
    const updated = { ...h, present: next }
    saveHistory(updated)
    return updated
  }
  const updated: HistoryState = {
    present: next,
    past: [...h.past, h.present].slice(-50),
    future: [],
  }
  saveHistory(updated)
  return updated
}

export function undo(h: HistoryState): HistoryState | null {
  if (!h.past.length) return null
  const previous = h.past[h.past.length - 1]
  const updated: HistoryState = {
    present: previous,
    past: h.past.slice(0, -1),
    future: [h.present, ...h.future],
  }
  saveHistory(updated)
  return updated
}

export function redo(h: HistoryState): HistoryState | null {
  if (!h.future.length) return null
  const next = h.future[0]
  const updated: HistoryState = {
    present: next,
    past: [...h.past, h.present],
    future: h.future.slice(1),
  }
  saveHistory(updated)
  return updated
}
