import { useAuthStore } from '@/stores/auth-store'

interface LogoutProtectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente que protege el contenido durante el proceso de logout
 * para evitar errores en componentes que acceden a datos del usuario
 */
export function LogoutProtection({ children, fallback = null }: LogoutProtectionProps) {
  const { isLoggingOut } = useAuthStore((state) => state.auth)

  if (isLoggingOut) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * HOC para proteger componentes durante logout
 */
export function withLogoutProtection<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: T) {
    return (
      <LogoutProtection fallback={fallback}>
        <Component {...props} />
      </LogoutProtection>
    )
  }
}


