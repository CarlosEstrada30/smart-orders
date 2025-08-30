import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
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
  X
} from 'lucide-react'
import { ordersService, type Order, type OrderStatus } from '@/services/orders'
import { OrderReceiptActions, OrderReceiptButtons } from '@/features/orders/components/order-receipt-actions'
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
      // Redirigir a la lista de órdenes
      window.location.href = '/orders'
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Orden #{order.order_number}
              </h1>
              <p className="text-muted-foreground">
                Detalles de la orden
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadgeVariant(order.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(order.status)}
                <span>{getStatusLabel(order.status)}</span>
              </div>
            </Badge>
            
            {/* Acciones de comprobante */}
            <OrderReceiptActions 
              orderId={order.id!} 
              orderNumber={order.order_number || `#${order.id}`} 
            />
            
            <PermissionGuard orderPermission="can_update_delivery">
              <Button
                variant="outline"
                onClick={() => setIsStatusDialogOpen(true)}
              >
                Cambiar Estado
              </Button>
            </PermissionGuard>

            {order.status !== 'cancelled' && (
              <PermissionGuard orderPermission="can_manage">
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancelar
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la Orden */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.client ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre del Cliente</Label>
                      <Input value={order.client.name} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input value={order.client.phone || 'No disponible'} disabled />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Dirección</Label>
                      <Textarea 
                        value={order.client.address || 'Sin dirección'} 
                        disabled 
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Información del cliente no disponible (Cliente #{order.client_id})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalles de la Orden */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número de Orden</Label>
                    <Input value={order.order_number || `#${order.id}`} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Creación</Label>
                    <Input value={order.created_at ? new Date(order.created_at).toLocaleDateString() : ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Última Actualización</Label>
                    <Input value={order.updated_at ? new Date(order.updated_at).toLocaleDateString() : ''} disabled />
                  </div>
                </div>
                {order.notes && (
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea value={order.notes} disabled />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items de la Orden */}
            <Card>
              <CardHeader>
                <CardTitle>Items de la Orden</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay items en esta orden</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de la Orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cantidad:</span>
                  <span className="font-medium">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>Q{order.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sección de Comprobante */}
            <Card>
              <CardHeader>
                <CardTitle>Comprobante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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