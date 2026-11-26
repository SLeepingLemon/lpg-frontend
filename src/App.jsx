import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'
import AppLayout from './components/layout/AppLayout'
import { ROUTES } from './config/routes'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Pages are imported eagerly (not lazy) so navigation between them is instant.
export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* Shared header stays mounted while moving between these pages */}
        <Route element={<AppLayout />}>
          <Route path={ROUTES.home} element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path={ROUTES.dashboard} element={<Dashboard />} />
          <Route path={ROUTES.profile} element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
