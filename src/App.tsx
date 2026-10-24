import { AppProvider } from './context/AppContext'
import { PatientSidebar } from './components/patient/PatientSidebar'
import { PlanToolbar } from './components/plan/PlanToolbar'
import { MealGrid } from './components/plan/MealGrid'
import { MealEditPanel } from './components/edit/MealEditPanel'
import { StickyNormsBar } from './components/norms/StickyNormsBar'

function Shell() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-2 lg:px-6">
        <p className="text-sm font-semibold text-brand-700">Jadłospis</p>
        <p className="text-xs text-slate-500">
          Nowoczesny panel dietetyka — dane lokalne, bez chmury
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <PatientSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PlanToolbar />
          <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
            <main className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-4 lg:px-6">
              <MealGrid />
            </main>
            <MealEditPanel />
          </div>
        </div>
      </div>
      <StickyNormsBar />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
