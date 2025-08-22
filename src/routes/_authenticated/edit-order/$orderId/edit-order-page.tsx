import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Main } from '@/components/layout/main'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ordersService, type OrderItem, type Order } from '@/services/orders'
import { clientsService, type Client } from '@/services/clients'
import { productsService, type Product } from '@/services/products'
import { toast } from 'sonner'

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
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  // Estados para datos de la API
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrder, setLoadingOrder] = useState(true)

  // Cargar orden, clientes y productos al montar el componente
  useEffect(() => {
    loadOrder()
    loadClients()
    loadProducts()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoadingOrder(true)
      const orderData = await ordersService.getOrder(parseInt(orderId))
      setOrder(orderData)
      setSelectedClient(orderData.client_id.toString())
      setNotes(orderData.notes || '')
      
      // Convertir items de la orden al formato del formulario
      const formItems: OrderItemForm[] = orderData.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name || `Producto #${item.product_id}`,
        price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.unit_price * item.quantity
      }))
      setOrderItems(formItems)
    } catch (_err) {
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
    } catch (_err) {
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
    } catch (_err) {
      setError('Error al cargar los productos')
    } finally {
      setLoadingProducts(false)
    }
  }

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (!product) return

    const newItem: OrderItemForm = {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: quantity,
      subtotal: product.price * quantity
    }

    setOrderItems([...orderItems, newItem])
    setSelectedProduct('')
    setQuantity(1)
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].subtotal = updatedItems[index].price * newQuantity
    setOrderItems(updatedItems)
  }

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (orderItems.length === 0) {
      setError('Por favor agrega al menos un producto a la orden')
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
        notes: notes || undefined,
        items: apiItems
      }

      await ordersService.updateOrderComplete(parseInt(orderId), orderData)
      
      toast.success('Orden actualizada exitosamente')
      // Redirigir a la página de detalle de la orden
      navigate({ to: '/order-detail/$orderId', params: { orderId } })
    } catch (_err) {
      setError('Error al actualizar la orden')
    } finally {
      setLoading(false)
    }
  }

  // Preparar opciones para los comboboxes
  const clientOptions = clients.map(client => ({
    value: client.id.toString(),
    label: `${client.name} (${client.email})`,
    disabled: !client.is_active
  }))

  const productOptions = products.map(product => ({
    value: product.id.toString(),
    label: `${product.name} - Q${product.price.toFixed(2)} (Stock: ${product.stock})`,
    disabled: product.stock <= 0 || !product.is_active
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

  if (error || !order) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">{error || 'Orden no encontrada'}</p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/order-detail/$orderId" params={{ orderId }}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Orden</h1>
              <p className="text-muted-foreground">
                Modifica los datos de la orden #{order.order_number || orderId}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>
                Selecciona el cliente para esta orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
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
                  <Label>Notas</Label>
                  <Textarea
                    placeholder="Notas adicionales de la orden..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items de la Orden */}
          <Card>
            <CardHeader>
              <CardTitle>Items de la Orden</CardTitle>
              <CardDescription>
                Agrega productos a la orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Producto</Label>
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
                </div>
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedProduct || quantity <= 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Tabla de Items */}
              {orderItems.length > 0 && (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unitario</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.product_name}
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-right">Q{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            Q{item.subtotal.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      Total: Q{total.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mensaje de Error */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4">
            <Link to="/order-detail/$orderId" params={{ orderId }}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Main>
  )
} 