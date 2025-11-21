import { useState, memo } from 'react'
import { ModernPDFViewer } from '@/components/pdf-viewer'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { MoreHorizontal, Eye, Trash2, Download, Edit, DollarSign } from 'lucide-react'
import { type Order, type OrderStatus } from '../data/schema'
import { type BulkOrderStatusResponse } from '@/services/orders'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { BulkActionsToolbar } from './bulk-actions-toolbar'
import { ordersColumns as columns } from './orders-columns'
import { ordersService, type OrdersQueryParams } from '@/services/orders'
import { CreatePaymentModal } from './create-payment-modal'
import { toast } from 'sonner'

export interface TablePaginationInfo {
  total: number          // Total de registros disponibles
  count: number          // Registros en página actual
  page: number           // Página actual
  pages: number          // Total de páginas
  per_page: number       // Registros por página
  has_next: boolean      // ¿Hay página siguiente?
  has_previous: boolean  // ¿Hay página anterior?
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
  onBulkStatusChange?: (orderIds: number[], newStatus: OrderStatus) => Promise<BulkOrderStatusResponse>
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
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null)
  

  // Obtener IDs de órdenes seleccionadas
  const selectedOrderIds = Object.keys(rowSelection)
    .filter(key => rowSelection[key as keyof typeof rowSelection])
    .map(key => data[parseInt(key)]?.id)
    .filter(Boolean) as number[]

  // Obtener órdenes completas seleccionadas
  const selectedOrders = Object.keys(rowSelection)
    .filter(key => rowSelection[key as keyof typeof rowSelection])
    .map(key => data[parseInt(key)])
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
      setCurrentOrderTitle(`Comprobante - ${order.order_number || `Orden ${order.id}`}`)
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
  }


  const handleDownloadReceipt = async (order: Order) => {
    try {
      setIsLoading(true)
      await ordersService.downloadReceipt(order.id!)
      toast.success(`Comprobante de orden ${order.order_number || order.id} descargado`)
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

  // Create columns with handlers
  const columnsWithHandlers = columns.map((column) => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: { row: { original: Order } }) => {
          const order = row.original
          const canCreatePayment = 
            order.status !== 'cancelled' && 
            (order.payment_status !== 'paid' || !order.payment_status) &&
            (order.balance_due === undefined || order.balance_due > 0)
          
          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewOrder?.(order)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  {order.status === 'pending' && (
                    <DropdownMenuItem onClick={() => onEditOrder?.(order)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar orden
                    </DropdownMenuItem>
                  )}
                  {canCreatePayment && (
                    <DropdownMenuItem onClick={() => handleOpenPaymentModal(order)}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Registrar Pago
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => await handlePreviewReceipt(order)} disabled={isLoading}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver comprobante
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReceipt(order)} disabled={isLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar comprobante
                  </DropdownMenuItem>
                  {order.status !== 'cancelled' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onDeleteOrder?.(order)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancelar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )
        },
      }
    }
    return column
  })

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
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
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
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className ?? ''
                      )}
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
      />

      {selectedOrderForPayment && (
        <CreatePaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          orderId={selectedOrderForPayment.id!}
          orderNumber={selectedOrderForPayment.order_number}
          totalAmount={selectedOrderForPayment.total_amount || 0}
          balanceDue={selectedOrderForPayment.balance_due ?? (selectedOrderForPayment.total_amount || 0)}
          onPaymentCreated={handlePaymentCreated}
        />
      )}
    </div>
  )
}

// Memoized version to prevent unnecessary re-renders
export const OrdersTable = memo(OrdersTableComponent)
