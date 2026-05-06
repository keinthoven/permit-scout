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
    </div>
  )
}
