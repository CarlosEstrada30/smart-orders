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
import { usersService, type User, type UserUpdate } from '@/services/users'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface UsersEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onUserUpdated: () => void
}

export function UsersEditDialog({ open, onOpenChange, user, onUserUpdated }: UsersEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserUpdate>({
    email: '',
    username: '',
    full_name: '',
    password: '',
    is_active: true,
    is_superuser: false
  })

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        password: '', // Don't populate password
        is_active: user.is_active,
        is_superuser: user.is_superuser
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !formData.email || !formData.username || !formData.full_name) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      // Only send password if it's not empty
      const updateData: UserUpdate = {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name,
        is_active: formData.is_active,
        is_superuser: formData.is_superuser
      }
      
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password
      }

      await usersService.updateUser(user.id, updateData)
      toast.success('Usuario actualizado exitosamente')
      onUserUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar el usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserUpdate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario. Deja la contraseña vacía si no deseas cambiarla.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario *</Label>
            <Input
              id="username"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="nombreusuario"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Dejar vacío para mantener la actual"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active || false}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Usuario activo</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_superuser"
              checked={formData.is_superuser || false}
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
              Actualizar Usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
