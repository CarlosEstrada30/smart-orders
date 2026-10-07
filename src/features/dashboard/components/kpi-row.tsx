import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import type { MonthlyAnalyticsResponse } from '@/services/dashboard/types'
import { ordersService, type OrdersQueryParams } from '@/services/orders'
import { Banknote, CircleDollarSign, Clock, Truck } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { StatCard } from '@/components/stat-card'

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

// Solo necesitamos el total: pedimos una página de un registro
async function countOrders(params: OrdersQueryParams) {
  const response = await ordersService.getOrders({ ...params, limit: 1 })
  return response.pagination.total
}

async function fetchDeliveredThisMonth(routeId: number | null) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const query = new URLSearchParams({
    status_filter: 'delivered',
    year: String(year),
  })
  if (routeId != null) query.append('route_id', String(routeId))
  const response = await apiClient.get<MonthlyAnalyticsResponse>(
    `/orders/analytics/monthly-summary?${query.toString()}`
  )
  const byMonth = (m: number) =>
    response.monthly_data?.find((d) => d.month === m && d.year === year)
  return {
    current: byMonth(month),
    previous: month > 1 ? byMonth(month - 1) : undefined,
    monthName: MONTHS[month - 1],
    previousName: MONTHS[(month + 10) % 12],
  }
}

function comparison(current = 0, previous = 0, previousName: string) {
  if (!previous) return null
  const change = Math.round(((current - previous) / previous) * 100)
  if (change === 0) return `Igual que ${previousName}`
  return `${Math.abs(change)} % ${change > 0 ? 'más' : 'menos'} que ${previousName}`
}

export function KpiRow({ routeId }: { routeId: number | null }) {
  const sales = useQuery({
    queryKey: ['dashboard-kpi-sales', routeId],
    queryFn: () => fetchDeliveredThisMonth(routeId),
    staleTime: 5 * 60 * 1000,
  })
  const counts = useQuery({
    queryKey: ['dashboard-kpi-counts', routeId],
    queryFn: async () => {
      const route = routeId != null ? { route_id: routeId } : {}
      const [pending, inProgress, shipped, unpaid] = await Promise.all([
        countOrders({ ...route, status_filter: 'pending' }),
        countOrders({ ...route, status_filter: 'in_progress' }),
        countOrders({ ...route, status_filter: 'shipped' }),
        countOrders({ ...route, payment_status_filter: 'unpaid' }),
      ])
      return { pending, onTheWay: inProgress + shipped, unpaid }
    },
    staleTime: 60 * 1000,
  })

  const current = sales.data?.current
  const delivered = current?.order_count ?? 0
  const number = (n?: number) => (n ?? 0).toLocaleString('es-GT')

  return (
    <div className='grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4'>
      <StatCard
        label={`Ventas entregadas en ${sales.data?.monthName ?? 'el mes'}`}
        value={formatCurrency(current?.total_amount ?? 0)}
        hint={
          sales.data &&
          (comparison(
            current?.total_amount,
            sales.data.previous?.total_amount,
            sales.data.previousName
          ) ??
            (delivered
              ? `${number(delivered)} pedidos entregados`
              : 'Aún no hay entregas este mes'))
        }
        icon={Banknote}
        isLoading={sales.isLoading}
      />
      <StatCard
        label='Por confirmar'
        value={number(counts.data?.pending)}
        hint='Pedidos en estado pendiente'
        icon={Clock}
        isLoading={counts.isLoading}
      />
      <StatCard
        label='En camino'
        value={number(counts.data?.onTheWay)}
        hint='En proceso o enviados'
        icon={Truck}
        isLoading={counts.isLoading}
      />
      <StatCard
        label='Sin pagar'
        value={number(counts.data?.unpaid)}
        hint='Pedidos sin ningún abono'
        icon={CircleDollarSign}
        isLoading={counts.isLoading}
      />
    </div>
  )
}
