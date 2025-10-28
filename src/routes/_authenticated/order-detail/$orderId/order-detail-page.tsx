import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { redirectWithSubdomain } from '@/utils/subdomain'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
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
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle,
  X,
  Edit
} from 'lucide-react'
import { ordersService, type Order, type OrderStatus } from '@/services/orders'
import { OrderReceiptButtons } from '@/features/orders/components/order-receipt-actions'
import { PermissionGuard } from '@/components/auth/permission-guard'

export function OrderDetailPage() {
  const { orderId } = useParams({ from: '/_authenticated/order-detail/$orderId' })
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true)
      const orderData = await ordersService.getOrder(parseInt(orderId))
      setOrder(orderData)
    } catch (_err) {
      setError('Error al cargar la orden')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const handleDelete = async () => {
    if (!order) return

    try {
      await ordersService.deleteOrder(order.id!)
      // Redirigir a la lista de órdenes preservando el subdominio
      redirectWithSubdomain('/orders')
    } catch (_err) {
      setError('Error al cancelar la orden')
    }
  }

  const handleStatusUpdate = async () => {
    if (!order) return

    try {
      const updatedOrder = await ordersService.updateOrderStatus(order.id!, newStatus)
      setOrder(updatedOrder)
      setIsStatusDialogOpen(false)
    } catch (_err) {
      setError('Error al actualizar el estado')
    }
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'confirmed':
        return 'default'
      case 'in_progress':
        return 'outline'
      case 'shipped':
        return 'default'
      case 'delivered':
        return 'default'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4" />
      case 'confirmed':
        return <ShoppingCart className="h-4 w-4" />
      case 'in_progress':
        return <ShoppingCart className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <X className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmado'
      case 'in_progress':
        return 'En Proceso'
      case 'shipped':
        return 'Enviado'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Cargando orden...</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (error || !order) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">{error || 'Orden no encontrada'}</p>
              <Link to="/orders">
                <Button className="mt-4">Volver a órdenes</Button>
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Top row - Back button and title */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Orden #{order.order_number}
                </h1>
                <p className="text-muted-foreground">
                  Detalles de la orden
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(order.status)} className="shrink-0">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(order.status)}
                  <span className="hidden sm:inline">{getStatusLabel(order.status)}</span>
                </div>
              </Badge>
            </div>
          </div>
          
          {/* Bottom row - Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <PermissionGuard orderPermission="can_update_delivery">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusDialogOpen(true)}
              >
                <span className="hidden sm:inline">Cambiar Estado</span>
                <span className="sm:hidden">Estado</span>
              </Button>
            </PermissionGuard>

            {order.status === 'pending' && (
              <PermissionGuard orderPermission="can_manage">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => redirectWithSubdomain(`/edit-order/${orderId}`)}
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </PermissionGuard>
            )}

            {order.status !== 'cancelled' && (
              <PermissionGuard orderPermission="can_manage">
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Cancelar orden?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. La orden será cancelada permanentemente.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Cancelar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </PermissionGuard>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Información de la Orden */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Información del Cliente */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {order.client ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nombre del Cliente</Label>
                      <Input value={order.client.name} disabled className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Teléfono</Label>
                      <Input value={order.client.phone || 'No disponible'} disabled className="text-sm" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-sm font-medium">Dirección</Label>
                      <Textarea 
                        value={order.client.address || 'Sin dirección'} 
                        disabled 
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      Información del cliente no disponible (Cliente #{order.client_id})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalles de la Orden */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Detalles de la Orden</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Número de Orden</Label>
                    <Input value={order.order_number || `#${order.id}`} disabled className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fecha de Creación</Label>
                    <Input value={order.created_at ? new Date(order.created_at).toLocaleDateString() : ''} disabled className="text-sm" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-medium">Última Actualización</Label>
                    <Input value={order.updated_at ? new Date(order.updated_at).toLocaleDateString() : ''} disabled className="text-sm" />
                  </div>
                </div>
                {order.notes && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm font-medium">Notas</Label>
                    <Textarea value={order.notes} disabled className="text-sm resize-none" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items de la Orden */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Items de la Orden</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items.length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unitario</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.product_name || `Producto #${item.product_id}`}
                              </TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">Q{item.unit_price.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium">
                                Q{(item.quantity * item.unit_price).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium leading-5">
                              {item.product_name || `Producto #${item.product_id}`}
                            </h4>
                            <div className="text-right font-medium">
                              Q{(item.quantity * item.unit_price).toFixed(2)}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span>Cantidad: <strong>{item.quantity}</strong></span>
                              <span>Precio: <strong>Q{item.unit_price.toFixed(2)}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay items en esta orden</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen */}
          <div className="space-y-4 lg:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumen de la Orden</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Items:</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Cantidad:</span>
                  <span className="font-medium">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">
                        Q{order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                      </span>
                    </div>
                    {order.discount_amount && order.discount_amount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span className="text-muted-foreground">Descuento:</span>
                        <span className="font-medium">-Q{order.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-base font-semibold">Total:</span>
                      <span className="text-lg font-bold">Q{order.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sección de Comprobante */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Comprobante</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground mb-4">
                  Descargar o visualizar el comprobante de esta orden
                </div>
                <OrderReceiptButtons 
                  orderId={order.id!} 
                  variant="outline"
                  size="sm"
                  showLabels={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog para cambiar estado */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Estado de la Orden</DialogTitle>
              <DialogDescription>
                Selecciona el nuevo estado para la orden #{order.order_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nuevo Estado</Label>
                <Combobox
                  options={[
                    { value: 'pending', label: 'Pendiente' },
                    { value: 'confirmed', label: 'Confirmado' },
                    { value: 'in_progress', label: 'En Proceso' },
                    { value: 'shipped', label: 'Enviado' },
                    { value: 'delivered', label: 'Entregado' },
                    { value: 'cancelled', label: 'Cancelado' },
                  ]}
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as OrderStatus)}
                  placeholder="Selecciona un estado"
                  searchPlaceholder="Buscar estado..."
                  emptyMessage="No se encontraron estados."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleStatusUpdate}>
                Actualizar Estado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Main>
  )
} 