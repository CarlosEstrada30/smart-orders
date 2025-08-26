import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { routesService, type Route, type UpdateRouteRequest } from '@/services'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RoutesEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: Route | null
  onRouteUpdated: () => void
}

export function RoutesEditDialog({ open, onOpenChange, route, onRouteUpdated }: RoutesEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateRouteRequest>({
    name: '',
    is_active: true
  })

  // Update form data when route changes
  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name,
        is_active: route.is_active
      })
    }
  }, [route])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!route) return
    
    if (!formData.name?.trim()) {
      toast.error('Por favor ingresa el nombre de la ruta')
      return
    }

    try {
      setLoading(true)
      await routesService.updateRoute(route.id, formData)
      toast.success('Ruta actualizada exitosamente')
      onRouteUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating route:', error)
      toast.error('Error al actualizar la ruta')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateRouteRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!route) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Ruta</DialogTitle>
          <DialogDescription>
            Modifica los datos de la ruta "{route.name}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Ruta *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Ruta Norte, Ruta Centro..."
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active || false}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Ruta activa</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Ruta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
