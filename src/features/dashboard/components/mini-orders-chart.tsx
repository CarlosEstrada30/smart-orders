import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { StatusDistributionItem } from '@/services/dashboard/types'
import { orderStatuses } from '@/features/orders/data/data'

interface OrdersByStatus {
  pending: number
  confirmed: number
  in_progress: number
  shipped: number
  delivered: number
  cancelled: number
}

interface MiniOrdersChartProps {
  data: OrdersByStatus
  // Prop opcional para usar datos directos del endpoint
  statusData?: StatusDistributionItem[]
}

// Mapeo de colores exactos de la tabla de órdenes (Tailwind CSS a hex)
const TAILWIND_COLORS = {
  'text-yellow-600': '#d97706',   // Pendiente - Mismo amarillo de la tabla
  'text-blue-600': '#2563eb',     // Confirmado - Mismo azul de la tabla
  'text-orange-600': '#ea580c',   // En Proceso - Mismo naranja de la tabla  
  'text-purple-600': '#9333ea',   // Enviado - Mismo púrpura de la tabla
  'text-green-600': '#16a34a',    // Entregado - Mismo verde de la tabla
  'text-red-600': '#dc2626',      // Cancelado - Mismo rojo de la tabla
} as const

// Crear mapeo de colores usando los datos oficiales de la tabla
const STATUS_COLORS = Object.fromEntries(
  orderStatuses.map(status => [
    status.value,
    TAILWIND_COLORS[status.color as keyof typeof TAILWIND_COLORS] || '#6b7280'
  ])
) as Record<string, string>

// Crear mapeo de labels usando los datos oficiales
const createStatusLabels = () => {
  const labels: Record<string, string> = {}
  orderStatuses.forEach(status => {
    labels[status.value] = status.label
  })
  return labels
}

const STATUS_LABELS = createStatusLabels()

export function MiniOrdersChart({ data, statusData }: MiniOrdersChartProps) {
  // Transformar datos para la gráfica con colores definidos
  const chartData = statusData 
    ? statusData
        .filter(item => item.count > 0)
        .map(item => {
          const color = STATUS_COLORS[item.status] || '#6b7280'
          console.log(`Mapping ${item.status} -> ${color}`) // Debug específico por status
          return {
            name: item.status_name,
            value: item.count,
            status: item.status,
            fill: color,
            percentage: item.percentage,
          }
        })
    : Object.entries(data)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => {
          const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
          console.log(`Mapping ${status} -> ${color}`) // Debug específico por status
          return {
            name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
            value: count,
            status,
            fill: color,
          }
        })
        
  console.log('Final chartData:', chartData) // Debug: ver datos finales

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[120px] text-sm text-muted-foreground">
          Sin pedidos este mes
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.fill }}
            />
            <p className="text-sm font-medium">{data.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {data.value} pedido{data.value !== 1 ? 's' : ''}
            {data.percentage && (
              <span className="ml-1 font-medium text-foreground">({data.percentage.toFixed(1)}%)</span>
            )}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      {/* DEBUG: Mostrar colores que se están usando */}
      <div className="flex flex-wrap gap-1 mb-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs">{item.status}</span>
          </div>
        ))}
      </div>
      
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Componente de leyenda compacta
interface MiniLegendProps {
  data: OrdersByStatus
  // Prop opcional para usar datos directos del endpoint
  statusData?: StatusDistributionItem[]
}

export function MiniLegend({ data, statusData }: MiniLegendProps) {
  const legendData = statusData
    ? statusData
        .filter(item => item.count > 0)
        .map(item => ({
          label: item.status_name,
          count: item.count,
          fill: STATUS_COLORS[item.status] || '#64748b',
          percentage: item.percentage,
        }))
    : Object.entries(data)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          label: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
          count,
          fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#64748b',
        }))

  if (legendData.length === 0) return null

  return (
    <div className="space-y-1 mt-3">
      {legendData.slice(0, 4).map((item, index) => (
        <div key={item.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs font-medium text-foreground truncate">
              {item.count} {item.label}
            </span>
          </div>
          {'percentage' in item && item.percentage !== undefined && (
            <span className="text-xs text-muted-foreground font-medium ml-2">
              {item.percentage.toFixed(1)}%
            </span>
          )}
        </div>
      ))}
      {legendData.length > 4 && (
        <div className="text-xs text-muted-foreground text-center mt-1">
          +{legendData.length - 4} más
        </div>
      )}
    </div>
  )
}
