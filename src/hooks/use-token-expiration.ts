import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { isTokenExpired } from '@/utils/jwt'
import { toast } from 'sonner'

export function useTokenExpiration() {
  const { accessToken, reset } = useAuthStore((state) => state.auth)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Verificar cada minuto si el token ha expirado
    const checkTokenExpiration = () => {
      if (accessToken && isTokenExpired(accessToken)) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        reset()
        
        // Redirigir al login
        const currentPath = window.location.pathname
        window.location.href = `/sign-in?redirect=${encodeURIComponent(currentPath)}`
      }
    }

    // Verificar inmediatamente al montar el componente
    checkTokenExpiration()

    // Configurar verificación periódica (cada minuto)
    intervalRef.current = setInterval(checkTokenExpiration, 60000) // 60 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [accessToken, reset])

  return null
} 