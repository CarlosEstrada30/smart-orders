import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/services/api/client'
import { TomorrowCards } from './components/tomorrow-cards'
import { ProductionTable } from './components/production-table'
import { RouteBreakdownChart } from './components/route-breakdown'
import type { ForecastResponse, ProductForecast } from './types'

interface Route {
  id: number
  name: string
  is_active: boolean
}

async function fetchRoutes(): Promise<Route[]> {
  return apiClient.get<Route[]>('/routes/?active_only=true')
}

async function fetchForecast(routeId: number | null): Promise<ForecastResponse> {
  const params = new URLSearchParams({ days_ahead: '3', history_days: '90' })
  if (routeId !== null) params.append('route_id', String(routeId))
  return apiClient.get<ForecastResponse>(`/orders/analytics/production-forecast?${params}`)
}

function parseLocalDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatTomorrowLabel(iso: string) {
  if (!iso) return 'mañana'
  return parseLocalDate(iso).toLocaleDateString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const ALL_ROUTES = 'all'

export function ForecastPage() {
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductForecast | null>(null)

  const { data: routes = [] } = useQuery({
    queryKey: ['routes-list'],
    queryFn: fetchRoutes,
    staleTime: 10 * 60 * 1000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['production-forecast', selectedRouteId],
    queryFn: () => fetchForecast(selectedRouteId),
    staleTime: 5 * 60 * 1000,
  })

  const products = data?.products ?? []
  const forecastDates = products[0]?.forecast.map((f) => f.date) ?? []
  const tomorrowDate = forecastDates[0] ?? ''
  const activeProduct = selectedProduct ?? products[0] ?? null

  const selectedRouteName = selectedRouteId
    ? routes.find((r) => r.id === selectedRouteId)?.name ?? 'Ruta seleccionada'
    : null

  // Summary: count active products tomorrow and total units
  const totalTomorrow = data?.total_recommended_tomorrow ?? 0
  const activeProductCount = products.filter(
    (p) => p.forecast[0] && !p.forecast[0].is_no_delivery_day
  ).length

  function handleRouteChange(value: string) {
    setSelectedProduct(null)
    setSelectedRouteId(value === ALL_ROUTES ? null : Number(value))
  }

  return (
    <Main>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plan de Producción</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedRouteName
              ? `Producción estimada para ${selectedRouteName}`
              : 'Estimado de unidades a producir por producto'}
          </p>
        </div>

        <Select
          value={selectedRouteId === null ? ALL_ROUTES : String(selectedRouteId)}
          onValueChange={handleRouteChange}
        >
          <SelectTrigger className="w-[200px] shrink-0">
            <SelectValue placeholder="Todas las rutas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROUTES}>Todas las rutas</SelectItem>
            {routes.map((route) => (
              <SelectItem key={route.id} value={String(route.id)}>
                {route.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {/* Summary banner */}
        {!isLoading && tomorrowDate && (
          <div className="rounded-lg border bg-muted/30 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Para{' '}
              <span className="font-medium text-foreground">
                {formatTomorrowLabel(tomorrowDate)}
              </span>
              {selectedRouteName ? ` · ${selectedRouteName}` : ''}
            </p>
            <p className="text-2xl font-bold mt-0.5">
              ~{totalTomorrow.toLocaleString('es-GT')} unidades
              <span className="text-sm font-normal text-muted-foreground ml-2">
                en {activeProductCount} producto{activeProductCount !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
        )}

        {/* Tomorrow cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              ¿Cuánto producir mañana?
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-72 text-xs leading-relaxed">
                  <p className="font-semibold mb-1">¿Cómo se calcula este número?</p>
                  <p>Revisamos cuánto se vendió cada día de la semana en los últimos 90 días, dándole más peso a las semanas más recientes.</p>
                  <p className="mt-1">Si en las últimas 2 semanas se vendió más que antes, el número sube. Si bajó, baja.</p>
                  <p className="mt-1">Siempre se agrega un <span className="font-medium">10% extra</span> para no quedarse corto y el resultado se redondea hacia arriba.</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              {selectedRouteName
                ? `Estimado para ${selectedRouteName} — haz clic en un producto para ver el desglose`
                : 'Haz clic en un producto para ver la distribución por ruta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-lg border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <TomorrowCards
                products={products}
                tomorrowDate={tomorrowDate}
                onSelectProduct={setSelectedProduct}
                selectedProductId={activeProduct?.product_id ?? null}
              />
            )}
          </CardContent>
        </Card>

        {/* Route breakdown — only when viewing all routes and a product is selected */}
        {!selectedRouteId && activeProduct && forecastDates.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                ¿Para quién producir? — {activeProduct.product_name}
              </CardTitle>
              <CardDescription>
                Distribución estimada por ruta de entrega ·{' '}
                {activeProduct.history_days_available} días de historial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RouteBreakdownChart
                product={activeProduct}
                targetDate={forecastDates[0]}
              />
            </CardContent>
          </Card>
        )}

        {/* 3-day table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximos 3 días</CardTitle>
            <CardDescription>
              Unidades recomendadas a producir por día · incluye 10% de margen de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductionTable
              products={products}
              forecastDates={forecastDates}
              isLoading={isLoading}
              onSelectProduct={setSelectedProduct}
              selectedProductId={activeProduct?.product_id ?? null}
            />
          </CardContent>
        </Card>

        {/* Route confidence note when filtered */}
        {selectedRouteId && activeProduct && (
          <p className="text-xs text-muted-foreground px-1">
            Basado en {activeProduct.history_days_available} días de historial para esta ruta.
            {activeProduct.confidence !== 'alta' && (
              <span className={activeProduct.confidence === 'media' ? 'text-yellow-600' : 'text-red-500'}>
                {' '}Los datos son {activeProduct.confidence === 'media' ? 'parciales — usar con precaución' : 'insuficientes para un estimado confiable'}.
              </span>
            )}
          </p>
        )}
      </div>
    </Main>
  )
}
