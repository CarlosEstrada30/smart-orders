import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { safePortalCleanup, createSafePortalContainer, safePortalUnmount } from '@/utils/portal-cleanup'

/**
 * Hook for safe portal management in Chrome 141+
 * Handles the new Blink engine changes and prevents removeChild errors
 */
export function useSafePortal(containerId: string) {
  const containerRef = useRef<HTMLElement | null>(null)
  const isMountedRef = useRef(false)

  // Create or get portal container
  const getContainer = useCallback(() => {
    if (!containerRef.current) {
      containerRef.current = createSafePortalContainer(containerId)
    }
    return containerRef.current
  }, [containerId])

  // Safe portal creation
  const createSafePortal = useCallback((children: React.ReactNode) => {
    if (!isMountedRef.current) return null
    
    try {
      const container = getContainer()
      return createPortal(children, container)
    } catch (error) {
      console.warn('Safe portal creation failed:', error)
      return null
    }
  }, [getContainer])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      
      // Use requestAnimationFrame to ensure React cleanup is complete
      requestAnimationFrame(() => {
        if (containerRef.current) {
          safePortalUnmount(containerRef.current)
          containerRef.current = null
        }
      })
    }
  }, [])

  // Cleanup container when ID changes
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        safePortalCleanup(containerRef.current)
      }
    }
  }, [containerId])

  return {
    createSafePortal,
    getContainer,
    isMounted: isMountedRef.current
  }
}

/**
 * Hook for managing multiple portals safely
 */
export function useSafePortals() {
  const portalsRef = useRef<Map<string, HTMLElement>>(new Map())
  const isMountedRef = useRef(false)

  const createPortal = useCallback((id: string, children: React.ReactNode) => {
    if (!isMountedRef.current) return null

    try {
      let container = portalsRef.current.get(id)
      
      if (!container) {
        container = createSafePortalContainer(id)
        portalsRef.current.set(id, container)
      }

      return createPortal(children, container)
    } catch (error) {
      console.warn(`Safe portal creation failed for ${id}:`, error)
      return null
    }
  }, [])

  const cleanupPortal = useCallback((id: string) => {
    const container = portalsRef.current.get(id)
    if (container) {
      safePortalCleanup(container)
      portalsRef.current.delete(id)
    }
  }, [])

  const cleanupAllPortals = useCallback(() => {
    portalsRef.current.forEach((container) => {
      safePortalCleanup(container)
    })
    portalsRef.current.clear()
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      
      // Cleanup all portals on unmount
      requestAnimationFrame(() => {
        cleanupAllPortals()
      })
    }
  }, [cleanupAllPortals])

  return {
    createPortal,
    cleanupPortal,
    cleanupAllPortals,
    isMounted: isMountedRef.current
  }
}

