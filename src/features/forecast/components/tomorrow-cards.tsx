import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { ProductForecast } from '../types'

interface Props {
  products: ProductForecast[]
  tomorrowDate: string
  onSelectProduct: (product: ProductForecast) => void
  selectedProductId: number | null
}

function TrendIcon({ direction, pct }: { direction: string; pct: number }) {
  const absPct = Math.abs(pct).toFixed(0)

  const tooltipText =
    direction === 'up'
      ? `En las últimas 2 semanas se vendió un ${absPct}% más que en las 2 semanas anteriores.`
      : direction === 'down'
      ? `En las últimas 2 semanas se vendió un ${absPct}% menos que en las 2 semanas anteriores.`
      : 'La demanda se mantiene similar a las semanas anteriores.'

  const label =
    direction === 'up' ? (
      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
        <TrendingUp className="h-3 w-3" />
        Subiendo +{absPct}%
      </span>
    ) : direction === 'down' ? (
      <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
        <TrendingDown className="h-3 w-3" />
        Bajando {pct.toFixed(0)}%
      </span>
    ) : (
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <Minus className="h-3 w-3" />
        Estable
      </span>
    )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{label}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-xs leading-relaxed">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}

function ConfidenceWarning({ confidence }: { confidence: string }) {
  if (confidence === 'alta') return null
  return (
    <span
      title={confidence === 'media' ? 'Basado en pocos datos — usar con precaución' : 'Datos insuficientes — estimado poco confiable'}
      className="ml-1 inline-flex items-center"
    >
      <AlertTriangle className={`h-3 w-3 ${confidence === 'media' ? 'text-yellow-500' : 'text-red-400'}`} />
    </span>
  )
}

export function TomorrowCards({ products, tomorrowDate, onSelectProduct, selectedProductId }: Props) {
  // Only show products that have delivery tomorrow (not no-delivery days)
  const activeProducts = products.filter(
    (p) => p.forecast[0] && !p.forecast[0].is_no_delivery_day
  )

  if (activeProducts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin pedidos estimados para mañana.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {activeProducts.map((product) => {
        const point = product.forecast[0]
        const isSelected = product.product_id === selectedProductId
        const lastWeek = point.last_week_actual

        return (
          <button
            key={product.product_id}
            onClick={() => onSelectProduct(product)}
            className={`text-left rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card'
            }`}
          >
            {/* Product name */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight mb-2 line-clamp-2 min-h-[2rem]">
              {product.product_name}
            </p>

            {/* Main number */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold tabular-nums leading-none">
                {point.recommended.toLocaleString('es-GT')}
              </span>
              <span className="text-sm text-muted-foreground">u</span>
              <ConfidenceWarning confidence={product.confidence} />
            </div>

            {/* Last week reference */}
            {lastWeek != null && lastWeek > 0 ? (
              <p className="text-xs text-muted-foreground mb-2">
                Semana pasada: {Math.round(lastWeek).toLocaleString('es-GT')}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-2 invisible">—</p>
            )}

            {/* Trend */}
            <TrendIcon direction={product.trend_direction} pct={product.trend_percentage} />
          </button>
        )
      })}
    </div>
  )
}
