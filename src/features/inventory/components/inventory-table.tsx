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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Send,
  CheckCircle2
} from 'lucide-react'
import { type InventoryEntryList } from '../data/schema'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { inventoryColumns as columns } from './inventory-columns'
import { inventoryService } from '@/services/inventory'
import { toast } from 'sonner'
import { 
  getAvailableActionsForUser,
  getConfirmationConfig,
  getStatusTooltip,
  canUserPerformAction,
  type UserRole,
  type WorkflowAction
} from '../utils/workflow'
import { getEntryTypeData, getEntryStatusData } from '../data/data'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type InventoryTableProps = {
  data: InventoryEntryList[]
  onViewEntry?: (entry: InventoryEntryList) => void
  onEditEntry?: (entry: InventoryEntryList) => void
  onDeleteEntry?: (entry: InventoryEntryList) => void
  onApproveEntry?: (entry: InventoryEntryList) => void
  onCompleteEntry?: (entry: InventoryEntryList) => void
  onCancelEntry?: (entry: InventoryEntryList) => void
  onSubmitEntry?: (entry: InventoryEntryList) => void
  userRole?: UserRole
}

export function InventoryTable({ 
  data, 
  onViewEntry, 
  onEditEntry, 
  onDeleteEntry,
  onApproveEntry,
  onCompleteEntry,
  onCancelEntry,
  onSubmitEntry,
  userRole = 'employee' // Usar 'employee' como fallback más seguro
}: InventoryTableProps) {
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
  
  // Enhanced confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    action: WorkflowAction | null
    entry: InventoryEntryList | null
  }>({
    isOpen: false,
    action: null,
    entry: null
  })

  // Entry action handlers
  const handleSubmitEntry = async (entry: InventoryEntryList) => {
    try {
      setIsLoading(true)
      await inventoryService.submitEntry(entry.id)
      toast.success(`Entrada ${entry.entry_number} enviada para aprobación`)
      onSubmitEntry?.(entry)
    } catch (_error) {
      toast.error('Error al enviar la entrada para aprobación')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveEntry = async (entry: InventoryEntryList) => {
    try {
      setIsLoading(true)
      await inventoryService.approveEntry(entry.id)
      toast.success(`Entrada ${entry.entry_number} aprobada exitosamente`)
      onApproveEntry?.(entry)
    } catch (_error) {
      toast.error('Error al aprobar la entrada')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveDirectly = async (entry: InventoryEntryList) => {
    try {
      setIsLoading(true)
      await inventoryService.approveDirectly(entry.id)
      toast.success(`Entrada ${entry.entry_number} aprobada directamente`)
      onApproveEntry?.(entry)
    } catch (_error) {
      toast.error('Error al aprobar la entrada directamente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteEntry = async (entry: InventoryEntryList) => {
    try {
      setIsLoading(true)
      await inventoryService.completeEntry(entry.id)
      toast.success(`Entrada ${entry.entry_number} completada exitosamente`)
      onCompleteEntry?.(entry)
    } catch (_error) {
      toast.error('Error al completar la entrada')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEntry = async (entry: InventoryEntryList) => {
    try {
      setIsLoading(true)
      await inventoryService.cancelEntry(entry.id)
      toast.success(`Entrada ${entry.entry_number} cancelada`)
      onCancelEntry?.(entry)
    } catch (_error) {
      toast.error('Error al cancelar la entrada')
    } finally {
      setIsLoading(false)
    }
  }

  // Generic workflow action handler with enhanced confirmations
  const openConfirmationDialog = (action: WorkflowAction, entry: InventoryEntryList) => {
    setConfirmationDialog({
      isOpen: true,
      action,
      entry
    })
  }

  const executeWorkflowAction = async () => {
    const { action, entry } = confirmationDialog
    if (!action || !entry) return

    try {
      setIsLoading(true)
      
      switch (action.id) {
        case 'submit':
          await handleSubmitEntry(entry)
          break
        case 'approve':
          await handleApproveEntry(entry)
          break
        case 'approve_direct':
          await handleApproveDirectly(entry)
          break
        case 'complete':
          await handleCompleteEntry(entry)
          break
        case 'cancel':
          await handleCancelEntry(entry)
          break
        default:
          console.warn(`Unknown action: ${action.id}`)
      }
    } finally {
      setConfirmationDialog({ isOpen: false, action: null, entry: null })
      setIsLoading(false)
    }
  }

  // Create columns with handlers
  const columnsWithHandlers = columns.map((column) => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: { row: { original: InventoryEntryList } }) => {
          const entry = row.original
          const availableActions = getAvailableActionsForUser(entry.status, userRole, true)
          const statusData = getEntryStatusData(entry.status)
          const entryTypeData = getEntryTypeData(entry.entry_type)
          
          if (availableActions.length === 0) {
            return (
              <div className="flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Sin acciones</span>
              </div>
            )
          }
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center space-x-2">
                  <statusData.icon className="h-4 w-4" />
                  <span>Acciones</span>
                </DropdownMenuLabel>
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {getStatusTooltip(entry.status)}
                </div>
                <DropdownMenuSeparator />
                
                {/* Ver detalles siempre disponible */}
                <DropdownMenuItem onClick={() => onViewEntry?.(entry)} disabled={isLoading}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                
                {/* Editar solo para DRAFT */}
                {entry.status === 'draft' && canUserPerformAction('edit', entry.status, userRole, true) && (
                  <DropdownMenuItem onClick={() => onEditEntry?.(entry)} disabled={isLoading}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Acciones de workflow */}
                {availableActions.map((action) => {
                  const IconComponent = {
                    send: Send,
                    'check-circle': CheckCircle,
                    'check-circle-2': CheckCircle2,
                    'x-circle': XCircle
                  }[action.icon] || CheckCircle

                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => openConfirmationDialog(action, entry)}
                      disabled={isLoading}
                      className={action.variant === 'destructive' ? 'text-red-600' : ''}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {action.label}
                    </DropdownMenuItem>
                  )
                })}

                {/* Eliminar solo para DRAFT */}
                {entry.status === 'draft' && canUserPerformAction('delete', entry.status, userRole, true) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDeleteEntry?.(entry)}
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar permanentemente
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

      {/* Enhanced Confirmation Dialog */}
      <Dialog open={confirmationDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setConfirmationDialog({ isOpen: false, action: null, entry: null })
        }
      }}>
        <DialogContent className="max-w-lg">
          {confirmationDialog.action && confirmationDialog.entry && (() => {
            const { action, entry } = confirmationDialog
            const entryTypeData = getEntryTypeData(entry.entry_type)
            const config = getConfirmationConfig(action, entry.entry_number, entryTypeData.label)
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span>{config.title}</span>
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    <div className="whitespace-pre-line">{config.description}</div>
                    
                    {/* Entry details */}
                    <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
                      <div className="font-medium">Detalles de la Entrada:</div>
                      <div className="text-sm space-y-1">
                        <div><strong>Número:</strong> {entry.entry_number}</div>
                        <div><strong>Tipo:</strong> {entryTypeData.label}</div>
                        <div><strong>Estado actual:</strong> {getEntryStatusData(entry.status).label}</div>
                        <div><strong>Items:</strong> {entry.items_count}</div>
                        <div><strong>Costo total:</strong> Q{entry.total_cost.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Critical action warning */}
                    {action.id === 'complete' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-red-800">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">CONFIRMACIÓN FINAL</span>
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          Al completar esta entrada, el stock de todos los productos se actualizará inmediatamente en el sistema.
                        </div>
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmationDialog({ isOpen: false, action: null, entry: null })}
                    disabled={isLoading}
                  >
                    {config.cancelLabel}
                  </Button>
                  <Button 
                    variant={action.id === 'complete' ? 'destructive' : action.variant === 'destructive' ? 'destructive' : 'default'}
                    onClick={executeWorkflowAction}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Procesando...' : config.confirmLabel}
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

