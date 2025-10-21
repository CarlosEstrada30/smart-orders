import { useEffect, useRef } from 'react'
import { createDOMCleanup } from '@/utils/dom-cleanup'

/**
 * Hook for safe DOM cleanup in React components
 * Helps prevent removeChild errors during component unmounting
 */
export function useDOMCleanup() {
  const cleanupRef = useRef(createDOMCleanup())

  useEffect(() => {
    return () => {
      // Run all cleanup tasks when component unmounts
      cleanupRef.current.cleanup()
    }
  }, [])

  return {
    addCleanup: cleanupRef.current.addCleanup,
    cleanup: cleanupRef.current.cleanup
  }
}

/**
 * Hook for safe DOM node management
 * Provides utilities to safely manipulate DOM nodes
 */
export function useSafeDOM() {
  const { addCleanup } = useDOMCleanup()

  const safeRemoveChild = (parent: Node | null, child: Node | null) => {
    if (!parent || !child) return false
    
    try {
      if (parent.contains(child)) {
        parent.removeChild(child)
        return true
      }
      return false
    } catch (error) {
      console.warn('Failed to remove child node:', error)
      return false
    }
  }

  const safeAppendChild = (parent: Node | null, child: Node | null) => {
    if (!parent || !child) return false
    
    try {
      // If child is already attached elsewhere, remove it first
      if (child.parentNode) {
        child.parentNode.removeChild(child)
      }
      parent.appendChild(child)
      return true
    } catch (error) {
      console.warn('Failed to append child node:', error)
      return false
    }
  }

  return {
    safeRemoveChild,
    safeAppendChild,
    addCleanup
  }
}

