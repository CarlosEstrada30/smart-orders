import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { routesService, type CreateRouteRequest } from '@/services'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RoutesCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRouteCreated: () => void
}

export function RoutesCreateDialog({ open, onOpenChange, onRouteCreated }: RoutesCreateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateRouteRequest>({
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Por favor ingresa el nombre de la ruta')
      return
    }

    try {
      setLoading(true)
      await routesService.createRoute(formData)
      toast.success('Ruta creada exitosamente')
      onRouteCreated()
      onOpenChange(false)
      // Reset form
      setFormData({ name: '' })
    } catch (error) {
      console.error('Error creating route:', error)
      toast.error('Error al crear la ruta')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateRouteRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Ruta</DialogTitle>
          <DialogDescription>
            Ingresa el nombre para crear una nueva ruta en el sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Ruta *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Ruta Norte, Ruta Centro..."
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Ruta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
