import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuantityInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ordersService, type OrderItem } from '@/services/orders'
import { clientsService, type Client } from '@/services/clients'
import { productsService, type Product } from '@/services/products'
import { routesService, type Route } from '@/services'

interface OrderItemForm {
  product_id: number
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

export function NewOrderPage() {
  const navigate = useNavigate()
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stockError, setStockError] = useState<string | null>(null)

  // Estados para datos de la API
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(true)

  // Cargar clientes, productos y rutas al montar el componente
  useEffect(() => {
    loadClients()
    loadProducts()
    loadRoutes()
  }, [])

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const clientsData = await clientsService.getClients({ active_only: true })
      setClients(clientsData)
    } catch (err) {
      setError('Error al cargar los clientes')
    } finally {
      setLoadingClients(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const productsData = await productsService.getProducts({ active_only: true })
      setProducts(productsData)
    } catch (err) {
      setError('Error al cargar los productos')
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true)
      const routesData = await routesService.getRoutes({ active_only: true })
      setRoutes(routesData)
    } catch (err) {
      setError('Error al cargar las rutas')
    } finally {
      setLoadingRoutes(false)
    }
  }

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (!product) return

    // Verificar si el producto ya existe en la orden
    const existingItem = orderItems.find(item => item.product_id === product.id)
    const existingQuantity = existingItem ? existingItem.quantity : 0
    const totalQuantity = existingQuantity + quantity

    // Validar stock disponible
    if (totalQuantity > product.stock) {
      const availableStock = product.stock - existingQuantity
      if (availableStock <= 0) {
        setStockError(`El producto "${product.name}" ya no tiene stock disponible`)
      } else {
        setStockError(`Stock insuficiente. Solo quedan ${availableStock} unidades disponibles de "${product.name}"`)
      }
      return
    }

    // Si existe el producto, actualizar la cantidad; si no, agregar nuevo item
    if (existingItem) {
      const updatedItems = orderItems.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: totalQuantity, subtotal: product.price * totalQuantity }
          : item
      )
      setOrderItems(updatedItems)
    } else {
      const newItem: OrderItemForm = {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: quantity,
        subtotal: product.price * quantity
      }
      setOrderItems([...orderItems, newItem])
    }

    // Limpiar estados al agregar exitosamente
    setStockError(null)
    setSelectedProduct('')
    setQuantity(1)
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
    // Limpiar error de stock al remover item
    setStockError(null)
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return

    const item = orderItems[index]
    const product = products.find(p => p.id === item.product_id)
    
    if (!product) return

    // Validar stock disponible
    if (newQuantity > product.stock) {
      setStockError(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles de "${product.name}"`)
      return
    }

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].subtotal = updatedItems[index].price * newQuantity
    setOrderItems(updatedItems)
    
    // Limpiar error de stock si la actualización es exitosa
    setStockError(null)
  }

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClient || orderItems.length === 0) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Convertir los items del formulario al formato de la API
      const apiItems: OrderItem[] = orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price
      }))

      const orderData = {
        client_id: parseInt(selectedClient),
        route_id: selectedRoute ? parseInt(selectedRoute) : undefined,
        notes: notes || undefined,
        items: apiItems
      }

      await ordersService.createOrder(orderData)
      
      // Redirigir a la lista de órdenes después de crear exitosamente
      navigate({ to: '/orders' })
    } catch (err) {
      setError('Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  // Preparar opciones para los comboboxes
  const clientOptions = clients.map(client => ({
    value: client.id.toString(),
    label: `${client.name}${client.email ? ` (${client.email})` : ''}`,
    disabled: !client.is_active
  }))

  const productOptions = products.map(product => ({
    value: product.id.toString(),
    label: `${product.name} - Q${product.price.toFixed(2)} (Stock: ${product.stock})`,
    disabled: product.stock <= 0 || !product.is_active
  }))

  const routeOptions = routes.map(route => ({
    value: route.id.toString(),
    label: route.name,
    disabled: !route.is_active
  }))

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nueva Orden</h1>
              <p className="text-muted-foreground">
                Crea una nueva orden
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Orden</CardTitle>
              <CardDescription>
                Selecciona el cliente y la ruta de entrega para esta orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Combobox
                    options={clientOptions}
                    value={selectedClient}
                    onValueChange={setSelectedClient}
                    placeholder="Selecciona un cliente"
                    searchPlaceholder="Buscar cliente por nombre o email..."
                    emptyMessage="No se encontraron clientes."
                    disabled={loadingClients}
                  />
                  {loadingClients && (
                    <p className="text-sm text-muted-foreground">Cargando clientes...</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route">Ruta de Entrega (Opcional)</Label>
                  <Combobox
                    options={routeOptions}
                    value={selectedRoute}
                    onValueChange={setSelectedRoute}
                    placeholder="Selecciona una ruta"
                    searchPlaceholder="Buscar ruta por nombre..."
                    emptyMessage="No se encontraron rutas."
                    disabled={loadingRoutes}
                  />
                  {loadingRoutes && (
                    <p className="text-sm text-muted-foreground">Cargando rutas...</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales de la orden..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Productos de la Orden */}
          <Card>
            <CardHeader>
              <CardTitle>Productos de la Orden</CardTitle>
              <CardDescription>
                Agrega los productos a la orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agregar Producto */}
              <div className="space-y-4">
                {/* Product and Quantity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="product">Producto</Label>
                    <Combobox
                      options={productOptions}
                      value={selectedProduct}
                      onValueChange={(value) => {
                        setSelectedProduct(value)
                        setStockError(null) // Limpiar error al cambiar producto
                      }}
                      placeholder="Selecciona un producto"
                      searchPlaceholder="Buscar producto por nombre..."
                      emptyMessage="No se encontraron productos."
                      disabled={loadingProducts}
                    />
                    {loadingProducts && (
                      <p className="text-sm text-muted-foreground">Cargando productos...</p>
                    )}
                    {selectedProduct && (
                      <p className="text-sm text-muted-foreground">
                        Stock disponible: {products.find(p => p.id === parseInt(selectedProduct))?.stock || 0} unidades
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <QuantityInput
                      id="quantity"
                      value={quantity}
                      onValueChange={(value) => {
                        setQuantity(value)
                        setStockError(null) // Limpiar error al cambiar cantidad
                      }}
                      min={1}
                    />
                  </div>
                  <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <Button 
                      type="button" 
                      onClick={addItem} 
                      className="w-full"
                      disabled={!selectedProduct || quantity <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mensaje de Error de Stock */}
              {stockError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{stockError}</p>
                </div>
              )}

              {/* Lista de Productos */}
              {orderItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Productos Agregados</Label>
                  <div className="border rounded-lg">
                    {orderItems.map((item, index) => (
                      <div key={index} className="p-4 border-b last:border-b-0">
                        {/* Desktop Layout */}
                        <div className="hidden md:flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Q{item.price.toFixed(2)} x {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`quantity-${index}`} className="text-sm">Cantidad:</Label>
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                            </div>
                            <div className="font-medium min-w-[80px] text-right">Q{item.subtotal.toFixed(2)}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Mobile Layout */}
                        <div className="md:hidden space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                              <div className="font-medium text-sm leading-5">{item.product_name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Precio unitario: Q{item.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">Q{item.subtotal.toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`quantity-mobile-${index}`} className="text-sm whitespace-nowrap">Cantidad:</Label>
                              <Input
                                id={`quantity-mobile-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 h-8 px-3"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              <span className="text-xs">Eliminar</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {orderItems.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      Total: Q{total.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:space-x-4">
            <Link to="/orders" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={!selectedClient || orderItems.length === 0 || loading || loadingClients || loadingProducts || loadingRoutes}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creando...' : 'Crear Orden'}
            </Button>
          </div>
        </form>
      </div>
    </Main>
  )
} 