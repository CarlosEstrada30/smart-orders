import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/services/api/client'
import { ORDER_STATUS_MAP } from '@/services/dashboard/types'
import type { OrderSummary } from '@/services/dashboard/types'

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount)
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
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex flex-1 items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-sm text-muted-foreground">No hay pedidos recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const statusConfig =
          ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP] ?? {
            label: order.status,
            variant: 'secondary' as const,
          }
        const clientName = order.client?.name ?? `Cliente #${order.client_id}`

        return (
          <div key={order.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback>{getInitials(clientName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">{clientName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.order_number} · {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-medium">
                  {formatCurrency(order.total_amount)}
                </span>
                <Badge variant={statusConfig.variant} className="text-xs">
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
