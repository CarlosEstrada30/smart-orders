import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/components/layout/main'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { Users, Package, ShoppingCart, TrendingUp, RefreshCw, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { useDashboard } from '@/hooks/use-dashboard'
import { Badge } from '@/components/ui/badge'

export function Dashboard() {
  const { 
    metrics, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshDashboard,
    formatCurrency,
    formatPercentage,
    formatNumber,
    getRefreshIntervalText
  } = useDashboard()
  
  // Calcular métricas derivadas
  const todayOrdersCount = metrics?.orders.todayOrders || 0
  const deliveryRate = metrics?.orders.totalOrders ? 
    ((metrics.orders.deliveredOrders / metrics.orders.totalOrders) * 100) : 0

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )

  if (error) {
    return (
      <Main>
        <PermissionGuard 
          reportPermission="can_view"
          fallback={
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
                <p className="text-muted-foreground">No tienes permisos para ver reportes y dashboards.</p>
              </div>
            </div>
          }
        >
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Error cargando dashboard</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshDashboard}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </PermissionGuard>
      </Main>
    )
  }

  return (
    <Main>
      <PermissionGuard 
        reportPermission="can_view"
        fallback={
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">No tienes permisos para ver reportes y dashboards.</p>
            </div>
          </div>
        }
      >
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground">
                Última actualización: {lastUpdated.toLocaleTimeString()} • Auto-refresh cada {getRefreshIntervalText()}
              </p>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshDashboard}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button disabled>Generar Reporte</Button>
          </div>
        </div>
      
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Resumen</TabsTrigger>
              <TabsTrigger value='analytics' disabled>
                Análisis
              </TabsTrigger>
              <TabsTrigger value='reports' disabled>
                Reportes
              </TabsTrigger>
              <TabsTrigger value='notifications' disabled>
                Notificaciones
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value='overview' className='space-y-4'>
            {isLoading && !metrics ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Métricas principales */}
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  {/* Ventas del Mes */}
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Ingresos del Mes
                      </CardTitle>
                      <TrendingUp className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {metrics ? formatCurrency(metrics.financial.totalRevenue) : 'Q0.00'}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        órdenes entregadas del mes actual
                      </p>
                      {metrics && metrics.financial.monthlyGrowth !== 0 && (
                        <p className='text-muted-foreground text-xs mt-1'>
                          {formatPercentage(metrics.financial.monthlyGrowth)} estimado
                        </p>
                      )}
                      {metrics && metrics.financial.currentMonthDelivered > 0 && (
                        <Badge variant="default" className="mt-2 text-xs">
                          {metrics.financial.currentMonthDelivered} órdenes entregadas este mes
                        </Badge>
                      )}
                      {metrics && metrics.financial.currentMonthDelivered === 0 && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Sin entregas este mes
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actividad de Hoy */}
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Actividad de Hoy
                      </CardTitle>
                      <Clock className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {metrics ? formatNumber(todayOrdersCount) : '0'}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        pedidos creados hoy
                      </p>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">Pedidos totales</span>
                          </div>
                          <span className="font-medium">
                            {metrics ? formatNumber(metrics.orders.totalOrders) : '0'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Entregados</span>
                          </div>
                          <span className="font-medium">
                            {metrics ? formatNumber(metrics.orders.deliveredOrders) : '0'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">Tasa de entrega</span>
                          </div>
                          <span className="font-medium">
                            {deliveryRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      {metrics && metrics.orders.pendingOrders > 0 && (
                        <Badge variant="secondary" className="text-xs mt-3">
                          {metrics.orders.pendingOrders} pendientes
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Inventario */}
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Entradas de Inventario
                      </CardTitle>
                      <Package className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {metrics ? formatNumber(metrics.inventory.totalEntries) : '0'}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        {metrics && `${metrics.inventory.completedToday} completadas hoy`}
                      </p>
                      {metrics && metrics.inventory.lowStockCount > 0 && (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {metrics.inventory.lowStockCount} productos con stock bajo
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Valor Promedio */}
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Valor Promedio
                      </CardTitle>
                      <Users className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {metrics ? formatCurrency(metrics.orders.averageOrderValue) : 'Q0.00'}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        Por pedido
                      </p>
                      {metrics && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {formatCurrency(metrics.financial.pendingAmount)} pendiente
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos y actividad reciente */}
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
                  <Card className='col-span-4'>
                    <CardHeader>
                      <CardTitle>Resumen de Ventas</CardTitle>
                      <CardDescription>
                        Evolución mensual de ingresos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='pl-2'>
                      <Overview />
                    </CardContent>
                  </Card>
                  
                  <Card className='col-span-3'>
                    <CardHeader>
                      <CardTitle>Pedidos Recientes</CardTitle>
                      <CardDescription>
                        Los últimos pedidos realizados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales />
                    </CardContent>
                  </Card>
                </div>

                {/* Panel de Stock Bajo */}
                {metrics && metrics.inventory.lowStockProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Productos con Stock Bajo
                      </CardTitle>
                      <CardDescription>
                        Productos que requieren reposición inmediata
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {metrics.inventory.lowStockProducts.slice(0, 6).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sku}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-destructive">
                                {product.stock} unidades
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(product.price)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </PermissionGuard>
    </Main>
  )
}
