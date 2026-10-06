import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { StatusBadge } from '@/components/status-badge'
import { Main } from '@/components/layout/main'
import { AlertCircle, Plus, Search, SearchX, MoreHorizontal, Edit, Trash2, UserCheck, Users, MapPin, Phone, Save, Loader2, Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { clientsService, type Client, type CreateClientRequest, type UpdateClientRequest, type BulkUploadResult as ClientBulkUploadResult } from '@/services/clients'
import { ApiError } from '@/services/api/config'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { BulkImport } from '@/components/bulk-import'
import { ClientPagination } from '@/components/ui/client-pagination'

export function ClientsPage() {
  const { isMounted } = useNavigationCleanup()
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
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

  // Estado para el modal de importación
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // Estado para exportación
  const [isExporting, setIsExporting] = useState(false)

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

      // Verificar que el componente aún está montado antes de actualizar estado
      if (!isMounted()) return

      // Cliente actualizado exitosamente
      toast.success('Cliente actualizado exitosamente')
      setEditClientDialogOpen(false)
      
      // Recargar la lista de clientes
      fetchClients()
    } catch (err) {
      if (!isMounted()) return
      
      const errorMessage = err instanceof ApiError ? err.detail : 'Error desconocido al actualizar el cliente'
      setEditFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      if (isMounted()) {
        setEditingClient(false)
      }
    }
  }

  // Función para obtener los clientes de la API
  const fetchClients = useCallback(async () => {
    if (!isMounted()) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await clientsService.getClients({ skip: 0, limit: 1000, active_only: true })
      
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
      
      setError(errorMessage)
    } finally {
      if (isMounted()) {
        setLoading(false)
      }
    }
  }, [isMounted])

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

      // Verificar que el componente aún está montado antes de actualizar estado
      if (!isMounted()) return

      // Cliente creado exitosamente
      toast.success('Cliente creado exitosamente')
      setNewClientDialogOpen(false)
      
      // Recargar la lista de clientes
      fetchClients()
    } catch (err) {
      if (!isMounted()) return
      
      const errorMessage = err instanceof ApiError ? err.detail : 'Error desconocido al crear el cliente'
      setFormError(errorMessage)
    } finally {
      if (isMounted()) {
        setCreatingClient(false)
      }
    }
  }

  // Funciones para importación masiva
  const handleDownloadTemplate = async () => {
    return await clientsService.downloadTemplate()
  }

  const handleBulkUpload = async (file: File) => {
    return await clientsService.bulkUpload(file)
  }

  const handleImportComplete = (_result: ClientBulkUploadResult) => {
    // Recargar la lista de clientes para mostrar los nuevos datos
    fetchClients()
    
    // Cerrar el modal de importación
    setImportDialogOpen(false)
  }

  // Función para exportar todos los clientes
  const handleExportAll = async () => {
    try {
      setIsExporting(true)
      const blob = await clientsService.exportClients({})
      
      // Verificar que el componente aún está montado antes de manipular el DOM
      if (!isMounted()) return
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`
      
      // Verificar que el body existe antes de manipularlo
      if (document.body) {
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      if (isMounted()) {
        toast.success('Clientes exportados exitosamente')
      }
    } catch (error) {
      if (isMounted()) {
        const errorMessage = error instanceof Error ? error.message : 'Error al exportar clientes'
        toast.error(errorMessage)
      }
    } finally {
      if (isMounted()) {
        setIsExporting(false)
      }
    }
  }

  // Función para exportar solo clientes activos
  const handleExportActive = async () => {
    try {
      setIsExporting(true)
      const blob = await clientsService.exportClients({ active_only: true })
      
      // Verificar que el componente aún está montado antes de manipular el DOM
      if (!isMounted()) return
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `clientes_activos_${new Date().toISOString().split('T')[0]}.xlsx`
      
      // Verificar que el body existe antes de manipularlo
      if (document.body) {
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      if (isMounted()) {
        toast.success('Clientes activos exportados exitosamente')
      }
    } catch (error) {
      if (isMounted()) {
        const errorMessage = error instanceof Error ? error.message : 'Error al exportar clientes activos'
        toast.error(errorMessage)
      }
    } finally {
      if (isMounted()) {
        setIsExporting(false)
      }
    }
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Filtrar clientes basado en el término de búsqueda
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.nit && client.nit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [clients, searchTerm])

  // Calcular datos de paginación
  const totalPages = Math.ceil(filteredClients.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedClients = filteredClients.slice(startIndex, endIndex)

  // Resetear página cuando cambie el filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Resetear página cuando cambie el tamaño de página
  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  const renderClientActions = (client: Client) => (
    <PermissionGuard clientPermission="can_manage">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Acciones de {client.name}</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditClient(client)}>
            <Edit />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => openDeleteDialog(client)}>
            <Trash2 />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGuard>
  )

  return (
    <Main>
      <PageHeader
        title="Clientes"
        description={
          loading || error
            ? 'Las tiendas y negocios a los que entregas'
            : `${filteredClients.length.toLocaleString('es-GT')} clientes activos${searchTerm ? ' con esa búsqueda' : ''}`
        }
        actions={
          <PermissionGuard clientPermission="can_manage">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Download aria-hidden="true" />
                  )}
                  {isExporting ? 'Exportando…' : 'Exportar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportAll} disabled={isExporting}>
                  <Download />
                  Todos los clientes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportActive} disabled={isExporting}>
                  <UserCheck />
                  Solo activos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="bg-card" onClick={() => setImportDialogOpen(true)}>
              <Upload aria-hidden="true" />
              Importar
            </Button>
            <Button onClick={handleNewClient}>
              <Plus aria-hidden="true" />
              Nuevo cliente
            </Button>
          </PermissionGuard>
        }
      />

      {loading ? (
        <LoadingState label="Cargando clientes…" />
      ) : error ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={AlertCircle}
              title="No se pudieron cargar los clientes"
              description={error}
              action={<Button onClick={fetchClients}>Reintentar</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-4 py-4 sm:py-6 max-md:border-0 max-md:bg-transparent max-md:py-0 max-md:shadow-none">
          <CardContent className="space-y-4 max-md:px-0">
            <div className="relative w-full sm:w-72">
              <Search
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2"
              />
              <Input
                placeholder="Nombre, NIT, teléfono o correo"
                aria-label="Buscar clientes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card h-9 ps-8"
              />
            </div>

            {filteredClients.length === 0 ? (
              <EmptyState
                icon={searchTerm ? SearchX : Users}
                title={searchTerm ? 'Ningún cliente coincide con la búsqueda' : 'Todavía no hay clientes'}
                description={
                  searchTerm
                    ? 'Revisa cómo está escrito o busca por teléfono o NIT.'
                    : 'Agrega tu primer cliente o importa tu lista desde Excel.'
                }
                action={
                  !searchTerm && (
                    <PermissionGuard clientPermission="can_manage">
                      <Button onClick={handleNewClient}>
                        <Plus aria-hidden="true" />
                        Nuevo cliente
                      </Button>
                    </PermissionGuard>
                  )
                }
              />
            ) : (
              <>
                {/* Escritorio: tabla */}
                <div className="hidden overflow-x-auto rounded-lg border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 [&>th]:text-muted-foreground">
                        <TableHead>Nombre</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead className="hidden lg:table-cell">NIT</TableHead>
                        <TableHead className="hidden xl:table-cell">Correo</TableHead>
                        <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Acciones</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell className="tabular whitespace-nowrap">
                            {client.phone || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="tabular hidden lg:table-cell">
                            {client.nit || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="hidden max-w-[14rem] truncate xl:table-cell">
                            {client.email || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden max-w-[16rem] truncate lg:table-cell">
                            {client.address || '—'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge tone={client.is_active ? 'success' : 'neutral'}>
                              {client.is_active ? 'Activo' : 'Inactivo'}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>{renderClientActions(client)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Celular: lista */}
                <ul className="space-y-2 md:hidden">
                  {paginatedClients.map((client) => (
                    <li key={client.id} className="bg-card flex items-start gap-3 rounded-xl border p-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{client.name}</p>
                          {!client.is_active && <StatusBadge>Inactivo</StatusBadge>}
                        </div>
                        {client.phone && (
                          <a
                            href={`tel:${client.phone}`}
                            className="text-info tabular flex w-fit items-center gap-1.5 text-sm"
                          >
                            <Phone className="size-3.5" aria-hidden="true" />
                            {client.phone}
                          </a>
                        )}
                        {client.address && (
                          <p className="text-muted-foreground flex items-start gap-1.5 text-sm">
                            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                            <span className="line-clamp-2">{client.address}</span>
                          </p>
                        )}
                      </div>
                      {renderClientActions(client)}
                    </li>
                  ))}
                </ul>

                <ClientPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredClients.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a{' '}
              <span className="font-semibold">{clientToDelete?.name}</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleting ? 'Eliminando…' : 'Eliminar cliente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para crear nuevo cliente */}
      <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
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
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <p className="text-destructive text-sm">{formError}</p>
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
                  Creando…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear cliente
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
            <DialogTitle>Editar cliente</DialogTitle>
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
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <p className="text-destructive text-sm">{editFormError}</p>
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
                  Guardando…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Componente de importación masiva */}
      <BulkImport
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        title="Clientes"
        description="Importa múltiples clientes desde un archivo de Excel"
        onDownloadTemplate={handleDownloadTemplate}
        onUploadFile={handleBulkUpload}
        onImportComplete={handleImportComplete}
      />
    </Main>
  )
} 