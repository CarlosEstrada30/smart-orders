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
import { ArrowLeft, Plus, Trash2, Save, UserPlus } from 'lucide-react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ordersService, type Order, type OrderItem } from '@/services/orders'
import { clientsService, type Client } from '@/services/clients'
import { productsService, type Product } from '@/services/products'
import { routesService, type Route } from '@/services'
import { CreateClientModal } from '@/components/clients/create-client-modal'

interface OrderItemForm {
  product_id: number
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

export function EditOrderPage() {
  const { orderId } = useParams({ from: '/_authenticated/edit-order/$orderId' })
  const navigate = useNavigate()
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  // Estados para datos de la API
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(true)

  // Estado para el modal de crear cliente
  const [createClientModalOpen, setCreateClientModalOpen] = useState(false)

  // Cargar orden existente
  useEffect(() => {
    loadOrderData()
  }, [orderId])

  // Cargar clientes, productos y rutas al montar el componente
  useEffect(() => {
    loadClients()
    loadProducts()
    loadRoutes()
  }, [])

  // Recalcular precios cuando cambie la ruta seleccionada
  useEffect(() => {
    if (selectedRoute && orderItems.length > 0) {
      const routeId = parseInt(selectedRoute)
      const updatedItems = orderItems.map(item => {
        const product = products.find(p => p.id === item.product_id)
        if (!product) return item
        
        const correctPrice = getProductPrice(product, routeId)
        return {
          ...item,
          price: correctPrice,
          subtotal: correctPrice * item.quantity
        }
      })
      setOrderItems(updatedItems)
    }
  }, [selectedRoute, products])

  // Función para obtener el precio correcto según la ruta seleccionada
  const getProductPrice = (product: Product, routeId?: number): number => {
    // Si no hay ruta seleccionada, usar precio por defecto
    if (!routeId) {
      return product.price
    }
    
    // Si no hay precios por ruta, usar precio por defecto
    if (!product.route_prices || product.route_prices.length === 0) {
      return product.price
    }
    
    // Buscar precio específico para la ruta
    const routePrice = product.route_prices.find(rp => rp.route_id === routeId)
    return routePrice ? routePrice.price : product.price
  }

  const loadOrderData = async () => {
    try {
      setLoadingOrder(true)
      const orderData = await ordersService.getOrder(parseInt(orderId))
      
      // Verificar que la orden puede editarse
      if (orderData.status !== 'pending') {
        setError('Solo se pueden editar órdenes en estado PENDING')
        return
      }
      
      setOrder(orderData)
      
      // Pre-llenar campos del formulario
      setSelectedClient(orderData.client_id.toString())
      setSelectedRoute(orderData.route_id?.toString() || '')
      setDiscount(orderData.discount_percentage || 0)
      setNotes(orderData.notes || '')
      
      // Convertir items a formato del formulario
      const formItems: OrderItemForm[] = orderData.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name || `Producto #${item.product_id}`,
        price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.unit_price * item.quantity
      }))
      setOrderItems(formItems)
      
    } catch (err) {
      setError('Error al cargar la orden')
    } finally {
      setLoadingOrder(false)
    }
  }

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

  // Función para manejar cuando se crea un nuevo cliente
  const handleClientCreated = (newClient: Client) => {
    // Agregar el nuevo cliente a la lista
    setClients(prev => [...prev, newClient])
    
    // Seleccionar automáticamente el nuevo cliente
    setSelectedClient(newClient.id.toString())
  }

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (!product) return

    // Obtener el precio correcto según la ruta seleccionada (si existe)
    const routeId = selectedRoute ? parseInt(selectedRoute) : undefined
    const correctPrice = getProductPrice(product, routeId)

    // Verificar si el producto ya existe en la orden
    const existingItem = orderItems.find(item => item.product_id === product.id)
    const existingQuantity = existingItem ? existingItem.quantity : 0
    const totalQuantity = existingQuantity + quantity

    // Si existe el producto, actualizar la cantidad; si no, agregar nuevo item
    if (existingItem) {
      const updatedItems = orderItems.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: totalQuantity, price: correctPrice, subtotal: correctPrice * totalQuantity }
          : item
      )
      setOrderItems(updatedItems)
    } else {
      const newItem: OrderItemForm = {
        product_id: product.id,
        product_name: product.name,
        price: correctPrice,
        quantity: quantity,
        subtotal: correctPrice * quantity
      }
      setOrderItems([...orderItems, newItem])
    }

    // Limpiar estados
    setSelectedProduct('')
    setQuantity(1)
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return

    const item = orderItems[index]
    const product = products.find(p => p.id === item.product_id)
    
    if (!product) return

    // Obtener el precio correcto según la ruta actual
    const routeId = selectedRoute ? parseInt(selectedRoute) : null
    const correctPrice = routeId ? getProductPrice(product, routeId) : item.price

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].price = correctPrice
    updatedItems[index].subtotal = correctPrice * newQuantity
    setOrderItems(updatedItems)
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClient || !selectedRoute || orderItems.length === 0) {
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
        route_id: parseInt(selectedRoute),
        discount_percentage: discount > 0 ? discount : undefined,
        notes: notes || undefined,
        items: apiItems
      }

      await ordersService.updateOrderComplete(parseInt(orderId), {
        client_id: orderData.client_id,
        route_id: orderData.route_id,
        discount_percentage: orderData.discount_percentage,
        notes: orderData.notes,
        items: apiItems
      })
      
      // Redirigir al detalle de la orden después de actualizar exitosamente
      navigate({ to: '/order-detail/$orderId', params: { orderId } })
    } catch (err) {
      setError('Error al actualizar la orden')
    } finally {
      setLoading(false)
    }
  }

  // Preparar opciones para los comboboxes
  const clientOptions = clients.map(client => ({
    value: client.id.toString(),
    label: `${client.name}${client.phone ? ` (${client.phone})` : ''}`,
    disabled: !client.is_active
  }))

  const productOptions = products.map(product => {
    const routeId = selectedRoute ? parseInt(selectedRoute) : undefined
    const displayPrice = getProductPrice(product, routeId)
    const stockText = product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'
    return {
      value: product.id.toString(),
      label: `${product.name} - Q${displayPrice.toFixed(2)} (${stockText})`,
      disabled: !product.is_active
    }
  })

  const routeOptions = routes.map(route => ({
    value: route.id.toString(),
    label: route.name,
    disabled: !route.is_active
  }))

  if (loadingOrder) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Cargando orden...</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (error && !order) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Link to="/orders">
                <Button className="mt-4">Volver a órdenes</Button>
              </Link>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/order-detail/$orderId" params={{ orderId }}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Editar Orden</h1>
              <p className="text-muted-foreground">
                Modificar orden #{order?.order_number || orderId}
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
                Modifica el cliente y la ruta de entrega para esta orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between h-6">
                    <Label htmlFor="client">Cliente *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateClientModalOpen(true)}
                      className="h-8 px-2"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Nuevo
                    </Button>
                  </div>
                  <Combobox
                    options={clientOptions}
                    value={selectedClient}
                    onValueChange={setSelectedClient}
                    placeholder="Selecciona un cliente"
                    searchPlaceholder="Buscar cliente por nombre o teléfono..."
                    emptyMessage="No se encontraron clientes."
                    disabled={loadingClients}
                  />
                  {loadingClients && (
                    <p className="text-sm text-muted-foreground">Cargando clientes...</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-6 flex items-center">
                    <Label htmlFor="route">Ruta de Entrega *</Label>
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Descuento (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Ej: 10"
                    value={discount || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (isNaN(value)) {
                        setDiscount(0)
                      } else if (value < 0) {
                        setDiscount(0)
                      } else if (value > 100) {
                        setDiscount(100)
                      } else {
                        setDiscount(value)
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Descuento opcional de 0 a 100%
                  </p>
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
                Modifica los productos de la orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agregar Producto */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="product">Producto</Label>
                    <Combobox
                      options={productOptions}
                      value={selectedProduct}
                      onValueChange={setSelectedProduct}
                      placeholder="Selecciona un producto"
                      searchPlaceholder="Buscar producto por nombre..."
                      emptyMessage="No se encontraron productos."
                      disabled={loadingProducts}
                    />
                    {loadingProducts && (
                      <p className="text-sm text-muted-foreground">Cargando productos...</p>
                    )}
                    {!selectedRoute && (
                      <p className="text-sm text-blue-600">Mostrando precios por defecto. Selecciona una ruta para ver precios específicos.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <QuantityInput
                      id="quantity"
                      value={quantity}
                      onValueChange={setQuantity}
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

              {/* Lista de Productos */}
              {orderItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Productos en la Orden</Label>
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
                              <QuantityInput
                                id={`quantity-${index}`}
                                value={item.quantity}
                                onValueChange={(value) => updateItemQuantity(index, value)}
                                min={1}
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
                              <QuantityInput
                                id={`quantity-mobile-${index}`}
                                value={item.quantity}
                                onValueChange={(value) => updateItemQuantity(index, value)}
                                min={1}
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

              {/* Resumen del Total */}
              {orderItems.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-right space-y-1 min-w-[200px]">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>Q{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento ({discount}%):</span>
                        <span>-Q{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>Q{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:space-x-4">
            <Link to="/order-detail/$orderId" params={{ orderId }} className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={!selectedClient || !selectedRoute || orderItems.length === 0 || loading || loadingClients || loadingProducts || loadingRoutes}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>

        {/* Modal para crear cliente */}
        <CreateClientModal
          open={createClientModalOpen}
          onOpenChange={setCreateClientModalOpen}
          onClientCreated={handleClientCreated}
        />
      </div>
    </Main>
  )
} 

