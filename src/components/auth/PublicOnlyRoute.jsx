import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { useAuth } from '../../hooks/useAuth'
import FullScreenLoader from '../common/FullScreenLoader'

/**
 * Login/register routes. Signed-in users are sent to the page they originally
 * requested (set by ProtectedRoute) or the dashboard. This is also what
 * performs the redirect right after a successful sign-in.
 */
export default function PublicOnlyRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (user) {
    const from = location.state?.from
    const target = from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : ROUTES.dashboard
    return <Navigate to={target} replace />
  }
  return <Outlet />
}
