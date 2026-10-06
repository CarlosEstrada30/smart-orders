import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
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
import { PermissionGuard } from '@/components/auth/permission-guard'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ForecastWidget } from './components/forecast-widget'
import { KpiRow } from './components/kpi-row'
import { OrdersByRoute } from './components/orders-by-route'
import { RecentOrders } from './components/recent-orders'
import { SalesBarChart } from './components/sales-bar-chart'
import { TopClients } from './components/top-clients'

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
        reportPermission='can_view'
        fallback={
          <div className='flex h-[400px] items-center justify-center'>
            <div className='text-center'>
              <h2 className='mb-2 text-2xl font-semibold'>Acceso Denegado</h2>
              <p className='text-muted-foreground'>
                No tienes permisos para ver reportes y dashboards.
              </p>
            </div>
          </div>
        }
      >
        <PageHeader
          title='Dashboard'
          description='Ventas, pedidos y producción de tu distribuidora.'
          actions={
            <Select
              value={
                selectedRouteId === null ? ALL_ROUTES : String(selectedRouteId)
              }
              onValueChange={(v) =>
                setSelectedRouteId(v === ALL_ROUTES ? null : Number(v))
              }
            >
              <SelectTrigger
                className='bg-card w-[200px] shrink-0'
                aria-label='Filtrar por ruta'
              >
                <SelectValue placeholder='Todas las rutas' />
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
          }
        />

        <div className='space-y-4'>
          <KpiRow routeId={selectedRouteId} />

          {/* Fila 1: Resumen de ventas + Pedidos recientes */}
          <div className='grid gap-4 lg:grid-cols-7'>
            <Card className='lg:col-span-4'>
              <CardContent>
                <SalesBarChart routeId={selectedRouteId} />
              </CardContent>
            </Card>

            <Card className='lg:col-span-3'>
              <CardHeader>
                <CardTitle className='font-display text-lg'>
                  Pedidos recientes
                </CardTitle>
                <CardDescription>
                  Los últimos cinco, de todas las rutas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>

          {/* Fila 2: Top clientes + Pedidos por ruta */}
          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardContent>
                <TopClients routeId={selectedRouteId} />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <OrdersByRoute />
              </CardContent>
            </Card>
          </div>

          {/* Fila 3: Widget plan de producción */}
          <Card>
            <CardContent>
              <ForecastWidget routeId={selectedRouteId} />
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </Main>
  )
}
