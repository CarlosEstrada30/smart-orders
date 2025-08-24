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
import { usersService, type User } from '@/services/users'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface UsersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onUserDeleted: () => void
}

export function UsersDeleteDialog({ open, onOpenChange, user, onUserDeleted }: UsersDeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!user) return

    try {
      setLoading(true)
      await usersService.deleteUser(user.id)
      toast.success('Usuario eliminado exitosamente')
      onUserDeleted()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar el usuario')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar usuario?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Usuario a eliminar:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Nombre:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Usuario:</strong> {user.username}</p>
            <p><strong>Tipo:</strong> {user.is_superuser ? 'Super usuario' : 'Usuario normal'}</p>
            <p><strong>Estado:</strong> {user.is_active ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}