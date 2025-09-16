import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true)
    
    // Solo ejecutar la lógica de detección de móvil después de la hidratación
    if (typeof window === 'undefined') return

    const checkIsMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT
    }

    // Establecer el valor inicial
    setIsMobile(checkIsMobile())

    // Configurar el listener de cambios
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(checkIsMobile())
    }

    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // Durante SSR o antes de la hidratación, devolver false para consistencia
  return isClient ? isMobile : false
}
