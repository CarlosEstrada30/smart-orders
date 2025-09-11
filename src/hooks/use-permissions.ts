import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { 
  permissionsService, 
  type UserPermissions, 
  type UserRole,
  type InventoryPermissions,
  type OrdersPermissions,
  type ProductsPermissions,
  type ClientsPermissions,
  type RoutesPermissions,
  type ReportsPermissions,
  type UsersPermissions
} from '@/services/auth/permissions.service'

/**
 * Hook principal para gestión de permisos
 */
export const usePermissions = () => {
  const { permissions, setPermissions, accessToken } = useAuthStore((state) => state.auth)

  /**
   * Cargar permisos del usuario actual
   */
  const loadPermissions = async () => {
    try {
      const userPermissions = await permissionsService.getCurrentUserPermissions()
      setPermissions(userPermissions)
      return userPermissions
    } catch (error) {
      console.error('Error loading permissions:', error)
      // En caso de error, establecer permisos vacíos en lugar de null
      // para evitar loops de loading infinito
      setPermissions({
        role: 'cashier',
        is_superuser: false,
        permissions: {
          inventory: { can_manage: false, can_approve: false, can_complete: false },
          orders: { can_view: false, can_create: false, can_update: false, can_delete: false, can_update_delivery: false },
          products: { can_view: false, can_manage: false },
          clients: { can_view: false, can_manage: false },
          routes: { can_view: false, can_manage: false },
          reports: { can_view: false },
          users: { can_manage: false }
        }
      })
      return null
    }
  }

  /**
   * Limpiar permisos
   */
  const clearPermissions = () => {
    setPermissions(null)
  }

  return {
    permissions,
    loadPermissions,
    clearPermissions,
    // Determinar si está cargando: hay token pero no hay permisos
    isLoading: !!accessToken && permissions === null,
    // Determinar si falló la carga de permisos
    hasPermissions: permissions !== null
  }
}

/**
 * Hook para verificar permisos de inventario
 */
export const useInventoryPermissions = () => {
  const { permissions } = usePermissions()

  const canManage = permissionsService.hasInventoryPermission(permissions, 'can_manage')
  const canApprove = permissionsService.hasInventoryPermission(permissions, 'can_approve')
  const canComplete = permissionsService.hasInventoryPermission(permissions, 'can_complete')
  const canViewCosts = permissionsService.hasInventoryPermission(permissions, 'can_view_costs')

  return {
    canManage,
    canApprove,
    canComplete,
    canViewCosts,
    permissions: permissions?.permissions.inventory
  }
}

/**
 * Hook para verificar permisos de pedidos
 */
export const useOrderPermissions = () => {
  const { permissions } = usePermissions()

  const canManage = permissionsService.hasOrderPermission(permissions, 'can_manage')
  const canCreate = permissionsService.hasOrderPermission(permissions, 'can_create')
  const canView = permissionsService.hasOrderPermission(permissions, 'can_view')
  const canUpdateDelivery = permissionsService.hasOrderPermission(permissions, 'can_update_delivery')

  return {
    canManage,
    canCreate,
    canView,
    canUpdateDelivery,
    permissions: permissions?.permissions.orders
  }
}

/**
 * Hook para verificar permisos de productos
 */
export const useProductPermissions = () => {
  const { permissions } = usePermissions()

  const canManage = permissionsService.hasProductPermission(permissions, 'can_manage')
  const canView = permissionsService.hasProductPermission(permissions, 'can_view')
  const canViewPrices = permissionsService.hasProductPermission(permissions, 'can_view_prices')
  const canViewCosts = permissionsService.hasProductPermission(permissions, 'can_view_costs')

  return {
    canManage,
    canView,
    canViewPrices,
    canViewCosts,
    permissions: permissions?.permissions.products
  }
}

/**
 * Hook para verificar permisos de clientes
 */
export const useClientPermissions = () => {
  const { permissions } = usePermissions()

  const canManage = permissionsService.hasClientPermission(permissions, 'can_manage')
  const canView = permissionsService.hasClientPermission(permissions, 'can_view')

  return {
    canManage,
    canView,
    permissions: permissions?.permissions.clients
  }
}

/**
 * Hook para verificar permisos de rutas
 */
export const useRoutePermissions = () => {
  const { permissions } = usePermissions()

  const canManage = permissionsService.hasRoutePermission(permissions, 'can_manage')
  const canView = permissionsService.hasRoutePermission(permissions, 'can_view')

  return {
    canManage,
    canView,
    permissions: permissions?.permissions.routes
  }
}

/**
 * Hook para verificar permisos de reportes
 */
export const useReportPermissions = () => {
  const { permissions } = usePermissions()

  const canView = permissionsService.hasReportPermission(permissions, 'can_view')

  return {
    canView,
    permissions: permissions?.permissions.reports
  }
}

/**
 * Hook para verificar permisos de usuarios
 */
export const useUserPermissions = () => {
  const { permissions } = usePermissions()

  const canManage = permissionsService.hasUserPermission(permissions, 'can_manage')

  return {
    canManage,
    permissions: permissions?.permissions.users
  }
}

/**
 * Hook para verificar roles
 */
export const useRole = () => {
  const { permissions } = usePermissions()

  const hasRole = (role: UserRole) => permissionsService.hasRole(permissions, role)
  const isSuperuser = permissionsService.isSuperuser(permissions)

  const isEmployee = hasRole('employee')
  const isSales = hasRole('sales')
  const isDriver = hasRole('driver')
  const isSupervisor = hasRole('supervisor')
  const isManager = hasRole('manager')
  const isAdmin = hasRole('admin')

  return {
    role: permissions?.role,
    hasRole,
    isSuperuser,
    isEmployee,
    isSales,
    isDriver,
    isSupervisor,
    isManager,
    isAdmin,
    roleDisplayName: permissions?.role ? permissionsService.getRoleDisplayName(permissions.role) : '',
    roleColor: permissions?.role ? permissionsService.getRoleColor(permissions.role) : ''
  }
}

/**
 * Hook personalizado para cargar permisos automáticamente
 */
export const useAutoLoadPermissions = (enabled = true) => {
  const { loadPermissions, permissions } = usePermissions()
  const { accessToken } = useAuthStore((state) => state.auth)

  useEffect(() => {
    if (enabled && accessToken && !permissions) {
      loadPermissions()
    }
  }, [enabled, accessToken, permissions, loadPermissions])

  return { permissions, isLoaded: permissions !== null }
}
