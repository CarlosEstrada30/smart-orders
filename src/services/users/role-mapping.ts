import { UserRole } from '../auth/permissions.service'

/**
 * Mapeo de roles del frontend a configuración del backend
 */
export interface RoleConfig {
  is_superuser: boolean
  is_active: boolean
  displayName: string
  description: string
  color: string
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  employee: {
    is_superuser: false,
    is_active: true,
    displayName: 'Empleado',
    description: 'Puede crear entradas de inventario en estado borrador',
    color: 'bg-blue-100 text-blue-800'
  },
  sales: {
    is_superuser: false,
    is_active: true,
    displayName: 'Vendedor',
    description: 'Gestiona pedidos, clientes y productos',
    color: 'bg-green-100 text-green-800'
  },
  driver: {
    is_superuser: false,
    is_active: true,
    displayName: 'Repartidor',
    description: 'Actualiza estado de entregas y ve rutas asignadas',
    color: 'bg-yellow-100 text-yellow-800'
  },
  supervisor: {
    is_superuser: false,
    is_active: true,
    displayName: 'Supervisor',
    description: 'Aprueba inventario, gestiona productos y rutas',
    color: 'bg-purple-100 text-purple-800'
  },
  manager: {
    is_superuser: false,
    is_active: true,
    displayName: 'Gerente',
    description: 'Acceso completo excepto gestión de usuarios',
    color: 'bg-red-100 text-red-800'
  },
  admin: {
    is_superuser: true,
    is_active: true,
    displayName: 'Administrador',
    description: 'Superusuario con acceso completo al sistema, puede gestionar todos los módulos y usuarios',
    color: 'bg-gray-100 text-gray-800'
  }
}

/**
 * Mapeo de roles frontend (lowercase) a backend (UPPERCASE)
 */
const FRONTEND_TO_BACKEND_ROLES: Record<UserRole, string> = {
  employee: 'EMPLOYEE',
  sales: 'SALES', 
  driver: 'DRIVER',
  supervisor: 'SUPERVISOR',
  manager: 'MANAGER',
  admin: 'ADMIN'
}

/**
 * Mapeo de roles backend (UPPERCASE) a frontend (lowercase)  
 */
const BACKEND_TO_FRONTEND_ROLES: Record<string, UserRole> = {
  EMPLOYEE: 'employee',
  SALES: 'sales',
  DRIVER: 'driver', 
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  ADMIN: 'admin'
}

/**
 * Convierte un rol del frontend a campos del backend
 * Incluye tanto is_superuser como el rol en formato UPPERCASE para el API
 */
export function roleToBackendFields(role: UserRole): { is_superuser: boolean; role: string } {
  const config = ROLE_CONFIGS[role]
  const backendRole = FRONTEND_TO_BACKEND_ROLES[role]
  
  return {
    is_superuser: config.is_superuser,
    role: backendRole  // Enviar rol en formato del API (UPPERCASE)
  }
}

/**
 * Deriva un rol del frontend basándose en los campos del backend
 * Prioriza el campo 'role' del API si está disponible, sino usa is_superuser como fallback
 */
export function backendFieldsToRole(is_superuser: boolean, email?: string, backendRole?: string): UserRole {
  // Si tenemos el campo role del backend, usarlo directamente
  if (backendRole && BACKEND_TO_FRONTEND_ROLES[backendRole]) {
    return BACKEND_TO_FRONTEND_ROLES[backendRole]
  }
  
  // Fallback: usar is_superuser (para compatibilidad con API anterior)
  // Administrador = Superusuario
  if (is_superuser) {
    return 'admin'
  }
  
  // Por defecto, usuarios regulares son empleados
  return 'employee'
}

/**
 * Obtiene la configuración visual de un rol
 */
export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role]
}

/**
 * Obtiene todos los roles disponibles para selección
 */
export function getAvailableRoles(currentUserRole?: UserRole, currentUserIsSuperuser?: boolean): Array<{ value: UserRole; label: string; description: string }> {
  const allRoles = Object.entries(ROLE_CONFIGS).map(([role, config]) => ({
    value: role as UserRole,
    label: config.displayName,
    description: config.description
  }))

  // Si no hay información del usuario actual, devolver todos los roles
  if (!currentUserRole) {
    return allRoles
  }

  // Si el usuario actual es superusuario/admin, puede asignar cualquier rol
  if (currentUserIsSuperuser || currentUserRole === 'admin') {
    return allRoles
  }

  // Filtrar roles basándose en los permisos del usuario actual
  const filteredRoles = allRoles.filter(role => {
    return canAssignRole(currentUserRole, role.value)
  })

  return filteredRoles
}

/**
 * Valida si un usuario puede asignar un rol específico
 * Por ahora permite todo, pero en el futuro podría restringir según permisos
 */
export function canAssignRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  // Los admins pueden asignar cualquier rol
  if (currentUserRole === 'admin') {
    return true
  }
  
  // Los gerentes pueden asignar roles hasta supervisor
  if (currentUserRole === 'manager') {
    return !['admin', 'manager'].includes(targetRole)
  }
  
  // Los supervisores solo pueden asignar roles básicos
  if (currentUserRole === 'supervisor') {
    return ['employee', 'sales', 'driver'].includes(targetRole)
  }
  
  // Otros roles no pueden asignar roles
  return false
}
