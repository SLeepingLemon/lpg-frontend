import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { useAuth } from '../../hooks/useAuth'
import FullScreenLoader from '../common/FullScreenLoader'

/** Renders child routes only for signed-in users; remembers where they were going. */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  return <Outlet />
}
