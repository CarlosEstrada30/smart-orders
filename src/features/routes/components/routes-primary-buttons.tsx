import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoutes } from './routes-provider'
import { PermissionGuard } from '@/components/auth/permission-guard'

export function RoutesPrimaryButtons() {
  const { setOpen } = useRoutes()
  return (
    <div className='flex gap-2'>
      <PermissionGuard routePermission="can_manage">
        <Button onClick={() => setOpen('create')}>
          <Plus aria-hidden='true' />
          Nueva ruta
        </Button>
      </PermissionGuard>
    </div>
  )
}
