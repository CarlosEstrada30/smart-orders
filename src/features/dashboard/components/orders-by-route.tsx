import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { apiClient } from '@/services/api/client'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

// Palette that works in both light and dark mode via opacity on the primary
const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(271, 91%, 65%)',
  'hsl(199, 89%, 48%)',
  'hsl(330, 81%, 60%)',
  'hsl(160, 84%, 39%)',
]

interface RouteOrderData {
  route_id: number | null
  route_name: string
  order_count: number
  total_amount: number
  percentage: number
}

interface RouteOrdersResponse {
  routes: RouteOrderData[]
  total_orders: number
  year: number | null
}

async function fetchOrdersByRoute(year: number): Promise<RouteOrdersResponse> {
  return apiClient.get<RouteOrdersResponse>(
    `/orders/analytics/by-route?year=${year}`
  )
}

function formatCurrency(value: number) {
  return `Q${value.toLocaleString('es-GT', { maximumFractionDigits: 0 })}`
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d: RouteOrderData = payload[0].payload
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg text-sm space-y-1">
      <p className="font-medium">{d.route_name}</p>
      <p className="text-muted-foreground">
        Pedidos: <span className="font-medium text-foreground">{d.order_count}</span>
      </p>
      <p className="text-muted-foreground">
        Ingresos:{' '}
        <span className="font-medium text-foreground">{formatCurrency(d.total_amount)}</span>
      </p>
      <p className="text-muted-foreground">
        Participación:{' '}
        <span className="font-medium text-foreground">{d.percentage}%</span>
      </p>
    </div>
  )
}

export function OrdersByRoute() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-orders-by-route', selectedYear],
    queryFn: () => fetchOrdersByRoute(selectedYear),
    staleTime: 60 * 1000,
  })

  const routes = data?.routes ?? []
  const totalOrders = data?.total_orders ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pedidos por Ruta</h2>
          <p className="text-sm text-muted-foreground">
            {totalOrders > 0 ? `${totalOrders} pedidos en total` : 'Distribución por ruta de entrega'}
          </p>
        </div>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="space-y-3 w-full px-8">
            <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            <div className="flex justify-center gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
        </div>
      ) : routes.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Sin datos de rutas para {selectedYear}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={routes}
              dataKey="order_count"
              nameKey="route_name"
              cx="50%"
              cy="45%"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={2}
            >
              {routes.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
