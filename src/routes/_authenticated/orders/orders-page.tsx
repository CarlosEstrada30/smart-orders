import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { redirectWithSubdomain } from '@/utils/subdomain'
import { ordersService, type Order, type OrdersQueryParams, type OrdersResponse, type OrderStatus, type BulkOrderStatusResponse } from '@/services/orders'
import { OrdersTable } from '@/features/orders/components/orders-table'
import { StockErrorModal } from '@/features/orders/components/stock-error-modal'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { toast } from 'sonner'

export function OrdersPage() {
  const navigate = useNavigate()
  const [ordersData, setOrdersData] = useState<OrdersResponse>({
    items: [],
    pagination: {
      total: 0,
      count: 0,
      page: 1,
      pages: 1,
      per_page: 10,
      has_next: false,
      has_previous: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState<OrdersQueryParams>({
    skip: 0,
    limit: 10,
  })
  
  // Estado para el modal de errores de stock
  const [showStockErrorModal, setShowStockErrorModal] = useState(false)
  const [stockErrorResult, setStockErrorResult] = useState<BulkOrderStatusResponse | null>(null)

  // Función para cargar órdenes - SIN useCallback para evitar loops
  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersService.getOrders(filters)
      
      // La nueva estructura ya está normalizada por el servicio
      setOrdersData(response)
      setError(null)
    } catch (_err) {
      setError('Error al cargar las órdenes')
      // Asegurar que siempre hay datos válidos incluso en error
      setOrdersData({
        items: [],
        pagination: {
          total: 0,
          count: 0,
          page: 1,
          pages: 1,
          per_page: filters.limit || 10,
          has_next: false,
          has_previous: false
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para cambio masivo de estados
  const handleBulkStatusChange = async (orderIds: number[], newStatus: OrderStatus) => {
    try {
      setLoading(true)
      const result = await ordersService.updateBulkOrderStatus(orderIds, newStatus)
      
      // Mostrar feedback básico
      if (result.updated_count > 0) {
        toast.success(`${result.updated_count} orden${result.updated_count !== 1 ? 'es' : ''} actualizada${result.updated_count !== 1 ? 's' : ''} exitosamente`)
      }
      
      if (result.failed_count > 0) {
        toast.error(`${result.failed_count} orden${result.failed_count !== 1 ? 'es' : ''} no pudo${result.failed_count !== 1 ? 'ron' : ''} ser actualizada${result.failed_count !== 1 ? 's' : ''}`)
      }
      
      // Recargar órdenes para reflejar los cambios
      await loadOrders()
      
      // Retornar el resultado completo para el componente de acciones masivas
      return result
    } catch (_err) {
      toast.error('Error al actualizar el estado de las órdenes')
      throw _err
    } finally {
      setLoading(false)
    }
  }

  // Manejar errores de stock
  const handleStockError = (result: BulkOrderStatusResponse) => {
    setStockErrorResult(result)
    setShowStockErrorModal(true)
  }

  // Cerrar modal de errores de stock
  const handleCloseStockErrorModal = () => {
    setShowStockErrorModal(false)
    setStockErrorResult(null)
  }

  const handleCloseStockErrorModalAndClear = () => {
    setShowStockErrorModal(false)
    setStockErrorResult(null)
    // Aquí podrías agregar lógica para limpiar la selección si es necesario
  }

  // UseEffect directo con filters - más simple y sin loops
  useEffect(() => {
    loadOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.skip, filters.limit, filters.search, filters.status_filter, filters.route_id, filters.date_from, filters.date_to])

  // Función para actualizar filtros
  const handleFiltersChange = useCallback((newFilters: Partial<OrdersQueryParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset a la primera página cuando cambian los filtros (excepto paginación)
      ...(newFilters.skip === undefined && newFilters.limit === undefined ? { skip: 0 } : {})
    }))
  }, [])
  
  // Memoizar valores calculados para evitar re-renders
  const paginationInfo = useMemo(() => ordersData.pagination, [ordersData.pagination])
  
  const ordersCount = useMemo(() => {
    const { total, count, page, pages } = paginationInfo
    return `${total} órdenes encontradas (${count} en esta página) - Página ${page} de ${pages}`
  }, [paginationInfo])

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      await ordersService.deleteOrder(orderToDelete.id!)
      // Recargar datos después de eliminar
      loadOrders()
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (_err) {
      setError('Error al cancelar la orden')
    }
  }

  const handleViewOrder = (order: Order) => {
    navigate({ to: '/order-detail/$orderId', params: { orderId: order.id!.toString() } })
  }

  const handleEditOrder = (order: Order) => {
    redirectWithSubdomain(`/edit-order/${order.id}`)
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
          <PermissionGuard orderPermission="can_create">
            <Link to="/new-order">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Orden
              </Button>
            </Link>
          </PermissionGuard>
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
              {ordersCount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable
              data={ordersData.items || []}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrderAction}
              onBulkStatusChange={handleBulkStatusChange}
              onStockError={handleStockError}
              onFiltersChange={handleFiltersChange}
              filters={filters}
              pagination={paginationInfo}
              loading={loading}
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

        {/* Modal de errores de stock */}
        {stockErrorResult && (
          <StockErrorModal
            isOpen={showStockErrorModal}
            onClose={handleCloseStockErrorModal}
            onCloseAndClear={handleCloseStockErrorModalAndClear}
            bulkResult={stockErrorResult}
          />
        )}
      </div>
    </Main>
  )
} 