import React from 'react'
import { usePermissions, useRole } from '@/hooks/use-permissions'
import { permissionsService, type UserRole } from '@/services/auth/permissions.service'

interface PermissionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  // Permisos específicos
  inventoryPermission?: keyof import('@/services/auth/permissions.service').InventoryPermissions
  orderPermission?: keyof import('@/services/auth/permissions.service').OrdersPermissions
  productPermission?: keyof import('@/services/auth/permissions.service').ProductsPermissions
  clientPermission?: keyof import('@/services/auth/permissions.service').ClientsPermissions
  routePermission?: keyof import('@/services/auth/permissions.service').RoutesPermissions
  reportPermission?: keyof import('@/services/auth/permissions.service').ReportsPermissions
  userPermission?: keyof import('@/services/auth/permissions.service').UsersPermissions
  // Roles
  requiredRole?: UserRole
  anyRole?: UserRole[]
  requireSuperuser?: boolean
  // Lógica
  requireAll?: boolean // true = AND, false = OR
}

/**
 * Componente para proteger contenido basado en permisos
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null,
  inventoryPermission,
  orderPermission,
  productPermission,
  clientPermission,
  routePermission,
  reportPermission,
  userPermission,
  requiredRole,
  anyRole,
  requireSuperuser = false,
  requireAll = false // Por defecto OR
}) => {
  const { permissions } = usePermissions()
  const { hasRole, isSuperuser } = useRole()

  // Si no hay permisos cargados, no mostrar nada
  if (!permissions) {
    return <>{fallback}</>
  }

  // Si es superusuario, permitir todo (excepto si requireSuperuser está específicamente requerido)
  if (isSuperuser && !requireSuperuser) {
    return <>{children}</>
  }

  // Si requiere superusuario y no lo es
  if (requireSuperuser && !isSuperuser) {
    return <>{fallback}</>
  }

  const checks: boolean[] = []

  // Verificar permisos específicos
  if (inventoryPermission) {
    checks.push(permissionsService.hasInventoryPermission(permissions, inventoryPermission))
  }
  if (orderPermission) {
    checks.push(permissionsService.hasOrderPermission(permissions, orderPermission))
  }
  if (productPermission) {
    checks.push(permissionsService.hasProductPermission(permissions, productPermission))
  }
  if (clientPermission) {
    checks.push(permissionsService.hasClientPermission(permissions, clientPermission))
  }
  if (routePermission) {
    checks.push(permissionsService.hasRoutePermission(permissions, routePermission))
  }
  if (reportPermission) {
    checks.push(permissionsService.hasReportPermission(permissions, reportPermission))
  }
  if (userPermission) {
    checks.push(permissionsService.hasUserPermission(permissions, userPermission))
  }

  // Verificar roles
  if (requiredRole) {
    checks.push(hasRole(requiredRole))
  }
  if (anyRole && anyRole.length > 0) {
    checks.push(anyRole.some(role => hasRole(role)))
  }

  // Si no hay checks definidos, permitir acceso
  if (checks.length === 0) {
    return <>{children}</>
  }

  // Aplicar lógica AND/OR
  const hasPermission = requireAll 
    ? checks.every(check => check)  // Todos deben ser true
    : checks.some(check => check)   // Al menos uno debe ser true

  return hasPermission ? <>{children}</> : <>{fallback}</>
}

/**
 * Componente para mostrar contenido solo si NO tiene permisos
 */
export const NoPermissionGuard: React.FC<{
  children: React.ReactNode
  requiredRole?: UserRole
}> = ({ children, requiredRole }) => {
  const { hasRole } = useRole()
  
  if (requiredRole && hasRole(requiredRole)) {
    return null
  }
  
  return <>{children}</>
}

/**
 * Componente para mostrar badge de rol del usuario
 */
export const UserRoleBadge: React.FC<{
  showDisplayName?: boolean
  className?: string
}> = ({ showDisplayName = true, className = '' }) => {
  const { role, roleDisplayName, roleColor } = useRole()

  if (!role) return null

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor} ${className}`}>
      {showDisplayName ? roleDisplayName : role.toUpperCase()}
    </span>
  )
}

/**
 * Hook para verificar múltiples permisos de manera fácil
 */
export const useHasAnyPermission = (permissionChecks: Array<() => boolean>): boolean => {
  return permissionChecks.some(check => check())
}

export const useHasAllPermissions = (permissionChecks: Array<() => boolean>): boolean => {
  return permissionChecks.every(check => check())
}
