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

  static getDerivedStateFromError(_: Error): LogoutInterceptorState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Si está haciendo logout, no loggeamos el error ni lo propagamos
    if (this.props.isLoggingOut) {
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
    // Si está haciendo logout, mostrar pantalla en blanco independientemente del error
    if (this.props.isLoggingOut) {
      return <div className="min-h-screen bg-background animate-pulse" />
    }

    // Si hay error y NO está haciendo logout, propagar el error normalmente
    if (this.state.hasError) {
      throw new Error('Application error (not during logout)')
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

