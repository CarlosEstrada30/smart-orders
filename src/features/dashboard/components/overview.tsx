import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useEffect, useState } from 'react'
import { dashboardService } from '@/services/dashboard'
import type { SalesChartData } from '@/services/dashboard/types'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Componente Overview - Gráfica de resumen de ventas mensuales
 * Usa el endpoint /orders/analytics/monthly-summary para obtener datos reales
 * de órdenes entregadas por mes
 */

interface OverviewProps {
  year?: number // Filtro opcional por año
}

export function Overview({ year }: OverviewProps = {}) {
  const [chartData, setChartData] = useState<SalesChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true)
        const data = await dashboardService.getSalesChartData(
          year ? { year } : undefined
        )
        setChartData(data)
      } catch (error) {
        console.error('Error cargando datos del gráfico:', error)
        // Si hay error, mantener arreglo vacío para mostrar estado sin datos
        setChartData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadChartData()
  }, [year]) // Recargar cuando cambie el año

  if (isLoading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="space-y-4 w-full">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    )
  }

  // Estado sin datos
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
          <p className="text-sm text-muted-foreground">Los datos aparecerán cuando tengas órdenes entregadas</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload // Acceso a todos los datos del punto
      const hasData = data.orders > 0 || data.sales > 0
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label} {new Date().getFullYear()}</p>
          {hasData ? (
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Ventas: <span className="font-medium text-foreground">Q{data.sales.toLocaleString()}</span>
              </p>
              <p className="text-muted-foreground">
                Órdenes: <span className="font-medium text-foreground">{data.orders}</span>
              </p>
              {data.orders > 0 && (
                <p className="text-muted-foreground">
                  Promedio: <span className="font-medium text-foreground">Q{(data.sales / data.orders).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm">
              <p className="text-muted-foreground">Sin datos para este mes</p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='month'
          stroke='#888888'
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={0}
          textAnchor="middle"
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Q${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey='sales'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
