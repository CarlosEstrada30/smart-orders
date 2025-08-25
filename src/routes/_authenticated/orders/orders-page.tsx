import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ordersService, type Order } from '@/services/orders'
import { OrdersTable } from '@/features/orders/components/orders-table'

export function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await ordersService.getOrders()
      setOrders(ordersData)
    } catch (_err) {
      setError('Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      await ordersService.deleteOrder(orderToDelete.id!)
      setOrders(orders.filter(order => order.id !== orderToDelete.id))
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (_err) {
      setError('Error al cancelar la orden')
    }
  }

  const handleViewOrder = (order: Order) => {
    navigate({ to: '/order-detail/$orderId', params: { orderId: order.id!.toString() } })
  }

  const handleDeleteOrderAction = (order: Order) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }



  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Cargando órdenes...</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
            <p className="text-muted-foreground">
              Gestiona las órdenes de la aplicación
            </p>
          </div>
          <Link to="/new-order">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Orden
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Órdenes</CardTitle>
            <CardDescription>
              {orders.length} órdenes encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable
              data={orders}
              onViewOrder={handleViewOrder}
              onDeleteOrder={handleDeleteOrderAction}
            />
          </CardContent>
        </Card>

        {/* Dialog de confirmación de eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cancelar orden?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. La orden será cancelada permanentemente.
                {orderToDelete && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm">
                      <strong>Orden:</strong> {orderToDelete.order_number || `#${orderToDelete.id}`}<br />
                      <strong>Cliente:</strong> {orderToDelete.client?.name || `Cliente #${orderToDelete.client_id}`}<br />
                      <strong>Email:</strong> {orderToDelete.client?.email || 'No disponible'}<br />
                      <strong>Total:</strong> Q{orderToDelete.total_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteOrder}>
                Cancelar Orden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Main>
  )
} 