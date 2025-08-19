import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { Link } from '@tanstack/react-router'

// Datos de ejemplo para el formulario
const mockClients = [
  { id: 1, name: 'Restaurante El Bueno', email: 'carlos.rodriguez@elbueno.com' },
  { id: 2, name: 'Hotel Plaza Mayor', email: 'compras@plazamayor.com' },
  { id: 3, name: 'Catering Delicias', email: 'pedidos@delicias.com' },
  { id: 4, name: 'Tienda Gourmet', email: 'compras@gourmet.com' },
  { id: 5, name: 'Restaurante La Taberna', email: 'pedidos@lataberna.com' },
  { id: 6, name: 'Hotel Mediterráneo', email: 'compras@mediterraneo.com' },
]

const mockProducts = [
  { id: 1, name: 'Queso Manchego Curado', price: 24.99, stock: 15 },
  { id: 2, name: 'Queso Cabrales', price: 18.50, stock: 8 },
  { id: 3, name: 'Queso Idiazábal Ahumado', price: 22.75, stock: 12 },
  { id: 4, name: 'Queso Tetilla', price: 12.99, stock: 0 },
  { id: 5, name: 'Queso Mahón', price: 19.99, stock: 20 },
  { id: 6, name: 'Queso de Burgos', price: 8.50, stock: 25 },
  { id: 7, name: 'Queso Roncal', price: 28.99, stock: 6 },
  { id: 8, name: 'Queso Zamorano', price: 26.50, stock: 18 },
]

interface OrderItem {
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
}

export function NewOrderPage() {
  const [selectedClient, setSelectedClient] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const product = mockProducts.find(p => p.id === parseInt(selectedProduct))
    if (!product) return

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar el pedido
    // Simular guardado exitoso
    alert('Pedido creado exitosamente')
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nuevo Pedido</h1>
              <p className="text-muted-foreground">
                Crea un nuevo pedido de quesos
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
                Selecciona el cliente para este pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Fecha del Pedido *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notas adicionales del pedido..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos del Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Productos del Pedido</CardTitle>
              <CardDescription>
                Agrega los quesos y productos al pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agregar Producto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Producto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - €{product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Lista de Productos */}
              {orderItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Productos Agregados</Label>
                  <div className="border rounded-lg">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            €{item.price} x {item.quantity}
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
                          <div className="font-medium">€{item.subtotal.toFixed(2)}</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                      Total: €{total.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4">
            <Link to="/orders">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={!selectedClient || orderItems.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Crear Pedido
            </Button>
          </div>
        </form>
      </div>
    </Main>
  )
} 