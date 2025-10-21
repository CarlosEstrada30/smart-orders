import React, { Component } from 'react'
import { useAuthStore } from '@/stores/auth-store'

interface LogoutInterceptorState {
  hasError: boolean
}

interface LogoutInterceptorProps {
  children: React.ReactNode
}

/**
 * Error Boundary que intercepta errores durante el logout
 * y previene que se muestre la página 500
 */
class LogoutErrorBoundary extends Component<
  LogoutInterceptorProps & { isLoggingOut: boolean },
  LogoutInterceptorState
> {
  constructor(props: LogoutInterceptorProps & { isLoggingOut: boolean }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): LogoutInterceptorState {
    // Siempre establecer estado de error cuando hay un error
    // La lógica de logout se maneja en el render()
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Si está haciendo logout, no loggeamos el error ni lo propagamos
    if (this.props.isLoggingOut) {
      console.log('Error durante logout ignorado:', error.message)
      return
    }
    
    // Handle DOM manipulation errors specifically
    if (error.name === 'NotFoundError' && error.message.includes('removeChild')) {
      console.warn('DOM manipulation error during logout:', error.message)
      // Don't treat this as a critical error
      return
    }
    
    // Si no está haciendo logout, es un error real
    console.error('Error en aplicación:', error, errorInfo)
  }

  componentDidUpdate(prevProps: LogoutInterceptorProps & { isLoggingOut: boolean }) {
    // Si terminó el logout, reset el estado del error
    if (prevProps.isLoggingOut && !this.props.isLoggingOut && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    // Si está haciendo logout, SIEMPRE mostrar pantalla de carga (ignorar cualquier error)
    if (this.props.isLoggingOut) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Cerrando sesión...</p>
          </div>
        </div>
      )
    }

    // Si hay error Y NO está haciendo logout, mostrar mensaje de error
    if (this.state.hasError && !this.props.isLoggingOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Error de Aplicación</h1>
            <p className="text-muted-foreground">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Recargar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Wrapper que conecta el Error Boundary con el estado de logout
 */
export function LogoutInterceptor({ children }: LogoutInterceptorProps) {
  const { isLoggingOut } = useAuthStore((state) => state.auth)
  
  return (
    <LogoutErrorBoundary isLoggingOut={isLoggingOut}>
      {children}
    </LogoutErrorBoundary>
  )
}

