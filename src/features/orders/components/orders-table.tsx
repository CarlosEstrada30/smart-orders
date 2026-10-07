import { useState, memo } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type BulkOrderStatusResponse } from '@/services/orders'
import { ordersService, type OrdersQueryParams } from '@/services/orders'
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  Edit,
  DollarSign,
  FileText,
  SearchX,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/empty-state'
import { OrderStatusRoute } from '@/components/order-status-route'
import { ModernPDFViewer } from '@/components/pdf-viewer'
import { StatusBadge } from '@/components/status-badge'
import { getPaymentStatusData } from '../data/data'
import { type Order, type OrderStatus } from '../data/schema'
import { BulkActionsToolbar } from './bulk-actions-toolbar'
import { CreatePaymentModal } from './create-payment-modal'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { ordersColumns as columns } from './orders-columns'

export interface TablePaginationInfo {
  total: number // Total de registros disponibles
  count: number // Registros en página actual
  page: number // Página actual
  pages: number // Total de páginas
  per_page: number // Registros por página
  has_next: boolean // ¿Hay página siguiente?
  has_previous: boolean // ¿Hay página anterior?
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type OrdersTableProps = {
  data: Order[]
  onViewOrder?: (order: Order) => void
  onEditOrder?: (order: Order) => void
  onDeleteOrder?: (order: Order) => void
  onBulkStatusChange?: (
    orderIds: number[],
    newStatus: OrderStatus
  ) => Promise<BulkOrderStatusResponse>
  onStockError?: (result: BulkOrderStatusResponse) => void
  onFiltersChange: (filters: Partial<OrdersQueryParams>) => void
  filters: OrdersQueryParams
  pagination: TablePaginationInfo
  loading?: boolean
  onPaymentCreated?: () => void // Callback para refrescar datos después de crear pago
}

const OrdersTableComponent = ({
  data,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onBulkStatusChange,
  onStockError,
  onFiltersChange,
  filters,
  pagination,
  loading: _loading = false,
  onPaymentCreated,
}: OrdersTableProps) => {
  // Solo estados locales para UI (no para filtros ni paginación)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [currentOrderTitle, setCurrentOrderTitle] = useState<string>('')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedOrderForPayment, setSelectedOrderForPayment] =
    useState<Order | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<number | undefined>(
    undefined
  )

  // Obtener IDs de órdenes seleccionadas
  const selectedOrderIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key as keyof typeof rowSelection])
    .map((key) => data[parseInt(key)]?.id)
    .filter(Boolean) as number[]

  // Obtener órdenes completas seleccionadas
  const selectedOrders = Object.keys(rowSelection)
    .filter((key) => rowSelection[key as keyof typeof rowSelection])
    .map((key) => data[parseInt(key)])
    .filter(Boolean) as Order[]

  // Limpiar selección
  const handleClearSelection = () => {
    setRowSelection({})
  }

  // Receipt handlers
  const handlePreviewReceipt = async (order: Order) => {
    try {
      setIsLoading(true)
      const url = await ordersService.getReceiptPreviewBlob(order.id!)
      setPdfUrl(url)
      setCurrentOrderTitle(
        `Comprobante - ${order.order_number || `Orden ${order.id}`}`
      )
      setCurrentOrderId(order.id)
      setPdfViewerOpen(true)
      toast.success('Abriendo vista previa del comprobante')
    } catch (_error) {
      toast.error('Error al abrir vista previa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false)
    // Cleanup del blob URL
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
    setCurrentOrderTitle('')
    setCurrentOrderId(undefined)
  }

  const handleShareWhatsApp = async (orderId: number) => {
    await ordersService.sendReceiptByWhatsApp(orderId)
  }

  const handleDownloadReceipt = async (order: Order) => {
    try {
      setIsLoading(true)
      await ordersService.downloadReceipt(order.id!)
      toast.success(
        `Comprobante de orden ${order.order_number || order.id} descargado`
      )
    } catch (_error) {
      toast.error('Error al descargar el comprobante')
      // Error downloading receipt
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenPaymentModal = (order: Order) => {
    setSelectedOrderForPayment(order)
    setPaymentModalOpen(true)
  }

  const handlePaymentCreated = () => {
    setPaymentModalOpen(false)
    setSelectedOrderForPayment(null)
    onPaymentCreated?.()
  }

  const renderActions = (order: Order) => {
    const canCreatePayment =
      order.status !== 'cancelled' &&
      (order.payment_status !== 'paid' || !order.payment_status) &&
      (order.balance_due === undefined || order.balance_due > 0)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='size-8 p-0'
            disabled={isLoading}
            onClick={(e) => e.stopPropagation()}
          >
            <span className='sr-only'>
              Acciones del pedido {order.order_number}
            </span>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => onViewOrder?.(order)}>
            <Eye />
            Ver detalle
          </DropdownMenuItem>
          {order.status === 'pending' && (
            <DropdownMenuItem onClick={() => onEditOrder?.(order)}>
              <Edit />
              Editar pedido
            </DropdownMenuItem>
          )}
          {canCreatePayment && (
            <DropdownMenuItem onClick={() => handleOpenPaymentModal(order)}>
              <DollarSign />
              Registrar pago
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => await handlePreviewReceipt(order)}
            disabled={isLoading}
          >
            <FileText />
            Ver comprobante
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDownloadReceipt(order)}
            disabled={isLoading}
          >
            <Download />
            Descargar comprobante
          </DropdownMenuItem>
          {order.status !== 'cancelled' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onClick={() => onDeleteOrder?.(order)}
              >
                <Trash2 />
                Cancelar pedido
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Create columns with handlers
  const columnsWithHandlers = columns.map((column) =>
    column.id === 'actions'
      ? {
          ...column,
          cell: ({ row }: { row: { original: Order } }) =>
            renderActions(row.original),
        }
      : column
  )

  const table = useReactTable({
    data: data || [], // Asegurar que siempre sea un array
    columns: columnsWithHandlers,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Manualmente configuramos el row count para controlar la paginación desde el backend
    manualPagination: true,
    pageCount: pagination.pages || 1,
    rowCount: pagination.total || 0,
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        onFiltersChange={onFiltersChange}
        filters={filters}
      />

      {selectedOrderIds.length > 0 && onBulkStatusChange && (
        <BulkActionsToolbar
          selectedOrders={selectedOrderIds}
          orders={selectedOrders}
          onBulkStatusChange={onBulkStatusChange}
          onClearSelection={handleClearSelection}
          onStockError={onStockError}
          onPaymentsCreated={onPaymentCreated}
          loading={isLoading}
        />
      )}
      {/* Escritorio: tabla */}
      <div
        className={cn(
          'hidden overflow-x-auto rounded-lg border transition-opacity md:block',
          _loading && 'pointer-events-none opacity-60'
        )}
        aria-busy={_loading}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='bg-muted/50 hover:bg-muted/50'
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'text-muted-foreground',
                      header.column.columnDef.meta?.className ?? ''
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='data-[state=selected]:bg-accent/60 cursor-pointer'
                  onClick={(e) => {
                    // Clic en la fila abre el detalle; checkboxes y menús no
                    if (
                      (e.target as HTMLElement).closest(
                        'button, a, [role="checkbox"], [role="menuitem"]'
                      )
                    )
                      return
                    onViewOrder?.(row.original)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ''}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={columns.length}>
                  <EmptyState
                    icon={SearchX}
                    title='No hay pedidos con estos filtros'
                    description='Cambia el estado, la ruta o las fechas para ver más resultados.'
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Celular: tarjetas */}
      <ul
        className={cn(
          'space-y-2 transition-opacity md:hidden',
          _loading && 'opacity-60'
        )}
        aria-busy={_loading}
      >
        {data.length ? (
          data.map((order) => {
            const payment = getPaymentStatusData(order.payment_status)
            const balance =
              order.balance_due ??
              (order.total_amount || 0) - (order.paid_amount || 0)
            return (
              <li
                key={order.id}
                className='bg-card relative rounded-xl border p-3'
              >
                <div className='flex items-start gap-2'>
                  <button
                    type='button'
                    onClick={() => onViewOrder?.(order)}
                    className='focus-visible:after:ring-ring min-w-0 flex-1 text-start after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2'
                  >
                    <span className='block truncate font-medium'>
                      {order.client?.name || `Cliente #${order.client_id}`}
                    </span>
                    <span className='text-muted-foreground tabular block text-xs'>
                      {order.order_number || `#${order.id}`}
                      {order.route ? `, ${order.route.name}` : ''}
                    </span>
                  </button>
                  <span className='tabular shrink-0 pt-0.5 font-semibold'>
                    {formatCurrency(order.total_amount)}
                  </span>
                  <div className='relative z-10 -me-1 -mt-1'>
                    {renderActions(order)}
                  </div>
                </div>
                <div className='mt-3 flex items-center justify-between gap-2'>
                  <OrderStatusRoute status={order.status} variant='mini' />
                  <StatusBadge tone={payment.tone}>
                    {payment.value === 'partial'
                      ? `Debe ${formatCurrency(balance)}`
                      : payment.label}
                  </StatusBadge>
                </div>
              </li>
            )
          })
        ) : (
          <li>
            <EmptyState
              icon={SearchX}
              title='No hay pedidos con estos filtros'
              description='Cambia el estado, la ruta o las fechas para ver más resultados.'
            />
          </li>
        )}
      </ul>

      <DataTablePagination
        table={table}
        onFiltersChange={onFiltersChange}
        filters={filters}
        pagination={pagination}
      />

      <ModernPDFViewer
        pdfUrl={pdfUrl}
        title={currentOrderTitle}
        isOpen={pdfViewerOpen}
        onClose={handleClosePdfViewer}
        orderId={currentOrderId}
        onShareWhatsApp={currentOrderId ? handleShareWhatsApp : undefined}
      />

      {selectedOrderForPayment && (
        <CreatePaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          orderId={selectedOrderForPayment.id!}
          orderNumber={selectedOrderForPayment.order_number}
          totalAmount={selectedOrderForPayment.total_amount || 0}
          balanceDue={
            selectedOrderForPayment.balance_due ??
            (selectedOrderForPayment.total_amount || 0)
          }
          onPaymentCreated={handlePaymentCreated}
        />
      )}
    </div>
  )
}

// Memoized version to prevent unnecessary re-renders
export const OrdersTable = memo(OrdersTableComponent)
