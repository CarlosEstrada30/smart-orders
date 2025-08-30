import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentActivity } from '@/hooks/use-dashboard'
import { ORDER_STATUS_MAP } from '@/services/dashboard/types'

export function RecentSales() {
  const { recentActivity, isLoading, error } = useRecentActivity()

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className='flex flex-col items-end space-y-1'>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-sm text-muted-foreground">Error cargando pedidos recientes</p>
      </div>
    )
  }

  if (!recentActivity?.recentOrders?.length) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-sm text-muted-foreground">No hay pedidos recientes</p>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className='space-y-8'>
      {recentActivity.recentOrders.map((order) => {
        const statusConfig = ORDER_STATUS_MAP[order.status] || { label: order.status, variant: 'secondary' as const }
        const clientName = order.client?.name || `Cliente #${order.client_id}`
        
        return (
          <div key={order.id} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarImage src={`/avatars/client-${order.client_id}.png`} alt={clientName} />
              <AvatarFallback>{getInitials(clientName)}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>{clientName}</p>
                <p className='text-muted-foreground text-sm'>
                  {order.order_number} • {formatDate(order.created_at)}
                </p>
              </div>
              <div className='flex flex-col items-end space-y-1'>
                <div className='font-medium'>{formatCurrency(order.total_amount)}</div>
                <Badge variant={statusConfig.variant} className="text-xs">
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        )
      })}
      
      {recentActivity.recentOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No hay pedidos recientes</p>
        </div>
      )}
    </div>
  )
}
