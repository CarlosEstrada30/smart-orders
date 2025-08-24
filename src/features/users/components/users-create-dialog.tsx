import { useState } from 'react'
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
import { usersService, type UserCreate } from '@/services/users'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface UsersCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated: () => void
}

export function UsersCreateDialog({ open, onOpenChange, onUserCreated }: UsersCreateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    username: '',
    full_name: '',
    password: '',
    is_active: true,
    is_superuser: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.username || !formData.full_name || !formData.password) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      await usersService.createUser(formData)
      toast.success('Usuario creado exitosamente')
      onUserCreated()
      onOpenChange(false)
      // Reset form
      setFormData({
        email: '',
        username: '',
        full_name: '',
        password: '',
        is_active: true,
        is_superuser: false
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Error al crear el usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserCreate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa los datos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="nombreusuario"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Usuario activo</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_superuser"
              checked={formData.is_superuser}
              onCheckedChange={(checked) => handleInputChange('is_superuser', checked)}
            />
            <Label htmlFor="is_superuser">Super usuario (administrador)</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
