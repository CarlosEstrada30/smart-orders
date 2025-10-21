/**
 * DOM cleanup utilities to prevent removeChild errors
 * These utilities help manage DOM nodes safely during component unmounting
 */

/**
 * Safely removes a child node from its parent
 * Prevents NotFoundError when the node is not a child of the parent
 */
export function safeRemoveChild(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) {
    return false
  }

  try {
    // Check if the child is actually a child of the parent
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

/**
 * Safely removes all child nodes from a parent
 */
export function safeRemoveAllChildren(parent: Node | null): void {
  if (!parent) {
    return
  }

  try {
    // Use a while loop to safely remove all children
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  } catch (error) {
    console.warn('Failed to remove all children:', error)
  }
}

/**
 * Safely appends a child to a parent
 * Prevents errors when the child is already attached elsewhere
 */
export function safeAppendChild(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) {
    return false
  }

  try {
    // If the child is already attached to a parent, remove it first
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

/**
 * Creates a safe DOM cleanup function for React components
 * Use this in useEffect cleanup functions
 */
export function createDOMCleanup() {
  const cleanupTasks: Array<() => void> = []
  
  const addCleanup = (task: () => void) => {
    cleanupTasks.push(task)
  }
  
  const cleanup = () => {
    cleanupTasks.forEach(task => {
      try {
        task()
      } catch (error) {
        console.warn('Cleanup task failed:', error)
      }
    })
    cleanupTasks.length = 0
  }
  
  return { addCleanup, cleanup }
}

/**
 * Global error handler for Chrome 141+ DOM manipulation errors
 * Call this once in your app initialization
 */
export function setupDOMErrorHandler() {
  const originalConsoleError = console.error
  
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    
    // Suppress Chrome 141+ specific DOM manipulation errors
    if (
      message.includes('removeChild') && 
      message.includes('not a child of this node')
    ) {
      console.warn('Chrome 141+ DOM manipulation error suppressed:', ...args)
      return
    }
    
    // Suppress Blink engine related errors
    if (
      message.includes('Blink') || 
      message.includes('Shadow DOM') ||
      message.includes('orphaned node')
    ) {
      console.warn('Chrome 141+ Blink engine error suppressed:', ...args)
      return
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args)
  }
}
