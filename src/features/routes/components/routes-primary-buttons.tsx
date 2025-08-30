import { Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoutes } from './routes-provider'
import { PermissionGuard } from '@/components/auth/permission-guard'

export function RoutesPrimaryButtons() {
  const { setOpen } = useRoutes()
  return (
    <div className='flex gap-2'>
      <PermissionGuard routePermission="can_manage">
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Nueva Ruta</span> <Route size={18} />
        </Button>
      </PermissionGuard>
    </div>
  )
}
