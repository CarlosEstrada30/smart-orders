import { type ColumnDef } from '@tanstack/react-table'
import { StickyNote } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { OrderStatusRoute } from '@/components/order-status-route'
import { StatusBadge } from '@/components/status-badge'
import { getPaymentStatusData } from '../data/data'
import { type Order } from '../data/schema'

// Helper para formatear fechas en formato DD/MM/YYYY
const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

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
      <DataTableColumnHeader column={column} title='Pedido' />
    ),
    cell: ({ row }) => {
      const orderNumber =
        (row.getValue('order_number') as string) || `#${row.original.id}`
      const notes = row.original.notes
      const hasNotes = notes && notes.trim().length > 0

      return (
        <div className='flex items-center gap-2'>
          <span className='tabular font-medium whitespace-nowrap'>
            {orderNumber}
          </span>
          {hasNotes && (
            <Tooltip>
              <TooltipTrigger asChild>
                <StickyNote className='text-muted-foreground hover:text-foreground h-4 w-4 transition-colors' />
              </TooltipTrigger>
              <TooltipContent className='max-w-xs'>
                <p className='whitespace-pre-wrap'>{notes}</p>
              </TooltipContent>
            </Tooltip>
          )}
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
        <div className='min-w-0'>
          <div className='truncate font-medium'>
            {client?.name || `Cliente #${client_id}`}
          </div>
          {client?.phone && (
            <div className='text-muted-foreground tabular text-xs'>
              {client.phone}
            </div>
          )}
          {client && !client.is_active && (
            <StatusBadge className='mt-1'>Inactivo</StatusBadge>
          )}
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
        <div>
          <div className='whitespace-nowrap'>{route.name}</div>
          {!route.is_active && (
            <StatusBadge className='mt-1'>Inactiva</StatusBadge>
          )}
        </div>
      ) : (
        <span className='text-muted-foreground text-sm'>Sin ruta asignada</span>
      )
    },
    accessorFn: (row) => (row.route ? row.route.id.toString() : 'null'),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: 'items_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Productos' />
    ),
    cell: ({ row }) => {
      const { items } = row.original
      const itemsCount = items?.length || 0
      const totalQuantity =
        items?.reduce((sum, item) => sum + item.quantity, 0) || 0

      return (
        <div className='tabular'>
          <span className='font-medium'>{itemsCount}</span>
          <div className='text-muted-foreground text-xs whitespace-nowrap'>
            {totalQuantity} unidades
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'discount_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descuento' />
    ),
    cell: ({ row }) => {
      const discount = (row.getValue('discount_amount') as number) || 0
      if (discount > 0) {
        return (
          <span className='text-success tabular whitespace-nowrap'>
            −{formatCurrency(discount)}
          </span>
        )
      }
      return <span className='text-muted-foreground'>—</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const amount = (row.getValue('total_amount') as number) || 0
      return (
        <div className='tabular font-semibold whitespace-nowrap'>
          {formatCurrency(amount)}
        </div>
      )
    },
  },
  {
    id: 'payment_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pago' />
    ),
    cell: ({ row }) => {
      const order = row.original
      const paymentStatus = order.payment_status || 'unpaid'
      const paidAmount = order.paid_amount || 0
      const totalAmount = order.total_amount || 0
      // Usar nullish coalescing para que 0 no se trate como falsy
      const balanceDue = order.balance_due ?? totalAmount - paidAmount

      const config = getPaymentStatusData(paymentStatus)

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatusBadge
              tone={config.tone}
              className='cursor-help'
              tabIndex={0}
            >
              {config.label}
            </StatusBadge>
          </TooltipTrigger>
          <TooltipContent className='max-w-xs'>
            <div className='min-w-40 space-y-1 text-sm'>
              <div className='flex justify-between gap-4'>
                <span className='opacity-75'>Total</span>
                <span className='tabular font-medium'>
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className='flex justify-between gap-4'>
                <span className='opacity-75'>Pagado</span>
                <span className='tabular font-medium'>
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <div className='flex justify-between gap-4'>
                <span className='opacity-75'>Saldo</span>
                <span className='tabular font-semibold'>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )
    },
    filterFn: (row, _id, value) => {
      const paymentStatus = row.original.payment_status || 'unpaid'
      return value.includes(paymentStatus)
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
      return <OrderStatusRoute status={status} variant='mini' />
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
        <div
          className='tabular text-sm whitespace-nowrap'
          title={
            updatedAt && updatedAt !== createdAt
              ? `Actualizado el ${formatDate(new Date(updatedAt))}`
              : undefined
          }
        >
          {createdAt ? formatDate(new Date(createdAt)) : '—'}
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
        const rowDateOnly = new Date(
          rowDate.getFullYear(),
          rowDate.getMonth(),
          rowDate.getDate()
        )
        const fromDateOnly = new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate()
        )
        const toDateOnly = new Date(
          to.getFullYear(),
          to.getMonth(),
          to.getDate()
        )

        return rowDateOnly >= fromDateOnly && rowDateOnly <= toDateOnly
      }

      return true
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    // El menú real se inyecta en orders-table.tsx con los handlers
    cell: () => null,
    enableHiding: false,
  },
]
