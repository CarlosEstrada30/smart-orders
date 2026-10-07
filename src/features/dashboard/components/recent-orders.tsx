import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { apiClient } from '@/services/api/client'
import type { OrderSummary } from '@/services/dashboard/types'
import { ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { OrderStatusRoute } from '@/components/order-status-route'

async function fetchRecentOrders(): Promise<OrderSummary[]> {
  const response = await apiClient.get<any>('/orders/?limit=5&paginated=false')
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.items)) return response.items
  return []
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-GT', {
    month: 'short',
    day: 'numeric',
  })
}

export function RecentOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: fetchRecentOrders,
    staleTime: 60 * 1000, // 1 minuto
  })

  if (isLoading) {
    return (
      <div className='space-y-6'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Skeleton className='h-9 w-9 shrink-0 rounded-full' />
            <div className='flex flex-1 items-center justify-between'>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-3 w-20' />
              </div>
              <div className='flex flex-col items-end gap-1'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-5 w-20' />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title='Todavía no hay pedidos'
        description='Los pedidos nuevos aparecerán aquí.'
        className='py-8'
      />
    )
  }

  return (
    <ul className='-mx-2 divide-y'>
      {orders.map((order) => {
        const clientName = order.client?.name ?? `Cliente #${order.client_id}`

        return (
          <li key={order.id}>
            <Link
              to='/order-detail/$orderId'
              params={{ orderId: String(order.id) }}
              className='hover:bg-accent/60 focus-visible:ring-ring flex items-center gap-3 rounded-lg px-2 py-3 outline-none focus-visible:ring-2'
            >
              <Avatar className='size-9 shrink-0'>
                <AvatarFallback className='bg-accent text-accent-foreground text-xs font-semibold'>
                  {getInitials(clientName)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1 space-y-1'>
                <div className='flex items-baseline justify-between gap-3'>
                  <p className='truncate text-sm font-medium'>{clientName}</p>
                  <span className='tabular shrink-0 text-sm font-semibold'>
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-muted-foreground truncate text-xs'>
                    {order.order_number}, {formatDate(order.created_at)}
                  </p>
                  <OrderStatusRoute
                    status={order.status}
                    variant='mini'
                    className='[&>span:not(.sr-only)]:text-xs'
                  />
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
