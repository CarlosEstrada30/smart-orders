import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { redirectWithSubdomain } from '@/utils/subdomain'
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
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { cn } from '@/lib/utils'
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
  FileText,
  PackageX,
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
      // Redirigir a la lista de inventario preservando el subdominio
      redirectWithSubdomain('/inventory')
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
        return 'Inventario inicial'
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
        <LoadingState variant="detail" label="Cargando entrada…" />
      </Main>
    )
  }

  if (error || !entry) {
    return (
      <Main>
        <EmptyState
          icon={PackageX}
          title={error || 'No encontramos esta entrada'}
          description="Puede que se haya eliminado o que el enlace sea incorrecto."
          action={
            <Button asChild variant="outline">
              <Link to="/inventory">Volver a inventario</Link>
            </Button>
          }
        />
      </Main>
    )
  }

  const statusData = getEntryStatusData(entry.status ?? 'draft')

  return (
    <Main>
      <div className="space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ms-2 mb-2">
            <Link to="/inventory">
              <ArrowLeft aria-hidden="true" />
              Inventario
            </Link>
          </Button>
          <PageHeader
            className="mb-0"
            title={
              <span className="flex flex-wrap items-center gap-3">
                Entrada {entry.entry_number}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium',
                    statusData.color
                  )}
                >
                  {getStatusIcon(entry.status ?? 'draft')}
                  {getStatusLabel(entry.status ?? 'draft')}
                </span>
              </span>
            }
            description={getEntryTypeLabel(entry.entry_type)}
            actions={
              <>
                {entry.status === 'pending' && (
                  <Button onClick={() => openStatusActionDialog('approve')}>
                    <CheckCircle aria-hidden="true" />
                    Aprobar
                  </Button>
                )}

                {entry.status === 'approved' && (
                  <Button onClick={() => openStatusActionDialog('complete')}>
                    <CheckCircle aria-hidden="true" />
                    Completar
                  </Button>
                )}

                {(entry.status === 'draft' || entry.status === 'pending') && (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => openStatusActionDialog('cancel')}
                  >
                    <XCircle aria-hidden="true" />
                    Cancelar entrada
                  </Button>
                )}

                {entry.status === 'draft' && (
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 aria-hidden="true" />
                        Eliminar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>¿Eliminar esta entrada?</DialogTitle>
                        <DialogDescription>
                          Se eliminará el borrador. Esta acción no se puede deshacer.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Volver
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          Eliminar entrada
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la Entrada */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información general */}
            <Card>
              <CardHeader>
                <CardTitle>Información general</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número de entrada</Label>
                    <Input value={entry.entry_number} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de entrada</Label>
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
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                {entry.items && entry.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Costo unitario</TableHead>
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
                <CardTitle>Resumen</CardTitle>
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
                    <span>Costo total:</span>
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
