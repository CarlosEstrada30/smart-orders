import { ProductionDashboard } from '@/features/production-dashboard'
import { Main } from '@/components/layout/main'
import { PermissionGuard } from '@/components/auth/permission-guard'

export function ProductionPage() {
  return (
    <Main>
      <PermissionGuard orderPermission="can_view">
        <ProductionDashboard />
      </PermissionGuard>
    </Main>
  )
}


