import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Main } from '@/components/layout/main'
import { PermissionGuard } from '@/components/auth/permission-guard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/services/api/client'
import { SalesBarChart } from './components/sales-bar-chart'
import { RecentOrders } from './components/recent-orders'
import { TopClients } from './components/top-clients'
import { OrdersByRoute } from './components/orders-by-route'
import { ForecastWidget } from './components/forecast-widget'

interface Route {
  id: number
  name: string
}

async function fetchRoutes(): Promise<Route[]> {
  return apiClient.get<Route[]>('/routes/?active_only=true')
}

const ALL_ROUTES = 'all'

export function Dashboard() {
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null)

  const { data: routes = [] } = useQuery({
    queryKey: ['routes-list'],
    queryFn: fetchRoutes,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <Main>
      <PermissionGuard
        reportPermission="can_view"
        fallback={
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                No tienes permisos para ver reportes y dashboards.
              </p>
            </div>
          </div>
        }
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

          <Select
            value={selectedRouteId === null ? ALL_ROUTES : String(selectedRouteId)}
            onValueChange={(v) => setSelectedRouteId(v === ALL_ROUTES ? null : Number(v))}
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

        <div className="space-y-4">
          {/* Fila 1: Resumen de ventas + Pedidos recientes */}
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardContent className="pt-6">
                <SalesBarChart routeId={selectedRouteId} />
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
                <CardDescription>Los últimos pedidos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>

          {/* Fila 2: Top clientes + Pedidos por ruta */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <TopClients routeId={selectedRouteId} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <OrdersByRoute />
              </CardContent>
            </Card>
          </div>

          {/* Fila 3: Widget plan de producción */}
          <Card>
            <CardContent className="pt-6">
              <ForecastWidget routeId={selectedRouteId} />
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </Main>
  )
}
