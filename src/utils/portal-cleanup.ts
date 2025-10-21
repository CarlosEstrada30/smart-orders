/**
 * Portal cleanup utilities specifically for Chrome 141+ compatibility
 * Handles the new Blink engine changes and orphaned node garbage collection
 */

/**
 * Safe portal cleanup that handles Chrome 141+ DOM changes
 * Prevents "removeChild" errors in portal components
 */
export function safePortalCleanup(portalContainer: HTMLElement | null) {
  if (!portalContainer) return

  try {
    // Check if container still exists in DOM
    if (!document.body.contains(portalContainer)) {
      console.warn('Portal container no longer in DOM, skipping cleanup')
      return
    }

    // Use requestAnimationFrame to ensure DOM is stable
    requestAnimationFrame(() => {
      try {
        // Clear all children safely
        while (portalContainer.firstChild) {
          const child = portalContainer.firstChild
          portalContainer.removeChild(child)
        }
      } catch (error) {
        console.warn('Portal cleanup failed:', error)
      }
    })
  } catch (error) {
    console.warn('Portal container cleanup error:', error)
  }
}

/**
 * Enhanced portal creation that's compatible with Chrome 141+
 */
export function createSafePortalContainer(id: string): HTMLElement {
  // Remove existing container if it exists
  const existing = document.getElementById(id)
  if (existing) {
    safePortalCleanup(existing)
    existing.remove()
  }

  // Create new container
  const container = document.createElement('div')
  container.id = id
  container.setAttribute('data-portal-container', 'true')
  
  // Add to DOM
  document.body.appendChild(container)
  
  return container
}

/**
 * Safe portal unmounting for React portals
 */
export function safePortalUnmount(container: HTMLElement | null) {
  if (!container) return

  // Use setTimeout to ensure React has finished its cleanup
  setTimeout(() => {
    try {
      if (document.body.contains(container)) {
        // Clear children first
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
        // Remove container
        container.remove()
      }
    } catch (error) {
      console.warn('Portal unmount failed:', error)
    }
  }, 0)
}

/**
 * Enhanced error boundary specifically for portals
 */
export class PortalErrorBoundary {
  private static instance: PortalErrorBoundary
  private errorCount = 0
  private maxErrors = 10

  static getInstance(): PortalErrorBoundary {
    if (!PortalErrorBoundary.instance) {
      PortalErrorBoundary.instance = new PortalErrorBoundary()
    }
    return PortalErrorBoundary.instance
  }

  handleError(error: Error, errorInfo: any) {
    this.errorCount++
    
    // Handle DOM manipulation errors specifically
    if (error.name === 'NotFoundError' && error.message.includes('removeChild')) {
      console.warn(`Portal DOM error #${this.errorCount}:`, error.message)
      
      // If too many errors, force cleanup
      if (this.errorCount > this.maxErrors) {
        this.forceCleanup()
      }
      
      return true // Error handled
    }
    
    return false // Let other error handlers deal with it
  }

  private forceCleanup() {
    console.warn('Forcing portal cleanup due to repeated errors')
    
    // Find and clean all portal containers
    const portalContainers = document.querySelectorAll('[data-portal-container]')
    portalContainers.forEach(container => {
      safePortalCleanup(container as HTMLElement)
    })
    
    this.errorCount = 0
  }
}

