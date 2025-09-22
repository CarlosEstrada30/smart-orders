import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useNavigationCleanup } from '@/hooks/use-navigation-cleanup'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, UserCheck, MapPin, Phone, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { clientsService, type Client, type CreateClientRequest, type UpdateClientRequest } from '@/services/clients'
import { ApiError } from '@/services/api/config'
import { PermissionGuard } from '@/components/auth/permission-guard'

export function ClientsPage() {
  const { isMounted, safeAsync } = useNavigationCleanup()
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  // Estado para el modal de nuevo cliente
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false)
  const [newClientForm, setNewClientForm] = useState<CreateClientRequest>({
    name: '',
    email: '',
    phone: '',
    nit: '',
    address: '',
  })
  const [creatingClient, setCreatingClient] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Estado para el modal de editar cliente
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false)
  const [editClientForm, setEditClientForm] = useState<UpdateClientRequest>({
    name: '',
    email: '',
    phone: '',
    nit: '',
    address: '',
  })
  const [editingClient, setEditingClient] = useState(false)
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

  // Función para abrir modal de editar cliente
  const handleEditClient = (client: Client) => {
    setClientToEdit(client)
    setEditClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      nit: client.nit || '',
      address: client.address || '',
    })
    setEditFormError(null)
    setEditClientDialogOpen(true)
  }

  // Función para actualizar cliente
  const handleUpdateClient = async () => {
    if (!clientToEdit) return

    // Validación básica
    if (!editClientForm.name || !editClientForm.name.trim()) {
      setEditFormError('El nombre es obligatorio')
      return
    }

    // Validación de email (solo si se proporciona)
    if (editClientForm.email && editClientForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editClientForm.email)) {
      setEditFormError('Por favor ingresa un email válido')
      return
    }

    try {
      setEditingClient(true)
      setEditFormError(null)

      await clientsService.updateClient(clientToEdit.id, editClientForm)

      // Cliente actualizado exitosamente
      toast.success('Cliente actualizado exitosamente')
      setEditClientDialogOpen(false)
      
      // Recargar la lista de clientes
      fetchClients()
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error desconocido al actualizar el cliente'
      setEditFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setEditingClient(false)
    }
  }

  // Función para obtener los clientes de la API
  const fetchClients = async () => {
    if (!isMounted()) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await clientsService.getClients({ skip: 0, limit: 100, active_only: true })
      
      // Solo actualizar estado si el componente aún está montado
      if (isMounted()) {
        setClients(data)
      }
    } catch (err) {
      if (!isMounted()) return // No actualizar estado si el componente ya no está montado
      
      let errorMessage = 'Error al cargar los clientes'
      
      if (err instanceof ApiError) {
        errorMessage = err.detail
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      console.error('Error loading clients:', err)
      setError(errorMessage)
    } finally {
      if (isMounted()) {
        setLoading(false)
      }
    }
  }

  // Función para eliminar cliente
  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      setDeleting(true)
      
      await clientsService.deleteClient(clientToDelete.id)

      // Cliente eliminado exitosamente
      toast.success('Cliente eliminado exitosamente')
      
      // Actualizar la lista de clientes
      setClients(clients.filter(client => client.id !== clientToDelete.id))
      
      // Cerrar diálogo
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error al eliminar el cliente'
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  // Función para abrir diálogo de eliminación
  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  // Función para abrir modal de nuevo cliente
  const handleNewClient = () => {
    setNewClientDialogOpen(true)
    setNewClientForm({ name: '', email: '', phone: '', nit: '', address: '' })
    setFormError(null)
  }

  // Función para crear nuevo cliente
  const handleCreateClient = async () => {
    // Validación básica
    if (!newClientForm.name.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }

    // Validación de email (solo si se proporciona)
    if (newClientForm.email && newClientForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientForm.email)) {
      setFormError('Por favor ingresa un email válido')
      return
    }

    try {
      setCreatingClient(true)
      setFormError(null)

      await clientsService.createClient(newClientForm)

      // Cliente creado exitosamente
      toast.success('Cliente creado exitosamente')
      setNewClientDialogOpen(false)
      
      // Recargar la lista de clientes
      fetchClients()
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error desconocido al crear el cliente'
      setFormError(errorMessage)
    } finally {
      setCreatingClient(false)
    }
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients()
  }, []) // Sin dependencias para evitar bucles

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.nit && client.nit.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'destructive'
  }

  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground">
                Gestiona los clientes de la quesería
              </p>
            </div>
            <PermissionGuard clientPermission="can_manage">
              <Button onClick={handleNewClient}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </PermissionGuard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cargando clientes...</CardTitle>
              <CardDescription>
                Obteniendo datos de la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Cargando...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground">
                Gestiona los clientes de la quesería
              </p>
            </div>
            <PermissionGuard clientPermission="can_manage">
              <Button onClick={handleNewClient}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </PermissionGuard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error al cargar clientes</CardTitle>
              <CardDescription>
                No se pudieron obtener los datos de la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchClients}>
                    Reintentar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gestiona los clientes de la quesería
            </p>
          </div>
          <Button onClick={handleNewClient}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {filteredClients.length} clientes encontrados
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span>{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.nit || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {client.phone || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[200px]">{client.address || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(client.is_active)}>
                        {client.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <PermissionGuard clientPermission="can_manage">
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard clientPermission="can_manage">
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => openDeleteDialog(client)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el cliente{' '}
              <span className="font-semibold">{clientToDelete?.name}</span> de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para crear nuevo cliente */}
      <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Completa los datos del nuevo cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">Nombre *</Label>
                <Input
                  id="modal-name"
                  type="text"
                  placeholder="Nombre completo del cliente"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-email">Email</Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={newClientForm.email || ''}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-nit">NIT</Label>
                <Input
                  id="modal-nit"
                  type="text"
                  placeholder="123456789-0"
                  value={newClientForm.nit || ''}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, nit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-phone">Teléfono</Label>
                <Input
                  id="modal-phone"
                  type="tel"
                  placeholder="+50223456789"
                  value={newClientForm.phone || ''}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-address">Dirección</Label>
                <Textarea
                  id="modal-address"
                  placeholder="Dirección completa del cliente"
                  value={newClientForm.address || ''}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            
            {/* Mensaje de Error */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{formError}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setNewClientDialogOpen(false)}
              disabled={creatingClient}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleCreateClient}
              disabled={creatingClient}
            >
              {creatingClient ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar cliente */}
      <Dialog open={editClientDialogOpen} onOpenChange={setEditClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica los datos del cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  type="text"
                  placeholder="Nombre completo del cliente"
                  value={editClientForm.name || ''}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={editClientForm.email || ''}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nit">NIT</Label>
                <Input
                  id="edit-nit"
                  type="text"
                  placeholder="123456789-0"
                  value={editClientForm.nit || ''}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, nit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="+50223456789"
                  value={editClientForm.phone || ''}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Textarea
                  id="edit-address"
                  placeholder="Dirección completa del cliente"
                  value={editClientForm.address || ''}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            
            {/* Mensaje de Error */}
            {editFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{editFormError}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setEditClientDialogOpen(false)}
              disabled={editingClient}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleUpdateClient}
              disabled={editingClient}
            >
              {editingClient ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Main>
  )
} 