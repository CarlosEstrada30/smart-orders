import { Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoutes } from './routes-provider'

export function RoutesPrimaryButtons() {
  const { setOpen } = useRoutes()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Nueva Ruta</span> <Route size={18} />
      </Button>
    </div>
  )
}
