import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface SafeTransitionProps {
  children: React.ReactNode
  show: boolean
  duration?: number
  className?: string
  onTransitionEnd?: () => void
}

/**
 * Safe transition component for Chrome 141+ compatibility
 * Handles display: none and rapid unmounting issues
 */
export function SafeTransition({ 
  children, 
  show, 
  duration = 200,
  className,
  onTransitionEnd 
}: SafeTransitionProps) {
  const [isVisible, setIsVisible] = useState(show)
  const [shouldRender, setShouldRender] = useState(show)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (show) {
      // Show immediately
      setShouldRender(true)
      setIsVisible(true)
    } else {
      // Start hide transition
      setIsVisible(false)
      
      // Wait for transition to complete before removing from DOM
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false)
        onTransitionEnd?.()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [show, duration, onTransitionEnd])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!shouldRender) {
    return null
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-200 ease-in-out',
        {
          'opacity-100 scale-100': isVisible,
          'opacity-0 scale-95': !isVisible,
        },
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        // Prevent layout shifts during transition
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Safe animation wrapper for components that use display: none
 * Prevents Chrome 141+ issues with rapid show/hide
 */
export function SafeAnimation({ 
  children, 
  isVisible, 
  animationType = 'fade',
  duration = 200 
}: {
  children: React.ReactNode
  isVisible: boolean
  animationType?: 'fade' | 'slide' | 'scale'
  duration?: number
}) {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isVisible) {
      setShouldRender(true)
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false)
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isVisible, duration])

  if (!shouldRender) {
    return null
  }

  const getAnimationClasses = () => {
    switch (animationType) {
      case 'slide':
        return {
          enter: 'translate-y-0',
          exit: 'translate-y-full',
        }
      case 'scale':
        return {
          enter: 'scale-100',
          exit: 'scale-0',
        }
      default: // fade
        return {
          enter: 'opacity-100',
          exit: 'opacity-0',
        }
    }
  }

  const animationClasses = getAnimationClasses()

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-in-out',
        isAnimating ? animationClasses.enter : animationClasses.exit,
        {
          'transform-gpu': true, // Force GPU acceleration
        }
      )}
      style={{
        transitionDuration: `${duration}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

