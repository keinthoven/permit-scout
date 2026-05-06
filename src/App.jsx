import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import PermitCheckerPage from './pages/PermitCheckerPage'
import PlannerPage from './pages/PlannerPage'

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <Routes>
        <Route path="/" element={<PermitCheckerPage />} />
        <Route path="/plan" element={<PlannerPage />} />
      </Routes>
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4 text-center text-xs text-stone-400">
        Heads up: Permit Checker only works with trailhead-based wilderness permits — the kind where Recreation.gov asks you to pick a starting zone.
      </footer>
    </div>
  )
}
