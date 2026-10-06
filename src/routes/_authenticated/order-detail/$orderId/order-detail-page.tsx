import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { ordersService, type Order, type OrderStatus } from '@/services/orders'
import { ArrowLeft, Edit, Package, PackageX, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { redirectWithSubdomain } from '@/utils/subdomain'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { EmptyState } from '@/components/empty-state'
import { Main } from '@/components/layout/main'
import { LoadingState } from '@/components/loading-state'
import { OrderStatusRoute } from '@/components/order-status-route'
import { PageHeader } from '@/components/page-header'
import { PaymentSummaryCard, PaymentsList } from '@/features/orders/components'
import { OrderReceiptButtons } from '@/features/orders/components/order-receipt-actions'
import { getOrderStatusData, orderStatuses } from '@/features/orders/data/data'

export function OrderDetailPage() {
  const { orderId } = useParams({
    from: '/_authenticated/order-detail/$orderId',
  })
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [paymentRefreshKey, setPaymentRefreshKey] = useState(0)

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true)
      const orderData = await ordersService.getOrder(parseInt(orderId))
      setOrder(orderData)
    } catch (_err) {
      setError('No se pudo cargar el pedido')
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
      setIsDeleteDialogOpen(false)
      toast.error('No se pudo cancelar el pedido. Intenta de nuevo.')
    }
  }

  const handleStatusUpdate = async () => {
    if (!order) return

    try {
      const updatedOrder = await ordersService.updateOrderStatus(
        order.id!,
        newStatus
      )
      setOrder(updatedOrder)
      setIsStatusDialogOpen(false)
      toast.success(
        `Estado cambiado a ${getOrderStatusData(newStatus).label.toLowerCase()}`
      )
    } catch (err) {
      const detail = (err as { detail?: string })?.detail
      toast.error(detail || 'No se pudo cambiar el estado. Intenta de nuevo.')
    }
  }

  const openStatusDialog = () => {
    if (order) setNewStatus(order.status)
    setIsStatusDialogOpen(true)
  }

  if (loading) {
    return (
      <Main>
        <LoadingState variant='detail' label='Cargando pedido…' />
      </Main>
    )
  }

  if (error || !order) {
    return (
      <Main>
        <EmptyState
          icon={PackageX}
          title={error || 'No encontramos este pedido'}
          description='Puede que se haya eliminado o que el enlace sea incorrecto.'
          action={
            <Button asChild variant='outline'>
              <Link to='/orders'>Volver a pedidos</Link>
            </Button>
          }
        />
      </Main>
    )
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )
  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const createdAt = order.created_at
    ? new Date(order.created_at).toLocaleDateString('es-GT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <Main>
      <Button
        asChild
        variant='ghost'
        size='sm'
        className='text-muted-foreground -ms-2 mb-2'
      >
        <Link to='/orders'>
          <ArrowLeft aria-hidden='true' />
          Pedidos
        </Link>
      </Button>

      <PageHeader
        title={`Pedido ${order.order_number || `#${order.id}`}`}
        description={[order.client?.name, createdAt && `creado el ${createdAt}`]
          .filter(Boolean)
          .join(', ')}
        actions={
          <>
            <PermissionGuard orderPermission='can_update_delivery'>
              <Button onClick={openStatusDialog}>Cambiar estado</Button>
            </PermissionGuard>

            {order.status === 'pending' && (
              <PermissionGuard orderPermission='can_manage'>
                <Button
                  variant='outline'
                  className='bg-card'
                  onClick={() =>
                    redirectWithSubdomain(`/edit-order/${orderId}`)
                  }
                >
                  <Edit aria-hidden='true' />
                  Editar
                </Button>
              </PermissionGuard>
            )}

            {order.status !== 'cancelled' && (
              <PermissionGuard orderPermission='can_manage'>
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant='ghost'
                      className='text-destructive hover:text-destructive hover:bg-destructive/10'
                    >
                      <Trash2 aria-hidden='true' />
                      Cancelar pedido
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Cancelar este pedido?</DialogTitle>
                      <DialogDescription>
                        El pedido pasará a cancelado y no se podrá reactivar.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Volver
                      </Button>
                      <Button variant='destructive' onClick={handleDelete}>
                        Cancelar pedido
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </PermissionGuard>
            )}
          </>
        }
      />

      <Card className='mb-4 py-5 lg:mb-6'>
        <CardContent>
          <OrderStatusRoute status={order.status} />
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6'>
        <div className='space-y-4 lg:col-span-2 lg:space-y-6'>
          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className='font-display text-lg'>Productos</CardTitle>
              <CardDescription className='tabular'>
                {order.items.length} productos,{' '}
                {totalUnits.toLocaleString('es-GT')} unidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.items.length > 0 ? (
                <>
                  <div className='hidden overflow-hidden rounded-lg border md:block'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-muted/50 hover:bg-muted/50'>
                          <TableHead className='text-muted-foreground'>
                            Producto
                          </TableHead>
                          <TableHead className='text-muted-foreground text-right'>
                            Cantidad
                          </TableHead>
                          <TableHead className='text-muted-foreground text-right'>
                            Precio
                          </TableHead>
                          <TableHead className='text-muted-foreground text-right'>
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className='tabular'>
                        {order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className='font-medium'>
                              {item.product_name ||
                                `Producto #${item.product_id}`}
                            </TableCell>
                            <TableCell className='text-right'>
                              {item.quantity}
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className='text-right font-medium'>
                              {formatCurrency(item.quantity * item.unit_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <ul className='tabular divide-y md:hidden'>
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className='flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0'
                      >
                        <div className='min-w-0'>
                          <p className='font-medium'>
                            {item.product_name ||
                              `Producto #${item.product_id}`}
                          </p>
                          <p className='text-muted-foreground text-sm'>
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <span className='shrink-0 font-medium'>
                          {formatCurrency(item.quantity * item.unit_price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <EmptyState
                  icon={Package}
                  title='Este pedido no tiene productos'
                  className='py-6'
                />
              )}
            </CardContent>
          </Card>

          {/* Pagos */}
          <Card>
            <CardHeader>
              <CardTitle className='font-display text-lg'>
                Pagos registrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentsList
                key={paymentRefreshKey}
                orderId={order.id!}
                onPaymentCancelled={() => {
                  setPaymentRefreshKey((prev) => prev + 1)
                  loadOrder()
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4 lg:space-y-6'>
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className='font-display text-lg'>Resumen</CardTitle>
            </CardHeader>
            <CardContent className='tabular space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {order.discount_amount && order.discount_amount > 0 ? (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Descuento</span>
                  <span className='text-success'>
                    −{formatCurrency(order.discount_amount)}
                  </span>
                </div>
              ) : null}
              <div className='flex items-baseline justify-between border-t pt-3'>
                <span className='font-medium'>Total</span>
                <span className='font-display text-2xl font-semibold'>
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <PaymentSummaryCard
            key={paymentRefreshKey}
            orderId={order.id!}
            orderNumber={order.order_number}
            totalAmount={order.total_amount || 0}
            onPaymentCreated={() => {
              setPaymentRefreshKey((prev) => prev + 1)
              loadOrder()
            }}
          />

          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className='font-display text-lg'>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {order.client ? (
                <dl className='space-y-3 text-sm'>
                  <div>
                    <dt className='text-muted-foreground'>Nombre</dt>
                    <dd className='font-medium'>{order.client.name}</dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground'>Teléfono</dt>
                    <dd className='tabular'>
                      {order.client.phone ? (
                        <a
                          href={`tel:${order.client.phone}`}
                          className='text-info hover:underline'
                        >
                          {order.client.phone}
                        </a>
                      ) : (
                        'Sin teléfono'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground'>Dirección</dt>
                    <dd>{order.client.address || 'Sin dirección'}</dd>
                  </div>
                  {order.route && (
                    <div>
                      <dt className='text-muted-foreground'>Ruta</dt>
                      <dd>{order.route.name}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  No hay datos del cliente #{order.client_id}.
                </p>
              )}
              {order.notes && (
                <div className='bg-warning/15 mt-4 rounded-lg p-3 text-sm'>
                  <p className='font-medium'>Notas</p>
                  <p className='mt-1 whitespace-pre-wrap'>{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comprobante */}
          <Card>
            <CardHeader>
              <CardTitle className='font-display text-lg'>
                Comprobante
              </CardTitle>
              <CardDescription>
                Míralo, descárgalo o envíalo al cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderReceiptButtons
                orderId={order.id!}
                variant='outline'
                size='sm'
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
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogDescription>
              Pedido {order.order_number}. El estado actual es{' '}
              {getOrderStatusData(order.status).label.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={newStatus}
            onValueChange={(value) => setNewStatus(value as OrderStatus)}
            className='gap-1.5'
          >
            {orderStatuses.map((status) => (
              <Label
                key={status.value}
                htmlFor={`status-${status.value}`}
                className='has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 font-normal'
              >
                <RadioGroupItem
                  id={`status-${status.value}`}
                  value={status.value}
                />
                <status.icon
                  className={cn('size-4', status.color)}
                  aria-hidden='true'
                />
                <span className='flex-1'>{status.label}</span>
                {status.value === order.status && (
                  <span className='text-muted-foreground text-xs'>Actual</span>
                )}
              </Label>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Volver
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={newStatus === order.status}
            >
              Guardar estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Main>
  )
}
