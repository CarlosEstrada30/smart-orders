import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

interface TopClientData {
  client_id: number
  client_name: string
  total_amount: number
  order_count: number
  avg_order_value: number
}

interface TopClientsResponse {
  clients: TopClientData[]
  year: number | null
}

async function fetchTopClients(year: number, routeId: number | null): Promise<TopClientData[]> {
  const params = new URLSearchParams({ limit: '8', year: String(year) })
  if (routeId !== null) params.append('route_id', String(routeId))
  const res = await apiClient.get<TopClientsResponse>(
    `/orders/analytics/top-clients?${params}`
  )
  return res.clients ?? []
}

function formatCurrency(value: number) {
  if (value >= 1000) return `Q${(value / 1000).toFixed(1)}K`
  return `Q${value.toFixed(0)}`
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d: TopClientData = payload[0].payload
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg text-sm space-y-1">
      <p className="font-medium">{d.client_name}</p>
      <p className="text-muted-foreground">
        Total:{' '}
        <span className="font-medium text-foreground">
          Q{d.total_amount.toLocaleString('es-GT', { maximumFractionDigits: 2 })}
        </span>
      </p>
      <p className="text-muted-foreground">
        Pedidos: <span className="font-medium text-foreground">{d.order_count}</span>
      </p>
      <p className="text-muted-foreground">
        Promedio:{' '}
        <span className="font-medium text-foreground">
          Q{d.avg_order_value.toLocaleString('es-GT', { maximumFractionDigits: 0 })}
        </span>
      </p>
    </div>
  )
}

// Truncate long names for the axis
function shortName(name: string, max = 14) {
  return name.length > max ? name.slice(0, max) + '…' : name
}

interface Props {
  routeId: number | null
}

export function TopClients({ routeId }: Props) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['dashboard-top-clients', selectedYear, routeId],
    queryFn: () => fetchTopClients(selectedYear, routeId),
    staleTime: 60 * 1000,
  })

  const chartData = clients.map((c) => ({
    ...c,
    name: shortName(c.client_name),
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Top Clientes</h2>
          <p className="text-sm text-muted-foreground">Por ingresos generados</p>
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
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-24 shrink-0" />
              <Skeleton className="h-6 rounded" style={{ width: `${40 + i * 8}%` }} />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Sin datos de clientes para {selectedYear}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="total_amount" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={`hsl(var(--primary) / ${1 - index * 0.1})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
