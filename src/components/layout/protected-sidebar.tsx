import { useMemo } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useCompaniesPermissions } from '@/hooks/use-companies-permissions'
import { useCompanySettings } from '@/hooks/use-company-settings'
import { useAuthStore } from '@/stores/auth-store'
import { sidebarData } from './data/sidebar-data'
import { type SidebarData } from './types'

/**
 * Hook que filtra los datos del sidebar basándose en permisos del usuario
 */
export function useFilteredSidebarData(): SidebarData & { isLoading: boolean } {
  const { permissions, isLoading: permissionsLoading } = usePermissions()
  const { canAccessCompanies } = useCompaniesPermissions()
  const { user } = useAuthStore(state => state.auth)
  const { companySettings, isLoading: settingsLoading, hasSettings } = useCompanySettings()

  return useMemo(() => {
    // Si los permisos están cargando, mostrar solo dashboard básico
    if (permissionsLoading) {
      return {
        user,
        teams: [
          {
            name: companySettings?.company_name || 'Empresa',
            logo: companySettings?.logo_url || '/images/favicon.svg',
            plan: 'Loading...',
          },
        ],
        navGroups: [
          {
            title: 'General',
            items: [
              {
                title: 'Dashboard',
                url: '/',
                icon: 'BarChart',
                isActive: true,
                description: 'Panel principal'
              }
            ]
          }
        ],
        isLoading: true
      }
    }

    // Si no hay permisos, mostrar error
    if (!permissions) {
      return {
        user,
        teams: [
          {
            name: 'Error',
            logo: '/images/favicon.svg',
            plan: 'No se pudieron cargar los permisos',
          },
        ],
        navGroups: [],
        isLoading: false
      }
    }
    // Crear datos dinámicos del sidebar
    const dynamicSidebarData: SidebarData = {
      user: user ? {
        name: user.name || user.username || 'Usuario',
        email: user.email || 'usuario@ejemplo.com',
        avatar: '/avatars/shadcn.jpg', // TODO: agregar avatar del usuario si está disponible
      } : sidebarData.user,
      teams: hasSettings && companySettings ? [
        {
          name: companySettings.company_name || companySettings.business_name || 'Mi Empresa',
          logo: companySettings.logo_url || 'Building2', // Will be handled as icon type in TeamSwitcher
          plan: 'Sistema de Gestión',
        },
      ] : [], // Empty array when no settings to avoid showing hardcoded fallbacks
      navGroups: sidebarData.navGroups, // Los grupos de navegación se mantienen igual
    }
    
    if (!permissions) {
      // Si no hay permisos cargados, mostrar solo elementos básicos
      return {
        ...dynamicSidebarData,
        navGroups: dynamicSidebarData.navGroups.map(group => ({
          ...group,
          items: group.items.filter(item => 
            item.title === 'Dashboard' // Solo mostrar dashboard
          )
        }))
      }
    }

    // Aplicar filtros específicos incluso para superusuarios
    // porque algunos módulos tienen restricciones adicionales (como empresas)
    const result: SidebarData = {
      ...dynamicSidebarData,
      navGroups: dynamicSidebarData.navGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
          switch (item.title) {
            case 'Empresas':
              // Restricción especial: solo dominio principal + superusuario
              return canAccessCompanies

            case 'Usuarios':
              return permissions.permissions.users.can_manage

            case 'Clientes':
              return permissions.permissions.clients.can_view

            case 'Productos':
              return permissions.permissions.products.can_manage || 
                     permissions.permissions.products.can_view

            case 'Rutas':
              return permissions.permissions.routes.can_view

            case 'Pedidos':
              return permissions.permissions.orders.can_view

            case 'Inventario':
              return permissions.permissions.inventory.can_manage ||
                     permissions.permissions.inventory.can_approve ||
                     permissions.permissions.inventory.can_complete

            case 'Dashboard':
              return permissions.permissions.reports.can_view

            // Para elementos del menú de configuración, aplicar lógica de superusuario
            case 'Settings':
            case 'Dashboard FEL':
            case 'Facturas':
            case 'Generar Factura':
              return permissions.is_superuser || true // Mostrar para todos por ahora

            default:
              return true // Por defecto, mostrar elementos no categorizados
          }
        })
      })).filter(group => group.items.length > 0) // Remover grupos vacíos
    }
    
    return {
      ...result,
      isLoading: settingsLoading || permissionsLoading
    }
  }, [permissions, permissionsLoading, canAccessCompanies, user, companySettings, settingsLoading, hasSettings])
}
