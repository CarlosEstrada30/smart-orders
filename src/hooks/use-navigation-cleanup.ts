import { useEffect, useRef, useCallback } from 'react'
import { useLocation } from '@tanstack/react-router'

/**
 * Hook para limpiar efectos y estados cuando se navega entre páginas
 * Ayuda a prevenir errores causados por efectos que continúan ejecutándose
 * después de que el componente se haya desmontado
 */
export function useNavigationCleanup() {
  const location = useLocation()
  const isMountedRef = useRef(true)
  const currentPathRef = useRef(location.pathname)

  useEffect(() => {
    // Si la ruta cambió, marcar como desmontado
    if (currentPathRef.current !== location.pathname) {
      isMountedRef.current = false
    }
    
    currentPathRef.current = location.pathname
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [location.pathname])

  // Función para verificar si el componente aún está montado - memoizada
  const isMounted = useCallback(() => isMountedRef.current, [])

  // Función wrapper para operaciones async que verifica si el componente está montado - memoizada
  const safeAsync = useCallback(<T>(asyncFn: () => Promise<T>) => {
    return async (): Promise<T | null> => {
      if (!isMountedRef.current) return null
      
      try {
        const result = await asyncFn()
        return isMountedRef.current ? result : null
      } catch (error) {
        // Solo lanzar el error si el componente aún está montado
        if (isMountedRef.current) {
          throw error
        }
        return null
      }
    }
  }, [])

  return {
    isMounted,
    safeAsync,
  }
}
