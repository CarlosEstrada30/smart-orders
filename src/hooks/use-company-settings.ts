import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { SettingsService } from '@/services'

/**
 * Hook para cargar automáticamente los settings de la empresa cuando el usuario esté autenticado
 */
export function useCompanySettings() {
  const { user, accessToken, companySettings, setCompanySettings } = useAuthStore((state) => state.auth)

  
  // Query para obtener los settings de la empresa
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['company-settings'],
    queryFn: SettingsService.getCompanySettings,
    enabled: !!accessToken, // Solo ejecutar si hay token (el usuario puede no estar cargado aún)
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    retry: 2,
  })

  // Actualizar el store cuando se obtengan los settings
  useEffect(() => {
    if (settings) {
      setCompanySettings(settings)
    }
  }, [settings, setCompanySettings])

  // Limpiar los settings cuando no hay token
  useEffect(() => {
    if (!accessToken) {
      setCompanySettings(null)
    }
  }, [accessToken, setCompanySettings])

  return {
    companySettings,
    isLoading: isLoading || (!!accessToken && !companySettings), // Loading si hay token pero no settings
    error,
    refetch,
    // Helper function para obtener el nombre de la empresa (sin fallback hardcodeado)
    getCompanyName: () => companySettings?.company_name || companySettings?.business_name,
    // Helper function para obtener el logo (sin fallback hardcodeado)  
    getCompanyLogo: () => companySettings?.logo_url,
    // Helper para saber si los settings están disponibles
    hasSettings: !!companySettings,
  }
}

/**
 * Hook para forzar la recarga de los settings de la empresa
 * Útil cuando se actualizan los settings en el módulo de configuración
 */
export function useRefreshCompanySettings() {
  const { refetch } = useQuery({
    queryKey: ['company-settings'],
    queryFn: SettingsService.getCompanySettings,
    enabled: false, // No ejecutar automáticamente
  })

  return refetch
}
