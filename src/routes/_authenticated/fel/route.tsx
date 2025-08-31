/**
 * FEL Routes Layout
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { PermissionGuard } from '@/components/auth/permission-guard'

export const Route = createFileRoute('/_authenticated/fel')({
  component: FELLayout
})

function FELLayout() {
  return (
    <PermissionGuard 
      requiredPermissions={{ 
        orders: { can_view: true },
        reports: { can_view: true }
      }}
    >
      <div className="container mx-auto">
        <Outlet />
      </div>
    </PermissionGuard>
  )
}

