import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { dashboardService } from '@/services/dashboard'
import type { SalesChartData } from '@/services/dashboard/types'
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

const EMPTY_MONTHS: SalesChartData[] = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
].map((month) => ({ month, sales: 0, orders: 0, revenue: 0 }))

function CustomTooltip({ active, payload, label, year }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  const hasData = data.orders > 0 || data.sales > 0

  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium mb-2">{label} {year}</p>
      {hasData ? (
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Ventas:{' '}
            <span className="font-medium text-foreground">
              Q{data.sales.toLocaleString('es-GT', { maximumFractionDigits: 2 })}
            </span>
          </p>
          <p className="text-muted-foreground">
            Órdenes:{' '}
            <span className="font-medium text-foreground">{data.orders}</span>
          </p>
          {data.orders > 0 && (
            <p className="text-muted-foreground">
              Promedio:{' '}
              <span className="font-medium text-foreground">
                Q{(data.sales / data.orders).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
              </span>
            </p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Sin datos para este mes</p>
      )}
    </div>
  )
}

interface Props {
  routeId: number | null
}

export function SalesBarChart({ routeId }: Props) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)

  const { data: chartData = EMPTY_MONTHS, isLoading } = useQuery({
    queryKey: ['dashboard-sales-chart', selectedYear, routeId],
    queryFn: () => dashboardService.getSalesChartData({ year: selectedYear, route_id: routeId ?? undefined }),
    staleTime: 60 * 1000, // 1 minuto
  })

  const isEmpty = chartData.every((d) => d.sales === 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Resumen de Ventas</h2>
          <p className="text-sm text-muted-foreground">Órdenes entregadas por mes</p>
        </div>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="w-full h-[350px] flex items-end gap-2 px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded" style={{ height: `${30 + (i * 5) % 70}%` }} />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="w-full h-[350px] flex items-center justify-center">
          <div className="text-center space-y-1">
            <p className="text-muted-foreground">Sin datos de ventas para {selectedYear}</p>
            <p className="text-sm text-muted-foreground">
              Los datos aparecerán cuando haya órdenes entregadas
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `Q${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip year={selectedYear} />} />
            <Bar
              dataKey="sales"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
