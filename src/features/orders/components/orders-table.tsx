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
import { MoreHorizontal, Eye, Trash2, Download } from 'lucide-react'
import { type Order } from '../data/schema'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { ordersColumns as columns } from './orders-columns'
import { ordersService, type OrdersQueryParams } from '@/services/orders'
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
  onDeleteOrder?: (order: Order) => void
  onFiltersChange: (filters: Partial<OrdersQueryParams>) => void
  filters: OrdersQueryParams
  pagination: TablePaginationInfo
  loading?: boolean
}

const OrdersTableComponent = ({ 
  data, 
  onViewOrder, 
  onDeleteOrder, 
  onFiltersChange,
  filters,
  pagination,
  loading: _loading = false
}: OrdersTableProps) => {
  // Solo estados locales para UI (no para filtros ni paginación)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [currentOrderTitle, setCurrentOrderTitle] = useState<string>('')

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

  const handleDownloadFromViewer = async () => {
    // Extraer el ID de la orden desde el título actual
    const orderIdMatch = currentOrderTitle.match(/Orden (\d+)/)
    const orderNumberMatch = currentOrderTitle.match(/Comprobante - (.+)/)
    
    if (orderIdMatch || orderNumberMatch) {
      try {
        // Buscar la orden en los datos actuales
        let orderId: number | undefined
        
        if (orderNumberMatch) {
          const orderNumber = orderNumberMatch[1]
          const order = data.find(o => o.order_number === orderNumber)
          orderId = order?.id
        } else if (orderIdMatch) {
          orderId = parseInt(orderIdMatch[1])
        }
        
        if (orderId) {
          await ordersService.downloadReceipt(orderId)
          toast.success('Comprobante descargado exitosamente')
        }
      } catch (_error) {
        toast.error('Error al descargar el comprobante')
      }
    }
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


  // Create columns with handlers
  const columnsWithHandlers = columns.map((column) => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: { row: { original: Order } }) => {
          const order = row.original
          
          return (
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
        data={data} 
        onFiltersChange={onFiltersChange}
        filters={filters}
      />
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
        onDownload={handleDownloadFromViewer}
      />
    </div>
  )
}

// Memoized version to prevent unnecessary re-renders
export const OrdersTable = memo(OrdersTableComponent)
