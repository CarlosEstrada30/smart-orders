import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, TrendingUp, Package } from 'lucide-react'
import { ProductionDataTable } from '@/features/production-dashboard/components/production-data-table'
import { useProductionDashboard } from './hooks/use-production-dashboard'
import { DatePicker } from '@/components/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ProductionDashboard() {
  const {
    productionData,
    availableRoutes,
    loading,
    error,
    selectedRoute,
    selectedDate,
    setSelectedRoute,
    setSelectedDate,
    refetchData
  } = useProductionDashboard()

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDateString = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(formatDate(date))
    }
  }

  const handleRouteChange = (routeId: string) => {
    setSelectedRoute(parseInt(routeId))
  }

  if (loading && !productionData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos de producción: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Producción</h1>
          <p className="text-muted-foreground">
            Gestiona y monitorea la producción de productos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refetchData} variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Selecciona la ruta y fecha para ver los datos de producción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Ruta</label>
              <Select value={selectedRoute?.toString()} onValueChange={handleRouteChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ruta" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoutes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Fecha</label>
              <DatePicker
                selected={selectedDate ? parseDateString(selectedDate) : new Date()}
                onSelect={handleDateChange}
                placeholder="Selecciona una fecha"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Data Table */}
      {productionData?.products && (
        <ProductionDataTable 
          products={productionData.products}
          loading={loading}
        />
      )}

      {/* No Data State */}
      {!loading && !productionData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay datos de producción</h3>
            <p className="text-muted-foreground text-center">
              Selecciona una ruta y fecha para ver los datos de producción disponibles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
