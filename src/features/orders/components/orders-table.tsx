import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { MoreHorizontal, Eye, Trash2, Download, FileText } from 'lucide-react'
import { type Order } from '../data/schema'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { ordersColumns as columns } from './orders-columns'
import { ordersService } from '@/services/orders'
import { toast } from 'sonner'

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
}

export function OrdersTable({ data, onViewOrder, onDeleteOrder }: OrdersTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<Array<{ id: string; value: unknown }>>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Receipt handlers
  const handlePreviewReceipt = async (order: Order) => {
    try {
      setIsLoading(true)
      const url = await ordersService.getReceiptPreviewBlob(order.id!)
      // Abrir en nueva ventana
      const newWindow = window.open('', '_blank', 'width=800,height=600')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Comprobante - ${order.order_number || `Orden ${order.id}`}</title></head>
            <body style="margin:0;">
              <iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe>
            </body>
          </html>
        `)
        newWindow.document.close()
        
        // Cleanup cuando se cierre la ventana
        newWindow.addEventListener('beforeunload', () => {
          window.URL.revokeObjectURL(url)
        })
      }
      toast.success('Vista previa abierta en nueva ventana')
    } catch (_error) {
      toast.error('Error al abrir vista previa')
    } finally {
      setIsLoading(false)
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

  const handleGenerateReceipt = async (order: Order) => {
    try {
      setIsLoading(true)
      await ordersService.generateReceipt(order.id!)
      toast.success(`Comprobante de orden ${order.order_number || order.id} generado`)
    } catch (_error) {
      toast.error('Error al generar el comprobante')
      // Error generating receipt
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
                <DropdownMenuItem onClick={() => handleGenerateReceipt(order)} disabled={isLoading}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generar comprobante
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
    data,
    columns: columnsWithHandlers,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar table={table} />
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
      <DataTablePagination table={table} />
    </div>
  )
}
