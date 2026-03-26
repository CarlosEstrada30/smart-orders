import { AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductForecast } from '../types'

interface Props {
  products: ProductForecast[]
  forecastDates: string[]
  isLoading: boolean
  onSelectProduct: (product: ProductForecast) => void
  selectedProductId: number | null
}

function parseLocalDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateHeader(iso: string) {
  return parseLocalDate(iso).toLocaleDateString('es-GT', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function dayLabel(index: number) {
  if (index === 0) return 'Mañana'
  if (index === 1) return 'Pasado mañana'
  return ''
}

function ConfidenceDot({ confidence }: { confidence: string }) {
  if (confidence === 'alta') return null
  return (
    <AlertTriangle
      className={`inline h-3 w-3 ml-1 align-middle ${
        confidence === 'media' ? 'text-yellow-500' : 'text-red-400'
      }`}
      title={
        confidence === 'media'
          ? 'Pocos datos — usar con precaución'
          : 'Datos insuficientes'
      }
    />
  )
}

export function ProductionTable({
  products,
  forecastDates,
  isLoading,
  onSelectProduct,
  selectedProductId,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-muted-foreground">
          Sin historial de pedidos suficiente para generar un forecast.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-left px-4 py-3 font-medium">Producto</th>
            {forecastDates.map((d, i) => (
              <th key={d} className="text-right px-4 py-3 font-medium whitespace-nowrap">
                <span className="block">{dayLabel(i) || formatDateHeader(d)}</span>
                <span className="block text-xs text-muted-foreground font-normal">
                  {i < 2 ? formatDateHeader(d) : ''}
                </span>
              </th>
            ))}
            <th className="text-center px-4 py-3 font-medium">Tendencia</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isSelected = product.product_id === selectedProductId
            return (
              <tr
                key={product.product_id}
                onClick={() => onSelectProduct(product)}
                className={`border-b cursor-pointer transition-colors hover:bg-muted/40 ${
                  isSelected ? 'bg-muted/60' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  {product.product_name}
                  <ConfidenceDot confidence={product.confidence} />
                </td>

                {product.forecast.map((point) => (
                  <td key={point.date} className="px-4 py-3 text-right">
                    {point.is_no_delivery_day ? (
                      <span
                        className="text-muted-foreground/50 text-xs"
                        title="Sin pedidos este día habitualmente"
                      >
                        —
                      </span>
                    ) : (
                      <span className="font-semibold tabular-nums text-base">
                        {point.recommended.toLocaleString('es-GT')}
                      </span>
                    )}
                  </td>
                ))}

                <td className="px-4 py-3 text-center">
                  {product.trend_direction === 'up' && (
                    <span className="text-green-600 text-sm font-medium">
                      ↑ +{product.trend_percentage.toFixed(0)}%
                    </span>
                  )}
                  {product.trend_direction === 'down' && (
                    <span className="text-red-500 text-sm font-medium">
                      ↓ {product.trend_percentage.toFixed(0)}%
                    </span>
                  )}
                  {product.trend_direction === 'stable' && (
                    <span className="text-muted-foreground text-sm">→ Estable</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
