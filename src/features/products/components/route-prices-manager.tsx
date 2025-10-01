import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PriceInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Save, Loader2, Route as RouteIcon, DollarSign, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { productRoutePricesService, type ProductRoutePrice } from '@/services/product-route-prices'
import { routesService, type Route } from '@/services'
import { type Product } from '@/services/products'
import { ApiError } from '@/services/api/config'

interface RoutePricesManagerProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

type ViewMode = 'list' | 'add' | 'edit'

export function RoutePricesManager({ product, isOpen, onClose }: RoutePricesManagerProps) {
  // Guard clause MUST be before any hooks to avoid hook order violations
  if (!product) return null
  
  const [routePrices, setRoutePrices] = useState<ProductRoutePrice[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para navegación de vistas
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  
  // Estados para formularios
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [formPrice, setFormPrice] = useState(0)
  const [editingRoutePrice, setEditingRoutePrice] = useState<ProductRoutePrice | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Estados para eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRoutePrice, setDeletingRoutePrice] = useState<ProductRoutePrice | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
      setCurrentView('list') // Reset to list view when modal opens
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [routePricesData, routesData] = await Promise.all([
        productRoutePricesService.getProductRoutePrices(product.id),
        routesService.getRoutes({ active_only: true })
      ])
      
      setRoutePrices(routePricesData)
      setRoutes(routesData)
    } catch (err) {
      console.error('Error loading data:', err)
      const errorMessage = err instanceof ApiError ? err.detail : 'Error al cargar los datos'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrice = () => {
    setSelectedRouteId('')
    setFormPrice(product.price || 0)
    setFormError(null)
    setCurrentView('add')
  }

  const handleEditPrice = (routePrice: ProductRoutePrice) => {
    setEditingRoutePrice(routePrice)
    setSelectedRouteId(routePrice.route_id.toString())
    setFormPrice(routePrice.price)
    setFormError(null)
    setCurrentView('edit')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setFormError(null)
    setSelectedRouteId('')
    setFormPrice(0)
    setEditingRoutePrice(null)
  }

  const handleSubmitForm = async () => {
    if (!selectedRouteId || formPrice <= 0) {
      setFormError('Selecciona una ruta y define un precio mayor a 0')
      return
    }

    const routeId = parseInt(selectedRouteId)

    // Para agregar: verificar que la ruta no tenga ya un precio asignado
    if (currentView === 'add') {
      const existingPrice = routePrices.find(rp => rp.route_id === routeId)
      if (existingPrice) {
        setFormError('Esta ruta ya tiene un precio asignado')
        return
      }
    }

    try {
      setFormSubmitting(true)
      setFormError(null)

      if (currentView === 'add') {
        await productRoutePricesService.createProductRoutePrice({
          product_id: product.id,
          route_id: routeId,
          price: formPrice
        })
        toast.success('Precio por ruta creado exitosamente')
      } else if (currentView === 'edit' && editingRoutePrice) {
        await productRoutePricesService.updateProductRoutePrice(
          editingRoutePrice.id,
          { price: formPrice }
        )
        toast.success('Precio actualizado exitosamente')
      }

      // Volver a la lista y recargar datos
      setCurrentView('list')
      loadData()
    } catch (err) {
      console.error('Error en formulario:', err)
      const errorMessage = err instanceof ApiError ? err.detail : 
        currentView === 'add' ? 'Error al crear el precio por ruta' : 'Error al actualizar el precio'
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeletePrice = (routePrice: ProductRoutePrice) => {
    setDeletingRoutePrice(routePrice)
    setDeleteDialogOpen(true)
  }

  const confirmDeletePrice = async () => {
    if (!deletingRoutePrice) return

    try {
      setDeleting(true)
      
      await productRoutePricesService.deleteProductRoutePrice(
        deletingRoutePrice.product_id,
        deletingRoutePrice.route_id
      )

      toast.success('Precio por ruta eliminado exitosamente')
      setDeleteDialogOpen(false)
      setDeletingRoutePrice(null)
      
      // Recargar datos
      loadData()
    } catch (err) {
      console.error('Error eliminando precio por ruta:', err)
      const errorMessage = err instanceof ApiError ? err.detail : 'Error al eliminar el precio por ruta'
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  // Preparar opciones para el combobox de rutas (solo rutas sin precio asignado)
  const availableRouteOptions = routes
    .filter(route => !routePrices.some(rp => rp.route_id === route.id))
    .map(route => ({
      value: route.id.toString(),
      label: route.name,
      disabled: !route.is_active
    }))

  // Renderizar vista de formulario (agregar/editar)
  const renderFormView = () => (
    <div className="space-y-6">
      {/* Navegación de breadcrumb */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToList}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </Button>
        <div className="h-4 w-px bg-border" />
        <h3 className="font-semibold text-foreground">
          {currentView === 'add' ? 'Agregar Precio por Ruta' : 'Editar Precio por Ruta'}
        </h3>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentView === 'add' ? 'Nuevo Precio' : 'Modificar Precio'}
          </CardTitle>
          <CardDescription>
            {currentView === 'add' 
              ? 'Define un precio específico para una ruta de entrega'
              : 'Modifica el precio específico para esta ruta'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="route">Ruta *</Label>
            {currentView === 'edit' ? (
              <Input
                value={editingRoutePrice?.route_name || routes.find(r => r.id === editingRoutePrice?.route_id)?.name || 'Ruta desconocida'}
                disabled
                className="bg-muted"
              />
            ) : (
              <Combobox
                options={availableRouteOptions}
                value={selectedRouteId}
                onValueChange={setSelectedRouteId}
                placeholder="Selecciona una ruta"
                searchPlaceholder="Buscar ruta..."
                emptyMessage="No hay rutas disponibles para agregar precios."
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Precio *</Label>
            <PriceInput
              id="price"
              placeholder="0.00"
              value={formPrice}
              onValueChange={setFormPrice}
              required
            />
            <p className="text-xs text-muted-foreground">
              Precio por defecto del producto: Q{product.price.toFixed(2)}
            </p>
          </div>
          
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{formError}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Renderizar vista de lista principal
  const renderListView = () => (
    <div className="space-y-6">
      {/* Precio por defecto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Precio por Defecto</CardTitle>
          <CardDescription>
            Este precio se usa cuando no hay un precio específico para la ruta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
              Q{product.price.toFixed(2)}
            </Badge>
            <span className="text-muted-foreground">para rutas sin precio específico</span>
          </div>
        </CardContent>
      </Card>

      {/* Precios por ruta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Precios por Ruta</CardTitle>
            <CardDescription>
              {routePrices.length} {routePrices.length === 1 ? 'ruta con precio' : 'rutas con precios'} específico{routePrices.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button 
            onClick={handleAddPrice} 
            disabled={availableRouteOptions.length === 0}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Precio
          </Button>
        </CardHeader>
        <CardContent>
          {routePrices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Diferencia</TableHead>
                  <TableHead className="w-[100px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routePrices.map((routePrice) => {
                  const priceDifference = routePrice.price - product.price
                  const route = routes.find(r => r.id === routePrice.route_id)
                  
                  return (
                    <TableRow key={routePrice.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RouteIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {routePrice.route_name || route?.name || `Ruta #${routePrice.route_id}`}
                          </span>
                          {route && !route.is_active && (
                            <Badge variant="secondary" className="text-xs">
                              Inactiva
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          Q{routePrice.price.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {priceDifference !== 0 ? (
                          <Badge 
                            variant={priceDifference > 0 ? "default" : "secondary"} 
                            className={
                              priceDifference > 0 
                                ? "text-green-700 bg-green-50 border-green-200" 
                                : "text-red-700 bg-red-50 border-red-200"
                            }
                          >
                            {priceDifference > 0 ? '+' : ''}Q{priceDifference.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Sin diferencia
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPrice(routePrice)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrice(routePrice)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <RouteIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay precios específicos por ruta</p>
              <p className="text-sm">
                Se usará el precio por defecto de Q{product.price.toFixed(2)} para todas las rutas
              </p>
              {availableRouteOptions.length > 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={handleAddPrice}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer precio por ruta
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Determinar el título del modal según la vista
  const getModalTitle = () => {
    switch (currentView) {
      case 'add':
        return 'Agregar Precio por Ruta'
      case 'edit':
        return 'Editar Precio por Ruta'
      default:
        return 'Gestión de Precios por Ruta'
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {getModalTitle()}
            </DialogTitle>
            <DialogDescription>
              Producto: <span className="font-semibold">{product.name}</span> • 
              Precio base: <span className="font-semibold">Q{product.price.toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadData} variant="outline">
                Reintentar
              </Button>
            </div>
          ) : currentView === 'list' ? (
            renderListView()
          ) : (
            renderFormView()
          )}

          <DialogFooter className="flex justify-between">
            {currentView !== 'list' ? (
              <>
                <Button variant="outline" onClick={handleBackToList}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmitForm} disabled={formSubmitting}>
                  {formSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {currentView === 'add' ? 'Creando...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {currentView === 'add' ? 'Crear Precio' : 'Guardar Cambios'}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose} className="ml-auto">
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar - Este es el ÚNICO modal adicional necesario */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar precio por ruta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el precio específico para la ruta{' '}
              <span className="font-semibold">
                {deletingRoutePrice?.route_name || routes.find(r => r.id === deletingRoutePrice?.route_id)?.name}
              </span>. 
              El producto usará el precio por defecto de Q{product.price.toFixed(2)} para esta ruta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePrice}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}