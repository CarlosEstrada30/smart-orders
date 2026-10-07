import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ordersService,
  type Order,
  type OrdersQueryParams,
  type OrdersResponse,
  type OrderStatus,
  type BulkOrderStatusResponse,
} from '@/services/orders'
import { AlertCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { redirectWithSubdomain } from '@/utils/subdomain'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { Main } from '@/components/layout/main'
import { LoadingState } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import {
  OrdersTable,
  ProductsSummaryView,
  DataTableToolbar,
} from '@/features/orders/components'
import { StockErrorModal } from '@/features/orders/components/stock-error-modal'

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
      has_previous: false,
    },
  })
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  // Estados para filtros y paginación
  const [filters, setFilters] = useState<OrdersQueryParams>({
    skip: 0,
    limit: 10,
  })

  const [activeTab, setActiveTab] = useState<'ordenes' | 'consolidado'>(
    'ordenes'
  )
  const [productSearch, setProductSearch] = useState('')

  const {
    data: productsSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    queryKey: [
      'orders-products-summary',
      filters.status_filter,
      filters.route_id,
      filters.date_from,
      filters.date_to,
      filters.search,
    ],
    queryFn: () =>
      ordersService.getOrdersProductsSummary({
        status_filter: filters.status_filter,
        route_id: filters.route_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search: filters.search,
      }),
    enabled: activeTab === 'consolidado',
    staleTime: 30_000,
  })

  // Estado para el modal de errores de stock
  const [showStockErrorModal, setShowStockErrorModal] = useState(false)
  const [stockErrorResult, setStockErrorResult] =
    useState<BulkOrderStatusResponse | null>(null)

  // Función para cargar órdenes - SIN useCallback para evitar loops
  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersService.getOrders(filters)

      // La nueva estructura ya está normalizada por el servicio
      setOrdersData(response)
      setError(null)
      setHasLoaded(true)
    } catch (_err) {
      setError(
        'No se pudieron cargar los pedidos. Revisa tu conexión e intenta de nuevo.'
      )
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
          has_previous: false,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para cambio masivo de estados
  const handleBulkStatusChange = async (
    orderIds: number[],
    newStatus: OrderStatus
  ) => {
    try {
      setLoading(true)
      const result = await ordersService.updateBulkOrderStatus(
        orderIds,
        newStatus
      )

      // Mostrar feedback básico
      if (result.updated_count > 0) {
        toast.success(
          `${result.updated_count} orden${result.updated_count !== 1 ? 'es' : ''} actualizada${result.updated_count !== 1 ? 's' : ''} exitosamente`
        )
      }

      if (result.failed_count > 0) {
        toast.error(
          `${result.failed_count} orden${result.failed_count !== 1 ? 'es' : ''} no pudo${result.failed_count !== 1 ? 'ron' : ''} ser actualizada${result.failed_count !== 1 ? 's' : ''}`
        )
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
  }, [
    filters.skip,
    filters.limit,
    filters.search,
    filters.status_filter,
    filters.payment_status_filter,
    filters.route_id,
    filters.date_from,
    filters.date_to,
  ])

  // Función para actualizar filtros
  const handleFiltersChange = useCallback(
    (newFilters: Partial<OrdersQueryParams>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        // Reset a la primera página cuando cambian los filtros (excepto paginación)
        ...(newFilters.skip === undefined && newFilters.limit === undefined
          ? { skip: 0 }
          : {}),
      }))
    },
    []
  )

  // Memoizar valores calculados para evitar re-renders
  const paginationInfo = useMemo(
    () => ordersData.pagination,
    [ordersData.pagination]
  )

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      await ordersService.deleteOrder(orderToDelete.id!)
      // Recargar datos después de eliminar
      loadOrders()
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (_err) {
      setError('No se pudo cancelar el pedido. Intenta de nuevo.')
    }
  }

  const handleViewOrder = (order: Order) => {
    navigate({
      to: '/order-detail/$orderId',
      params: { orderId: order.id!.toString() },
    })
  }

  const handleEditOrder = (order: Order) => {
    redirectWithSubdomain(`/edit-order/${order.id}`)
  }

  const handleDeleteOrderAction = (order: Order) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  const isFirstLoad = loading && !hasLoaded

  return (
    <Main>
      <PageHeader
        title='Pedidos'
        description={
          hasLoaded
            ? `${paginationInfo.total.toLocaleString('es-GT')} pedidos según los filtros actuales`
            : 'Consulta, filtra y actualiza los pedidos de tus clientes'
        }
        actions={
          <>
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as 'ordenes' | 'consolidado')
              }
            >
              <TabsList>
                <TabsTrigger value='ordenes'>Lista</TabsTrigger>
                <TabsTrigger value='consolidado'>Consolidado</TabsTrigger>
              </TabsList>
            </Tabs>
            <PermissionGuard orderPermission='can_create'>
              <Button asChild className='max-md:hidden'>
                <Link to='/new-order'>
                  <Plus aria-hidden='true' />
                  Nuevo pedido
                </Link>
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <div className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertCircle aria-hidden='true' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {activeTab === 'ordenes' ? (
          isFirstLoad ? (
            <LoadingState label='Cargando pedidos…' />
          ) : (
            <Card className='gap-0 py-6 max-md:border-0 max-md:bg-transparent max-md:py-0 max-md:shadow-none'>
              <CardContent className='max-md:px-0'>
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
                  onPaymentCreated={loadOrders}
                />
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className='font-display text-lg'>
                Consolidado de{' '}
                {productsSummary?.route_name ?? 'todas las rutas'}
              </CardTitle>
              <CardDescription>
                Cantidad total de cada producto en los pedidos que cumplen los
                filtros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTableToolbar
                onFiltersChange={handleFiltersChange}
                filters={filters}
                hidePaymentFilter
                hideSearch
                productSearch={productSearch}
                onProductSearchChange={setProductSearch}
              />
              <div className='mt-4'>
                <ProductsSummaryView
                  data={productsSummary}
                  isLoading={isSummaryLoading}
                  isError={isSummaryError}
                  productSearch={productSearch}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog de confirmación de cancelación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cancelar este pedido?</DialogTitle>
              <DialogDescription>
                El pedido pasará a cancelado y no se podrá reactivar.
              </DialogDescription>
            </DialogHeader>
            {orderToDelete && (
              <dl className='bg-muted grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg p-3 text-sm'>
                <dt className='text-muted-foreground'>Pedido</dt>
                <dd className='font-medium'>
                  {orderToDelete.order_number || `#${orderToDelete.id}`}
                </dd>
                <dt className='text-muted-foreground'>Cliente</dt>
                <dd>
                  {orderToDelete.client?.name ||
                    `Cliente #${orderToDelete.client_id}`}
                </dd>
                <dt className='text-muted-foreground'>Total</dt>
                <dd className='tabular'>
                  {formatCurrency(orderToDelete.total_amount)}
                </dd>
              </dl>
            )}
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Volver
              </Button>
              <Button variant='destructive' onClick={handleDeleteOrder}>
                Cancelar pedido
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
