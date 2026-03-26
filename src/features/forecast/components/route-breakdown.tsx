import type { ProductForecast } from '../types'

interface Props {
  product: ProductForecast
  targetDate: string
}

function parseLocalDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(iso: string) {
  return parseLocalDate(iso).toLocaleDateString('es-GT', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function RouteBreakdownChart({ product, targetDate }: Props) {
  const routes = product.by_route
  const total = routes.reduce((sum, r) => sum + r.recommended, 0)

  if (routes.length === 0) {
    return (
      <div className="flex items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">Sin datos de rutas para este producto.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Distribución estimada para {formatDate(targetDate)} · {routes.length} ruta{routes.length !== 1 ? 's' : ''} activa{routes.length !== 1 ? 's' : ''}
      </p>

      {routes.map((route) => {
        const pct = total > 0 ? (route.recommended / total) * 100 : 0
        return (
          <div key={route.route_name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{route.route_name}</span>
              <span className="tabular-nums font-semibold">
                {route.recommended.toLocaleString('es-GT')} unidades
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  ({pct.toFixed(0)}%)
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between text-sm font-semibold border-t pt-3 mt-1">
        <span>Total a producir</span>
        <span>{total.toLocaleString('es-GT')} unidades</span>
      </div>
    </div>
  )
}
