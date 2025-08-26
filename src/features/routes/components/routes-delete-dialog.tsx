import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { routesService, type Route } from '@/services'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RoutesDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: Route | null
  onRouteDeleted: () => void
}

export function RoutesDeleteDialog({ open, onOpenChange, route, onRouteDeleted }: RoutesDeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!route) return

    try {
      setLoading(true)
      await routesService.deleteRoute(route.id)
      toast.success('Ruta desactivada exitosamente')
      onRouteDeleted()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting route:', error)
      toast.error('Error al desactivar la ruta')
    } finally {
      setLoading(false)
    }
  }

  if (!route) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desactivar ruta?</DialogTitle>
          <DialogDescription>
            Esta acción desactivará la ruta temporalmente. Podrás reactivarla más tarde si es necesario.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Ruta a desactivar:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Nombre:</strong> {route.name}</p>
            <p><strong>Estado actual:</strong> {route.is_active ? 'Activa' : 'Inactiva'}</p>
            <p><strong>Fecha de creación:</strong> {new Date(route.created_at).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Desactivar Ruta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
