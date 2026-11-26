import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clearResourceCache } from '../hooks/usePolledResource'
import * as authService from '../services/authService'
import * as profileService from '../services/profileService'
import { getAuthErrorMessage, isSilentAuthError } from '../utils/authErrors'
import { AuthContext } from './authContextInstance'

/** Auth user + stored profile → the single `user` object the UI reads. */
function mergeUser(authUser, profile) {
  if (!authUser) return null
  return {
    ...authUser,
    displayName: profile?.fullName || authUser.displayName,
    photoURL: profile?.photoURL ?? authUser.photoURL ?? null,
    username: profile?.username ?? '',
    phone: profile?.phone ?? '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true until the first auth state arrives
  const [error, setError] = useState('')

  // Guards against an older async profile load overwriting a newer user.
  const resolveSeq = useRef(0)
  // Set on an interactive sign-in so the app can show a one-time notification summary.
  const justSignedIn = useRef(false)

  const resolveUser = useCallback(async (authUser) => {
    const seq = ++resolveSeq.current
    const profile = authUser ? await profileService.getProfile(authUser) : null
    if (seq !== resolveSeq.current) return
    setUser(mergeUser(authUser, profile))
    setLoading(false)
  }, [])

  useEffect(() => authService.subscribeToAuthState(resolveUser), [resolveUser])

  // Wraps a service call: clears the previous error, maps failures to a
  // friendly message, then rethrows so the page can react (e.g. stop spinner).
  const run = useCallback(async (action) => {
    setError('')
    try {
      return await action()
    } catch (err) {
      justSignedIn.current = false
      if (!isSilentAuthError(err)) setError(getAuthErrorMessage(err))
      throw err
    }
  }, [])

  const clearError = useCallback(() => setError(''), [])

  const consumeJustSignedIn = useCallback(() => {
    const value = justSignedIn.current
    justSignedIn.current = false
    return value
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isMockAuth: authService.isMockAuth,
      clearError,
      consumeJustSignedIn,

      login: (email, password, { remember = true } = {}) =>
        run(async () => {
          justSignedIn.current = true
          return authService.signInWithEmail(email.trim(), password, remember)
        }),

      register: ({ fullName, phone, username, email, password }) =>
        run(async () => {
          // Check before creating the account so a taken username doesn't leave a half-made user.
          await profileService.assertUsernameAvailable(username.trim())
          justSignedIn.current = true
          const created = await authService.registerWithEmail({
            fullName: fullName.trim(),
            phone,
            username: username.trim(),
            email: email.trim(),
            password,
          })
          await profileService.saveProfile(created.uid, {
            fullName: fullName.trim(),
            username: username.trim(),
            phone,
            email: email.trim(),
          })
          // Firebase emits the auth state before updateProfile() finishes,
          // so resolve again with the saved profile.
          await resolveUser(created)
          return created
        }),

      loginWithGoogle: ({ remember = true } = {}) =>
        run(async () => {
          justSignedIn.current = true
          return authService.signInWithGoogle(remember)
        }),

      logout: () =>
        run(async () => {
          await authService.signOutUser()
          clearResourceCache()
        }),

      resetPassword: (email) => run(() => authService.sendPasswordReset(email.trim())),

      /** Update profile fields (fullName, username, phone, photoURL). Throws on failure; does not set `error`. */
      updateProfile: async (changes) => {
        const profile = await profileService.updateProfile(user, changes)
        if (changes.fullName !== undefined) await authService.updateDisplayName(profile.fullName)
        setUser((current) => mergeUser(current, profile))
        return profile
      },
    }),
    [user, loading, error, run, clearError, consumeJustSignedIn, resolveUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
