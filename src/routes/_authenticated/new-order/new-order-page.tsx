import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { routesService, type Route } from '@/services'
import { clientsService, type Client } from '@/services/clients'
import { ordersService, type OrderItem } from '@/services/orders'
import { productsService, type Product } from '@/services/products'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { CreateClientModal } from '@/components/clients/create-client-modal'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import {
  OrderFormView,
  type OrderFormItem,
} from '@/features/orders/components/order-form-view'

type OrderItemForm = OrderFormItem

export function NewOrderPage() {
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para datos de la API
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(true)

  // Estado para el modal de crear cliente
  const [createClientModalOpen, setCreateClientModalOpen] = useState(false)

  // Cargar clientes, productos y rutas al montar el componente
  useEffect(() => {
    loadClients()
    loadProducts()
    loadRoutes()
  }, [])

  // Función para recalcular precios cuando cambie la ruta
  const updatePricesForRoute = (routeId: number) => {
    if (orderItems.length > 0) {
      const updatedItems = orderItems.map((item) => {
        const product = products.find((p) => p.id === item.product_id)
        if (!product) return item

        const correctPrice = getProductPrice(product, routeId)
        return {
          ...item,
          price: correctPrice,
          subtotal: correctPrice * item.quantity,
        }
      })
      setOrderItems(updatedItems)
    }
  }

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const clientsData = await clientsService.getClients({
        active_only: true,
        limit: 1000,
      })
      setClients(clientsData)
    } catch (_err) {
      setError('No se pudieron cargar los clientes')
    } finally {
      setLoadingClients(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const productsData = await productsService.getProducts({
        active_only: true,
      })
      setProducts(productsData)
    } catch (_err) {
      setError('No se pudieron cargar los productos')
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true)
      const routesData = await routesService.getRoutes({ active_only: true })
      setRoutes(routesData)
    } catch (_err) {
      setError('No se pudieron cargar las rutas')
    } finally {
      setLoadingRoutes(false)
    }
  }

  // Función para manejar cuando se crea un nuevo cliente
  const handleClientCreated = (newClient: Client) => {
    // Agregar el nuevo cliente a la lista
    setClients((prev) => [...prev, newClient])

    // Seleccionar automáticamente el nuevo cliente
    setSelectedClient(newClient.id.toString())
  }

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
    const routePrice = product.route_prices.find(
      (rp) => rp.route_id === routeId
    )
    return routePrice ? routePrice.price : product.price
  }

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const product = products.find((p) => p.id === parseInt(selectedProduct))
    if (!product) return

    // Obtener el precio correcto según la ruta seleccionada (si existe)
    const routeId = selectedRoute ? parseInt(selectedRoute) : undefined
    const correctPrice = getProductPrice(product, routeId)

    // Verificar si el producto ya existe en la orden
    const existingItem = orderItems.find(
      (item) => item.product_id === product.id
    )
    const existingQuantity = existingItem ? existingItem.quantity : 0
    const totalQuantity = existingQuantity + quantity

    // Si existe el producto, actualizar la cantidad; si no, agregar nuevo item
    if (existingItem) {
      const updatedItems = orderItems.map((item) =>
        item.product_id === product.id
          ? {
              ...item,
              quantity: totalQuantity,
              price: correctPrice,
              subtotal: correctPrice * totalQuantity,
            }
          : item
      )
      setOrderItems(updatedItems)
    } else {
      const newItem: OrderItemForm = {
        product_id: product.id,
        product_name: product.name,
        price: correctPrice,
        quantity: quantity,
        subtotal: correctPrice * quantity,
      }
      setOrderItems([...orderItems, newItem])
    }
    setSelectedProduct('')
    setQuantity(1)
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return

    const item = orderItems[index]
    const product = products.find((p) => p.id === item.product_id)

    if (!product) return

    // Obtener el precio correcto según la ruta actual
    const routeId = selectedRoute ? parseInt(selectedRoute) : null
    const correctPrice = routeId
      ? getProductPrice(product, routeId)
      : item.price

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].price = correctPrice
    updatedItems[index].subtotal = correctPrice * newQuantity
    setOrderItems(updatedItems)
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  const total = subtotal - discount // El descuento es un monto fijo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClient || !selectedRoute || orderItems.length === 0) {
      setError('Elige la ruta, el cliente y al menos un producto.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Convertir los items del formulario al formato de la API
      const apiItems: OrderItem[] = orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      const orderData = {
        client_id: parseInt(selectedClient),
        route_id: parseInt(selectedRoute),
        discount_amount: discount > 0 ? discount : undefined,
        notes: notes || undefined,
        items: apiItems,
      }

      await ordersService.createOrder(orderData)

      // Mostrar toast de éxito
      toast.success('Pedido creado')

      // Resetear formulario (excepto la ruta seleccionada)
      setSelectedClient('')
      setDiscount(0)
      setNotes('')
      setOrderItems([])
      setSelectedProduct('')
      setQuantity(1)
    } catch (_err) {
      setError(
        'No se pudo crear el pedido. Revisa los datos e intenta de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Preparar opciones para los comboboxes
  const clientOptions = clients.map((client) => ({
    value: client.id.toString(),
    label: `${client.name}${client.phone ? ` (${client.phone})` : ''}`,
    disabled: !client.is_active,
  }))

  const productOptions = products.map((product) => {
    const routeId = selectedRoute ? parseInt(selectedRoute) : undefined
    const displayPrice = getProductPrice(product, routeId)
    const stockText =
      product.stock > 0 ? `${product.stock} en stock` : 'sin stock'
    return {
      value: product.id.toString(),
      label: `${product.name}, ${formatCurrency(displayPrice)} (${stockText})`,
      disabled: !product.is_active,
    }
  })

  const routeOptions = routes.map((route) => ({
    value: route.id.toString(),
    label: route.name,
    disabled: !route.is_active,
  }))

  return (
    <Main className='max-md:pb-28'>
      <Button
        asChild
        variant='ghost'
        size='sm'
        className='text-muted-foreground -ms-2 mb-2'
      >
        <Link to='/orders'>
          <ArrowLeft aria-hidden='true' />
          Pedidos
        </Link>
      </Button>
      <PageHeader
        title='Nuevo pedido'
        description='Elige la ruta y el cliente, agrega los productos y crea el pedido.'
      />

      <OrderFormView
        error={error}
        routeOptions={routeOptions}
        clientOptions={clientOptions}
        productOptions={productOptions}
        loadingRoutes={loadingRoutes}
        loadingClients={loadingClients}
        loadingProducts={loadingProducts}
        selectedRoute={selectedRoute}
        selectedClient={selectedClient}
        selectedProduct={selectedProduct}
        quantity={quantity}
        orderItems={orderItems}
        discount={discount}
        notes={notes}
        subtotal={subtotal}
        total={total}
        saving={loading}
        submitLabel='Crear pedido'
        savingLabel='Creando pedido…'
        onSubmit={handleSubmit}
        onRouteChange={(value) => {
          setSelectedRoute(value)
          if (value) updatePricesForRoute(parseInt(value))
        }}
        onClientChange={setSelectedClient}
        onNewClient={() => setCreateClientModalOpen(true)}
        onProductChange={setSelectedProduct}
        onQuantityChange={setQuantity}
        onAddItem={addItem}
        onItemQuantityChange={updateItemQuantity}
        onRemoveItem={removeItem}
        onDiscountChange={setDiscount}
        onNotesChange={setNotes}
      />

      {/* Modal para crear cliente */}
      <CreateClientModal
        open={createClientModalOpen}
        onOpenChange={setCreateClientModalOpen}
        onClientCreated={handleClientCreated}
      />
    </Main>
  )
}
