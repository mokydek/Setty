import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="px-8 py-24 flex flex-col items-center text-center">
      <span className="text-xs font-medium text-[#0000FF] uppercase tracking-widest mb-4">
        404
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-black mb-4">Page not found</h1>
      <p className="text-sm text-black/60 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
