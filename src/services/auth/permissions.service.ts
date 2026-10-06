import { apiClient } from '../api/client'

// ===== TYPES =====
export type UserRole = 'employee' | 'sales' | 'driver' | 'supervisor' | 'manager' | 'admin'

export interface InventoryPermissions {
  can_manage: boolean
  can_approve: boolean
  can_complete: boolean
}

export interface OrdersPermissions {
  can_manage: boolean
  can_create: boolean
  can_view: boolean
  can_update_delivery: boolean  // Coincide con JSON del API
}

export interface ProductsPermissions {
  can_manage: boolean
  can_view: boolean
  can_view_prices: boolean
  can_view_costs: boolean
}

export interface ClientsPermissions {
  can_manage: boolean
  can_view: boolean
}

export interface RoutesPermissions {
  can_manage: boolean
  can_view: boolean
}

export interface ReportsPermissions {
  can_view: boolean
}

export interface UsersPermissions {
  can_manage: boolean
}

export interface UserPermissions {
  role: UserRole
  is_superuser: boolean
  permissions: {
    inventory: InventoryPermissions
    orders: OrdersPermissions
    products: ProductsPermissions
    clients: ClientsPermissions
    routes: RoutesPermissions
    reports: ReportsPermissions
    users: UsersPermissions
  }
}

// ===== SERVICE =====
export const permissionsService = {
  /**
   * Obtener permisos del usuario actual
   */
  async getCurrentUserPermissions(): Promise<UserPermissions> {
    return apiClient.get<UserPermissions>('/auth/permissions')
  },

  /**
   * Verificar si el usuario tiene un permiso específico de inventario
   */
  hasInventoryPermission(permissions: UserPermissions | null, permission: keyof InventoryPermissions): boolean {
    if (!permissions) return false
    return permissions.permissions.inventory[permission]
  },

  /**
   * Verificar si el usuario tiene un permiso específico de pedidos
   */
  hasOrderPermission(permissions: UserPermissions | null, permission: keyof OrdersPermissions): boolean {
    if (!permissions) return false
    return permissions.permissions.orders[permission]
  },

  /**
   * Verificar si el usuario tiene un permiso específico de productos
   */
  hasProductPermission(permissions: UserPermissions | null, permission: keyof ProductsPermissions): boolean {
    if (!permissions) return false
    return permissions.permissions.products[permission]
  },

  /**
   * Verificar si el usuario tiene un permiso específico de clientes
   */
  hasClientPermission(permissions: UserPermissions | null, permission: keyof ClientsPermissions): boolean {
    if (!permissions) return false
    return permissions.permissions.clients[permission]
  },

  /**
   * Verificar si el usuario tiene un permiso específico de rutas
   */
  hasRoutePermission(permissions: UserPermissions | null, permission: keyof RoutesPermissions): boolean {
    if (!permissions) return false
    return permissions.permissions.routes[permission]
  },

  /**
   * Verificar si el usuario tiene un permiso específico de reportes
   */
  hasReportPermission(permissions: UserPermissions | null, permission: keyof ReportsPermissions): boolean {
    if (!permissions) return false
    return permissions.permissions.reports[permission]
  },

  /**
   * Verificar si el usuario tiene un permiso específico de usuarios
   */
  hasUserPermission(permissions: UserPermissions | null, permission: keyof UsersPermissions): boolean {
    if (!permissions) return false
    return permissions.permissions.users[permission]
  },

  /**
   * Verificar si el usuario tiene un rol específico o superior
   */
  hasRole(permissions: UserPermissions | null, role: UserRole): boolean {
    if (!permissions) return false
    
    const roleHierarchy: Record<UserRole, number> = {
      employee: 1,
      sales: 2,
      driver: 2, // mismo nivel que sales pero diferentes permisos
      supervisor: 3,
      manager: 4,
      admin: 5
    }

    const userRoleLevel = roleHierarchy[permissions.role]
    const requiredRoleLevel = roleHierarchy[role]

    return userRoleLevel >= requiredRoleLevel
  },

  /**
   * Verificar si el usuario es superusuario
   */
  isSuperuser(permissions: UserPermissions | null): boolean {
    return permissions?.is_superuser || false
  },

  /**
   * Obtener el nombre legible del rol
   */
  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      employee: 'Empleado',
      sales: 'Vendedor',
      driver: 'Repartidor',
      supervisor: 'Supervisor',
      manager: 'Gerente',
      admin: 'Administrador'
    }
    return roleNames[role]
  },

  /**
   * Obtener el color del badge para el rol
   */
  getRoleColor(role: UserRole): string {
    const roleColors: Record<UserRole, string> = {
      employee: 'bg-info/15 text-info',
      sales: 'bg-success/15 text-success',
      driver: 'bg-warning/20 text-warning-foreground dark:text-warning',
      supervisor: 'bg-primary/15 text-primary',
      manager: 'bg-destructive/15 text-destructive',
      admin: 'bg-muted text-foreground'
    }
    return roleColors[role]
  }
}
