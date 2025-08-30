import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useEffect, useState } from 'react'
import { dashboardService } from '@/services/dashboard'
import type { SalesChartData } from '@/services/dashboard/types'
import { Skeleton } from '@/components/ui/skeleton'

export function Overview() {
  const [chartData, setChartData] = useState<SalesChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true)
        const data = await dashboardService.getSalesChartData()
        setChartData(data)
      } catch (error) {
        console.error('Error cargando datos del gráfico:', error)
        // Si hay error, usar datos por defecto
        setChartData([
          { month: 'Ene', sales: 12000, orders: 25, revenue: 15000 },
          { month: 'Feb', sales: 18000, orders: 35, revenue: 22000 },
          { month: 'Mar', sales: 15000, orders: 28, revenue: 18000 },
          { month: 'Abr', sales: 22000, orders: 42, revenue: 28000 },
          { month: 'May', sales: 28000, orders: 55, revenue: 35000 },
          { month: 'Jun', sales: 32000, orders: 68, revenue: 42000 },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadChartData()
  }, [])

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label} 2024`}</p>
          <p className="text-sm text-muted-foreground">
            {`Ventas: Q${payload[0].value.toLocaleString()}`}
          </p>
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
          fontSize={12}
          tickLine={false}
          axisLine={false}
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
