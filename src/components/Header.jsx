import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏕️</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Permit Scout</h1>
            <p className="text-green-300 text-sm hidden sm:block">
              Wilderness permit tools for trip planning
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-green-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            Permit Checker
          </NavLink>
          <NavLink
            to="/plan"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-green-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            Trip Planner
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
