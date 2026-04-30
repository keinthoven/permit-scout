export default function Header() {
  return (
    <header className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-3">
        <span className="text-3xl">🏕️</span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Permit Scout</h1>
          <p className="text-green-300 text-sm">
            Check wilderness permit availability across all trailheads — at a glance
          </p>
        </div>
      </div>
    </header>
  )
}
