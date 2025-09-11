import { useCallback, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { redirectWithSubdomain } from '@/utils/subdomain'
import { toast } from 'sonner'

/**
 * Hook para manejar logout de forma segura y suave
 */
export function useLogout() {
  const { reset, isLoggingOut, setLoggingOut } = useAuthStore((state) => state.auth)
  const router = useRouter()

  const logout = useCallback(async () => {
    if (isLoggingOut) return // Evitar múltiples llamadas

    // Marcar como haciendo logout INMEDIATAMENTE (esto activa LogoutInterceptor)
    setLoggingOut(true)
    
    // Forzar re-render inmediato usando requestAnimationFrame
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    try {
      // Limpiar datos del store
      reset() // Esto ya pone isLoggingOut en false, pero el interceptor maneja la transición
      
      // Navegación inmediata
      router.navigate({ 
        to: '/sign-in',
        replace: true
      })
      
      // Toast de confirmación (se verá en el login)
      setTimeout(() => {
        toast.success('Sesión cerrada exitosamente')
      }, 100)
      
    } catch (error) {
      // Fallback inmediato
      reset()
      window.location.href = '/sign-in'
    }
  }, [isLoggingOut, reset, setLoggingOut, router])

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
