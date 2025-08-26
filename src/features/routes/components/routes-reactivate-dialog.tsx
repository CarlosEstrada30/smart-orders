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

interface RoutesReactivateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: Route | null
  onRouteReactivated: () => void
}

export function RoutesReactivateDialog({ open, onOpenChange, route, onRouteReactivated }: RoutesReactivateDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleReactivate = async () => {
    if (!route) return

    try {
      setLoading(true)
      await routesService.reactivateRoute(route.id)
      toast.success('Ruta reactivada exitosamente')
      onRouteReactivated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error reactivating route:', error)
      toast.error('Error al reactivar la ruta')
    } finally {
      setLoading(false)
    }
  }

  if (!route) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Reactivar ruta?</DialogTitle>
          <DialogDescription>
            Esta acción volverá a activar la ruta y estará disponible para ser asignada a nuevas órdenes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-green-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Ruta a reactivar:</h4>
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
          <Button onClick={handleReactivate} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reactivar Ruta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
