import { Link } from 'react-router-dom'
import { ROUTES } from '../routes'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">Page not found</p>
      <h1 className="mt-2 text-7xl font-extrabold tracking-tight text-slate-800">404</h1>
      <p className="mt-3 max-w-md text-center text-slate-500">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to={ROUTES.dashboard}
        className="mt-6 cursor-pointer rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

export default NotFoundPage
