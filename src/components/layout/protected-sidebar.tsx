import { useMemo } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useCompaniesPermissions } from '@/hooks/use-companies-permissions'
import { useAuthStore } from '@/stores/auth-store'
import { sidebarData } from './data/sidebar-data'
import { type SidebarData } from './types'

/**
 * Hook que filtra los datos del sidebar basándose en permisos del usuario
 */
export function useFilteredSidebarData(): SidebarData {
  const { permissions } = usePermissions()
  const { canAccessCompanies } = useCompaniesPermissions()
  const { user, companySettings } = useAuthStore(state => state.auth)

  return useMemo(() => {
    // Crear datos dinámicos del sidebar con company settings
    const dynamicSidebarData: SidebarData = {
      user: user ? {
        name: user.name || user.username || 'Usuario',
        email: user.email || 'usuario@ejemplo.com',
        avatar: '/avatars/shadcn.jpg', // TODO: agregar avatar del usuario si está disponible
      } : sidebarData.user,
      teams: [
        {
          name: companySettings?.company_name || companySettings?.business_name || 'SmartOrders',
          logo: companySettings?.logo_url || '/images/bethel.jpeg',
          plan: 'Sistema de Gestión',
        },
      ],
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
    return {
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
  }, [permissions, canAccessCompanies, user, companySettings])
}
