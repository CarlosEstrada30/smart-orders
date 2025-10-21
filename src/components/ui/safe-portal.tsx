import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { safePortalCleanup, createSafePortalContainer } from '@/utils/portal-cleanup'

interface SafePortalProps {
  children: React.ReactNode
  containerId?: string
  className?: string
}

/**
 * Safe portal component for Chrome 141+ compatibility
 * Handles the new Blink engine changes and prevents removeChild errors
 */
export function SafePortal({ 
  children, 
  containerId = 'safe-portal-container',
  className 
}: SafePortalProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    
    // Create or get container
    if (!containerRef.current) {
      containerRef.current = createSafePortalContainer(containerId)
    }

    // Add className if provided
    if (className && containerRef.current) {
      containerRef.current.className = className
    }

    return () => {
      isMountedRef.current = false
      
      // Cleanup with delay to ensure React cleanup is complete
      setTimeout(() => {
        if (containerRef.current) {
          safePortalCleanup(containerRef.current)
          containerRef.current = null
        }
      }, 0)
    }
  }, [containerId, className])

  // Don't render if not mounted or no container
  if (!isMountedRef.current || !containerRef.current) {
    return null
  }

  try {
    return createPortal(children, containerRef.current)
  } catch (error) {
    console.warn('SafePortal render failed:', error)
    return null
  }
}

/**
 * Enhanced portal for Radix UI components
 * Specifically designed to work with Chrome 141+ changes
 */
export function RadixSafePortal({ 
  children, 
  containerId = 'radix-portal-container' 
}: { 
  children: React.ReactNode
  containerId?: string 
}) {
  const containerRef = useRef<HTMLElement | null>(null)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    
    // Create container with Radix-specific attributes
    if (!containerRef.current) {
      containerRef.current = createSafePortalContainer(containerId)
      containerRef.current.setAttribute('data-radix-portal', 'true')
      containerRef.current.setAttribute('data-chrome-141-safe', 'true')
    }

    return () => {
      isMountedRef.current = false
      
      // Enhanced cleanup for Radix components
      requestAnimationFrame(() => {
        if (containerRef.current) {
          try {
            // Clear all Radix-specific attributes
            containerRef.current.removeAttribute('data-radix-portal')
            containerRef.current.removeAttribute('data-chrome-141-safe')
            
            // Safe cleanup
            safePortalCleanup(containerRef.current)
          } catch (error) {
            console.warn('RadixSafePortal cleanup failed:', error)
          } finally {
            containerRef.current = null
          }
        }
      })
    }
  }, [containerId])

  if (!isMountedRef.current || !containerRef.current) {
    return null
  }

  try {
    return createPortal(children, containerRef.current)
  } catch (error) {
    console.warn('RadixSafePortal render failed:', error)
    return null
  }
}

