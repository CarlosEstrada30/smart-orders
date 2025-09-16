import { type ColumnDef } from '@tanstack/react-table'
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
import { User, Route, MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { type Order } from '../data/schema'
import { getOrderStatusData } from '../data/data'
import { DataTableColumnHeader } from '@/features/users/components/data-table-column-header'

export const ordersColumns: ColumnDef<Order>[] = [
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
    accessorKey: 'order_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Número de Orden' />
    ),
    cell: ({ row }) => {
      const orderNumber = row.getValue('order_number') as string || `#${row.original.id}`
      return (
        <div className="font-mono font-medium">
          {orderNumber}
        </div>
      )
    },
    meta: {
      className: cn(''),
    },
    enableHiding: false,
  },
  {
    id: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      const { client, client_id } = row.original
      return (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {client?.name || `Cliente #${client_id}`}
            </div>
            {client?.phone && (
              <div className="text-sm text-muted-foreground">
                {client.phone}
              </div>
            )}
            {client && !client.is_active && (
              <Badge variant="secondary" className="text-xs mt-1">
                Inactivo
              </Badge>
            )}
          </div>
        </div>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    id: 'route',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ruta' />
    ),
    cell: ({ row }) => {
      const { route } = row.original
      return route ? (
        <div className="flex items-center space-x-2">
          <Route className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{route.name}</div>
            {!route.is_active && (
              <Badge variant="secondary" className="text-xs mt-1">
                Inactiva
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Sin ruta asignada</span>
      )
    },
    accessorFn: (row) => row.route ? row.route.id.toString() : 'null',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: 'items_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ row }) => {
      const { items } = row.original
      const itemsCount = items?.length || 0
      const totalQuantity = items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      
      return (
        <div className="text-center">
          <span className="font-medium">{itemsCount}</span>
          <div className="text-xs text-muted-foreground">
            {totalQuantity} unidades
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('total_amount') as number || 0
      return <div className="font-medium">Q{amount.toFixed(2)}</div>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusData = getOrderStatusData(status)
      
      return (
        <Badge variant="outline" className={cn('capitalize', statusData.color)}>
          <div className="flex items-center space-x-1">
            <statusData.icon className="h-4 w-4" />
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
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha' />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string
      const updatedAt = row.original.updated_at
      
      return (
        <div className="text-sm">
          <div>{createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</div>
          {updatedAt && updatedAt !== createdAt && (
            <div className="text-xs text-muted-foreground">
              Actualizado: {new Date(updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      // value es { from: Date, to: Date } | null
      if (!value) return true
      
      const rowDate = new Date(row.getValue(id) as string)
      const { from, to } = value
      
      if (from && to) {
        // Comparar solo la fecha (sin hora)
        const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate())
        const fromDateOnly = new Date(from.getFullYear(), from.getMonth(), from.getDate())
        const toDateOnly = new Date(to.getFullYear(), to.getMonth(), to.getDate())
        
        return rowDateOnly >= fromDateOnly && rowDateOnly <= toDateOnly
      }
      
      return true
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original
      
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
            {order.status !== 'cancelled' && (
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

