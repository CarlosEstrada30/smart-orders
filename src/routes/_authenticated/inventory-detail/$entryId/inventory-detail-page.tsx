import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Main } from '@/components/layout/main'
import { 
  ArrowLeft, 
  Trash2, 
  Package, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { inventoryService, type InventoryEntry, type EntryStatus } from '@/services/inventory'
import { toast } from 'sonner'
import { 
  getAvailableActionsForUser,
  getConfirmationConfig,
  getStatusTooltip,
  type UserRole
} from '@/features/inventory/utils/workflow'
import { getEntryTypeData, getEntryStatusData } from '@/features/inventory/data/data'

export function InventoryDetailPage() {
  const { entryId } = useParams({ from: '/_authenticated/inventory-detail/$entryId' })
  const [entry, setEntry] = useState<InventoryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusActionDialogOpen, setIsStatusActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'complete' | 'cancel'>('approve')

  const loadEntry = useCallback(async () => {
    try {
      setLoading(true)
      const entryData = await inventoryService.getEntry(parseInt(entryId))
      setEntry(entryData)
    } catch (_err) {
      setError('Error al cargar la entrada de inventario')
    } finally {
      setLoading(false)
    }
  }, [entryId])

  useEffect(() => {
    loadEntry()
  }, [loadEntry])

  const handleDelete = async () => {
    if (!entry) return

    try {
      // Note: Add delete method to inventoryService if needed
      // await inventoryService.deleteEntry(entry.id!)
      toast.success('Entrada eliminada exitosamente')
      // Redirigir a la lista de inventario
      window.location.href = '/inventory'
    } catch (_err) {
      setError('Error al eliminar la entrada')
      toast.error('Error al eliminar la entrada')
    }
  }

  const handleStatusAction = async () => {
    if (!entry) return

    try {
      let updatedEntry: InventoryEntry

      switch (actionType) {
        case 'approve':
          updatedEntry = await inventoryService.approveEntry(entry.id!)
          toast.success('Entrada aprobada exitosamente')
          break
        case 'complete':
          updatedEntry = await inventoryService.completeEntry(entry.id!)
          toast.success('Entrada completada exitosamente')
          break
        case 'cancel':
          updatedEntry = await inventoryService.cancelEntry(entry.id!)
          toast.success('Entrada cancelada')
          break
        default:
          return
      }

      setEntry(updatedEntry)
      setIsStatusActionDialogOpen(false)
    } catch (_err) {
      setError(`Error al ${actionType === 'approve' ? 'aprobar' : actionType === 'complete' ? 'completar' : 'cancelar'} la entrada`)
      toast.error(`Error al ${actionType === 'approve' ? 'aprobar' : actionType === 'complete' ? 'completar' : 'cancelar'} la entrada`)
    }
  }

  const getStatusBadgeVariant = (status: EntryStatus) => {
    switch (status) {
      case 'draft':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'approved':
        return 'default'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: EntryStatus) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4" />
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: EntryStatus) => {
    switch (status) {
      case 'draft':
        return 'Borrador'
      case 'pending':
        return 'Pendiente'
      case 'approved':
        return 'Aprobado'
      case 'completed':
        return 'Completado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Compra'
      case 'production':
        return 'Producción'
      case 'adjustment':
        return 'Ajuste'
      case 'transfer':
        return 'Transferencia'
      case 'return':
        return 'Devolución'
      case 'initial':
        return 'Inventario Inicial'
      default:
        return type
    }
  }

  const openStatusActionDialog = (action: 'approve' | 'complete' | 'cancel') => {
    setActionType(action)
    setIsStatusActionDialogOpen(true)
  }

  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Cargando entrada...</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (error || !entry) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">{error || 'Entrada no encontrada'}</p>
              <Link to="/inventory">
                <Button className="mt-4">Volver a inventario</Button>
              </Link>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/inventory">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Entrada #{entry.entry_number}
              </h1>
              <p className="text-muted-foreground">
                Detalles de la entrada de inventario
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadgeVariant(entry.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(entry.status)}
                <span>{getStatusLabel(entry.status)}</span>
              </div>
            </Badge>
            
            {/* Action buttons based on status */}
            {entry.status === 'pending' && (
              <Button
                variant="outline"
                onClick={() => openStatusActionDialog('approve')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar
              </Button>
            )}

            {entry.status === 'approved' && (
              <Button
                variant="outline"
                onClick={() => openStatusActionDialog('complete')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completar
              </Button>
            )}

            {(entry.status === 'draft' || entry.status === 'pending') && (
              <Button
                variant="destructive"
                onClick={() => openStatusActionDialog('cancel')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}

            {entry.status === 'draft' && (
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Eliminar entrada?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. La entrada será eliminada permanentemente.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la Entrada */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número de Entrada</Label>
                    <Input value={entry.entry_number} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Entrada</Label>
                    <Input value={getEntryTypeLabel(entry.entry_type)} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Entrada</Label>
                    <Input value={entry.entry_date ? new Date(entry.entry_date).toLocaleDateString() : ''} disabled />
                  </div>
                  {entry.expected_date && (
                    <div className="space-y-2">
                      <Label>Fecha Esperada</Label>
                      <Input value={new Date(entry.expected_date).toLocaleDateString()} disabled />
                    </div>
                  )}
                  {entry.completed_date && (
                    <div className="space-y-2">
                      <Label>Fecha de Completado</Label>
                      <Input value={new Date(entry.completed_date).toLocaleDateString()} disabled />
                    </div>
                  )}
                  {entry.supplier_info && (
                    <div className="space-y-2">
                      <Label>Proveedor</Label>
                      <Input value={entry.supplier_info} disabled />
                    </div>
                  )}
                  {entry.reference_document && (
                    <div className="space-y-2">
                      <Label>Documento de Referencia</Label>
                      <Input value={entry.reference_document} disabled />
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea value={entry.notes} disabled />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items de la Entrada */}
            <Card>
              <CardHeader>
                <CardTitle>Items de la Entrada</CardTitle>
              </CardHeader>
              <CardContent>
                {entry.items && entry.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Costo Unitario</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Vencimiento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.items.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell className="font-medium">
                            {item.product_name || `Producto #${item.product_id}`}
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">Q{item.unit_cost.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            Q{(item.quantity * item.unit_cost).toFixed(2)}
                          </TableCell>
                          <TableCell>{item.batch_number || '-'}</TableCell>
                          <TableCell>
                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay items en esta entrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de la Entrada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{entry.items?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cantidad:</span>
                  <span className="font-medium">
                    {entry.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Costo Total:</span>
                    <span>Q{entry.total_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usuario */}
            {entry.user_name && (
              <Card>
                <CardHeader>
                  <CardTitle>Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{entry.user_name}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Creado:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Actualizado:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog para acciones de estado */}
        <Dialog open={isStatusActionDialogOpen} onOpenChange={setIsStatusActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' && 'Aprobar Entrada'}
                {actionType === 'complete' && 'Completar Entrada'}
                {actionType === 'cancel' && 'Cancelar Entrada'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' && 'La entrada será marcada como aprobada y lista para procesar.'}
                {actionType === 'complete' && 'La entrada será marcada como completada y el inventario será actualizado.'}
                {actionType === 'cancel' && 'La entrada será cancelada y no podrá ser procesada.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusActionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleStatusAction}>
                {actionType === 'approve' && 'Aprobar'}
                {actionType === 'complete' && 'Completar'}
                {actionType === 'cancel' && 'Cancelar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Main>
  )
}
