import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl tracking-tight text-black">
          Setty
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/app"
            className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
          >
            Marketplace
          </Link>
          <Link
            to="/bounties"
            className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
          >
            Bounties
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/auth"
            className="rounded-none border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
