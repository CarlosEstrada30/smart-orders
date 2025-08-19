import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ShoppingCart, Package, Truck, CheckCircle } from 'lucide-react'

// Datos de ejemplo para pedidos de quesería
const mockOrders = [
  {
    id: 'PED-001',
    customer: 'María González',
    customerEmail: 'maria.gonzalez@quesosartesanos.com',
    items: 3,
    total: 66.73,
    status: 'Pendiente',
    paymentStatus: 'Pagado',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
  {
    id: 'PED-002',
    customer: 'Carlos Rodríguez',
    customerEmail: 'carlos.rodriguez@restaurante.com',
    items: 5,
    total: 89.95,
    status: 'En Proceso',
    paymentStatus: 'Pagado',
    createdAt: '2024-02-14',
    updatedAt: '2024-02-15',
  },
  {
    id: 'PED-003',
    customer: 'Luis Martínez',
    customerEmail: 'luis.martinez@hotel.com',
    items: 8,
    total: 156.72,
    status: 'Enviado',
    paymentStatus: 'Pagado',
    createdAt: '2024-02-13',
    updatedAt: '2024-02-14',
  },
  {
    id: 'PED-004',
    customer: 'Elena Sánchez',
    customerEmail: 'elena.sanchez@catering.com',
    items: 12,
    total: 234.88,
    status: 'Entregado',
    paymentStatus: 'Pagado',
    createdAt: '2024-02-12',
    updatedAt: '2024-02-13',
  },
  {
    id: 'PED-005',
    customer: 'Restaurante El Bueno',
    customerEmail: 'pedidos@elbueno.com',
    items: 6,
    total: 98.45,
    status: 'Cancelado',
    paymentStatus: 'Reembolsado',
    createdAt: '2024-02-11',
    updatedAt: '2024-02-12',
  },
  {
    id: 'PED-006',
    customer: 'Hotel Plaza Mayor',
    customerEmail: 'compras@plazamayor.com',
    items: 4,
    total: 67.24,
    status: 'Pendiente',
    paymentStatus: 'Pendiente',
    createdAt: '2024-02-16',
    updatedAt: '2024-02-16',
  },
  {
    id: 'PED-007',
    customer: 'Catering Delicias',
    customerEmail: 'pedidos@delicias.com',
    items: 15,
    total: 298.75,
    status: 'En Proceso',
    paymentStatus: 'Pagado',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-16',
  },
  {
    id: 'PED-008',
    customer: 'Tienda Gourmet',
    customerEmail: 'compras@gourmet.com',
    items: 10,
    total: 187.50,
    status: 'Enviado',
    paymentStatus: 'Pagado',
    createdAt: '2024-02-14',
    updatedAt: '2024-02-15',
  },
]

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orders] = useState(mockOrders)

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'secondary'
      case 'En Proceso':
        return 'default'
      case 'Enviado':
        return 'outline'
      case 'Entregado':
        return 'default'
      case 'Cancelado':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pagado':
        return 'default'
      case 'Pendiente':
        return 'secondary'
      case 'Reembolsado':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return <Package className="h-4 w-4" />
      case 'En Proceso':
        return <ShoppingCart className="h-4 w-4" />
      case 'Enviado':
        return <Truck className="h-4 w-4" />
      case 'Entregado':
        return <CheckCircle className="h-4 w-4" />
      case 'Cancelado':
        return <Trash2 className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">
              Gestiona los pedidos de quesos y productos lácteos
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>
              {filteredOrders.length} pedidos encontrados
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell className="font-medium">€{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Main>
  )
} 