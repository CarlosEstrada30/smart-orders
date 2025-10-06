import { useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Hook para manejar logout de forma segura y suave
 */
export function useLogout() {
  const { reset, isLoggingOut, setLoggingOut } = useAuthStore((state) => state.auth)

  const logout = useCallback(() => {
    if (isLoggingOut) return // Evitar múltiples llamadas

    // Marcar como haciendo logout INMEDIATAMENTE
    setLoggingOut(true)
    
    // Limpiar el store y la cookie ANTES de redirigir
    reset()
    
    // Redirección inmediata usando replace para evitar que el router procese la navegación
    window.location.replace('/sign-in')
  }, [isLoggingOut, setLoggingOut, reset])

  return {
    logout,
    isLoggingOut
  }
}

/**
 * Hook para obtener datos del usuario de forma segura durante logout
 */
export function useSafeAuthData() {
  const { user, permissions, companySettings, isLoggingOut } = useAuthStore((state) => state.auth)

  // Si está haciendo logout, devolver datos null para evitar errores
  if (isLoggingOut) {
    return {
      user: null,
      permissions: null,
      companySettings: null,
      isLoggingOut: true
    }
  }

  return {
    user,
    permissions,
    companySettings,
    isLoggingOut: false
  }
}
