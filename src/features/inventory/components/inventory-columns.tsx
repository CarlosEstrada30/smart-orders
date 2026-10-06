import { type ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Package
} from 'lucide-react'
import { type InventoryEntryList } from '../data/schema'
import { getEntryTypeData, getEntryStatusData } from '../data/data'
import { DataTableColumnHeader } from '@/components/data-table'

export const inventoryColumns: ColumnDef<InventoryEntryList>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(''),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'entry_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Número de entrada' />
    ),
    cell: ({ row }) => {
      const entryNumber = row.getValue('entry_number') as string
      return (
        <div className="tabular font-medium whitespace-nowrap">
          {entryNumber}
        </div>
      )
    },
    meta: {
      className: cn(''),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'entry_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const entryType = row.getValue('entry_type') as string
      const typeData = getEntryTypeData(entryType as any)
      
      return (
        <Badge variant="outline" className={cn(typeData.color)}>
          <div className="flex items-center space-x-1">
            <typeData.icon className="h-3 w-3" />
            <span>{typeData.label}</span>
          </div>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusData = getEntryStatusData(status as any)
      
      return (
        <Badge variant={statusData.variant} className={cn(statusData.color)}>
          <div className="flex items-center space-x-1">
            <statusData.icon className="h-3 w-3" />
            <span>{statusData.label}</span>
          </div>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Usuario' />
    ),
    cell: ({ row }) => {
      const userName = row.original.user_name
      
      return userName ? (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{userName}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">No disponible</span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'items_summary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ row }) => {
      const itemsCount = row.original.items_count
      
      return (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{itemsCount}</span>
          <span className="text-xs text-muted-foreground">
            {itemsCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'total_cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Costo total' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('total_cost') as number
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: 'entry_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha' />
    ),
    cell: ({ row }) => {
      const entryDate = row.getValue('entry_date') as string
      const completedDate = row.original.completed_date
      
      return (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <div>{entryDate ? new Date(entryDate).toLocaleDateString() : '-'}</div>
            {completedDate && (
              <div className="text-xs text-success">
                Completado: {new Date(completedDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const entry = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            {entry.status === 'draft' && (
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {entry.status === 'pending' && (
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobar
              </DropdownMenuItem>
            )}
            {entry.status === 'approved' && (
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar
              </DropdownMenuItem>
            )}
            {(entry.status === 'draft' || entry.status === 'pending') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </DropdownMenuItem>
              </>
            )}
            {entry.status === 'draft' && (
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

