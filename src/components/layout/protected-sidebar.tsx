import { useMemo } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useCompaniesPermissions } from '@/hooks/use-companies-permissions'
import { sidebarData } from './data/sidebar-data'
import { type SidebarData } from './types'

/**
 * Hook que filtra los datos del sidebar basándose en permisos del usuario
 */
export function useFilteredSidebarData(): SidebarData {
  const { permissions } = usePermissions()
  const { canAccessCompanies } = useCompaniesPermissions()

  return useMemo(() => {
    if (!permissions) {
      // Si no hay permisos cargados, mostrar solo elementos básicos
      return {
        ...sidebarData,
        navGroups: sidebarData.navGroups.map(group => ({
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
      ...sidebarData,
      navGroups: sidebarData.navGroups.map(group => ({
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
  }, [permissions, canAccessCompanies])
}
