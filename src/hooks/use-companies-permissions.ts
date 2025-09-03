import { useRole } from './use-permissions'
import { hasSubdomain } from '@/utils/subdomain'

/**
 * Hook para verificar si el usuario puede acceder al módulo de empresas
 * 
 * Condiciones:
 * 1. No debe haber subdominio (dominio principal)
 * 2. El usuario debe ser superusuario
 */
export function useCompaniesPermissions() {
  const { isSuperuser } = useRole()
  const isMainDomain = !hasSubdomain()

  const canAccessCompanies = isMainDomain && isSuperuser
  const canManageCompanies = canAccessCompanies // Same condition for now

  // Debug logging
  if (import.meta.env.DEV) {
    console.log('🔍 Companies Permissions Debug:', {
      hostname: window.location.hostname,
      subdomain: hasSubdomain() ? 'YES' : 'NO',
      isMainDomain,
      isSuperuser,
      canAccessCompanies,
    })
  }

  return {
    canAccessCompanies,
    canManageCompanies,
    isMainDomain,
    isSuperuser,
    // Razones por las que no puede acceder (para mostrar mensajes informativos)
    denialReasons: {
      isSubdomain: !isMainDomain,
      notSuperuser: !isSuperuser,
    }
  }
}
