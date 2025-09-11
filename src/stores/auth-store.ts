import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { isTokenExpired } from '@/utils/jwt'
import type { AuthUser } from '@/services/auth'
import type { UserPermissions } from '@/services/auth/permissions.service'
import type { CompanySettings } from '@/services/settings'

const ACCESS_TOKEN = 'smart_orders_auth_token'

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    permissions: UserPermissions | null
    setPermissions: (permissions: UserPermissions | null) => void
    companySettings: CompanySettings | null
    setCompanySettings: (settings: CompanySettings | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    checkTokenExpiration: () => boolean
    isLoggingOut: boolean
    setLoggingOut: (isLoggingOut: boolean) => void
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  // Verificar si el token inicial está expirado
  if (initToken && isTokenExpired(initToken)) {
    removeCookie(ACCESS_TOKEN)
    return {
      auth: {
        user: null,
        setUser: (user) =>
          set((state) => ({ ...state, auth: { ...state.auth, user } })),
        permissions: null,
        setPermissions: (permissions) =>
          set((state) => ({ ...state, auth: { ...state.auth, permissions } })),
        companySettings: null,
        setCompanySettings: (companySettings) =>
          set((state) => ({ ...state, auth: { ...state.auth, companySettings } })),
        accessToken: '',
        setAccessToken: (accessToken) =>
          set((state) => {
            setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
            return { ...state, auth: { ...state.auth, accessToken } }
          }),
        resetAccessToken: () =>
          set((state) => {
            removeCookie(ACCESS_TOKEN)
            return { ...state, auth: { ...state.auth, accessToken: '' } }
          }),
        reset: () =>
          set((state) => {
            removeCookie(ACCESS_TOKEN)
            return {
              ...state,
              auth: { ...state.auth, user: null, permissions: null, companySettings: null, accessToken: '', isLoggingOut: false },
            }
          }),
        checkTokenExpiration: () => {
          const { accessToken } = get().auth
          if (accessToken && isTokenExpired(accessToken)) {
            get().auth.reset()
            return true // Token expirado
          }
          return false // Token válido
        },
        isLoggingOut: false,
        setLoggingOut: (isLoggingOut) =>
          set((state) => ({ ...state, auth: { ...state.auth, isLoggingOut } })),
      },
    }
  }

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      permissions: null,
      setPermissions: (permissions) =>
        set((state) => ({ ...state, auth: { ...state.auth, permissions } })),
      companySettings: null,
      setCompanySettings: (companySettings) =>
        set((state) => ({ ...state, auth: { ...state.auth, companySettings } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, permissions: null, companySettings: null, accessToken: '', isLoggingOut: false },
          }
        }),
      checkTokenExpiration: () => {
        const { accessToken } = get().auth
        if (accessToken && isTokenExpired(accessToken)) {
          get().auth.reset()
          return true // Token expirado
        }
        return false // Token válido
      },
      isLoggingOut: false,
      setLoggingOut: (isLoggingOut) =>
        set((state) => ({ ...state, auth: { ...state.auth, isLoggingOut } })),
    },
  }
})
