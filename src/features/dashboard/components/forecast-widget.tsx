import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { Skeleton } from '@/components/ui/skeleton'
import type { ForecastResponse } from '@/features/forecast/types'

async function fetchForecastSummary(routeId: number | null): Promise<ForecastResponse> {
  const params = new URLSearchParams({ days_ahead: '1', history_days: '90' })
  if (routeId !== null) params.append('route_id', String(routeId))
  return apiClient.get<ForecastResponse>(`/orders/analytics/production-forecast?${params}`)
}

interface Props {
  routeId: number | null
}

export function ForecastWidget({ routeId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['forecast-widget', routeId],
    queryFn: () => fetchForecastSummary(routeId),
    staleTime: 5 * 60 * 1000,
  })

  const products = data?.products ?? []
  const tomorrow = products[0]?.forecast[0]?.date ?? ''

  function formatDate(iso: string) {
    if (!iso) return 'Mañana'
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('es-GT', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Producción Estimada</h2>
          <p className="text-sm text-muted-foreground">{formatDate(tomorrow)}</p>
        </div>
        <Link
          to="/forecast"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Ver completo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-3 rounded flex-1" />
              <Skeleton className="h-4 w-10 shrink-0" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Sin datos suficientes para el forecast
        </p>
      ) : (
        <div className="space-y-2">
          {products.slice(0, 5).map((product) => {
            const predicted = product.forecast[0]?.predicted ?? 0
            const maxPredicted = Math.max(...products.slice(0, 5).map(
              (p) => p.forecast[0]?.predicted ?? 0
            ))
            const pct = maxPredicted > 0 ? (predicted / maxPredicted) * 100 : 0

            return (
              <div key={product.product_id} className="flex items-center gap-3">
                <span className="text-sm w-36 truncate shrink-0">{product.product_name}</span>
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-medium tabular-nums w-10 text-right shrink-0">
                  {predicted.toLocaleString('es-GT', { maximumFractionDigits: 0 })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
