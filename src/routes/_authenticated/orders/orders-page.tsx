import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus, Search, MoreHorizontal, Trash2, Eye, ShoppingCart, Package, Truck, CheckCircle, X, User, MapPin } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ordersService, type Order, type OrderStatus } from '@/services/orders'

export function OrdersPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await ordersService.getOrders()
      setOrders(ordersData)
    } catch (_err) {
      setError('Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      await ordersService.deleteOrder(orderToDelete.id!)
      setOrders(orders.filter(order => order.id !== orderToDelete.id))
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (_err) {
      setError('Error al cancelar la orden')
    }
  }

  const handleViewOrder = (orderId: number) => {
    navigate({ to: '/order-detail/$orderId', params: { orderId: orderId.toString() } })
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmado'
      case 'in_progress':
        return 'En Proceso'
      case 'shipped':
        return 'Enviado'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase()
    
    // Búsqueda por número de orden
    if (order.order_number?.toLowerCase().includes(searchLower)) return true
    if (order.id?.toString().includes(searchTerm)) return true
    
    // Búsqueda por cliente
    if (order.client?.name?.toLowerCase().includes(searchLower)) return true
    if (order.client?.email?.toLowerCase().includes(searchLower)) return true
    
    // Búsqueda por dirección
    if (order.client?.address?.toLowerCase().includes(searchLower)) return true
    
    // Búsqueda por estado
    const statusLabel = getStatusLabel(order.status)
    if (statusLabel.toLowerCase().includes(searchLower)) return true
    
    return false
  })

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'confirmed':
        return 'default'
      case 'in_progress':
        return 'outline'
      case 'shipped':
        return 'default'
      case 'delivered':
        return 'default'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4" />
      case 'confirmed':
        return <ShoppingCart className="h-4 w-4" />
      case 'in_progress':
        return <ShoppingCart className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <X className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Cargando órdenes...</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
            <p className="text-muted-foreground">
              Gestiona las órdenes de la aplicación
            </p>
          </div>
          <Link to="/new-order">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Orden
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Órdenes</CardTitle>
            <CardDescription>
              {filteredOrders.length} órdenes encontradas
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar órdenes por número, cliente, email, dirección o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[400px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">
                      {order.order_number || `#${order.id}`}
                    </TableCell>
                    <TableCell>
                      {order.client ? (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{order.client.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.client.phone}
                            </div>
                            {!order.client.is_active && (
                              <Badge variant="secondary" className="text-xs mt-1">Inactivo</Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Cliente #{order.client_id}</div>
                            <div className="text-sm text-muted-foreground">
                              Información no disponible
                            </div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.client?.address ? (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm max-w-[200px] truncate" title={order.client.address}>
                            {order.client.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin dirección</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className="font-medium">{order.items?.length || 0}</span>
                        <div className="text-xs text-muted-foreground">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} unidades
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      Q{order.total_amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span>{getStatusLabel(order.status)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</div>
                        {order.updated_at && order.updated_at !== order.created_at && (
                          <div className="text-xs text-muted-foreground">
                            Actualizado: {new Date(order.updated_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewOrder(order.id!)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>

                          {order.status !== 'cancelled' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setOrderToDelete(order)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de confirmación de eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cancelar orden?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. La orden será cancelada permanentemente.
                {orderToDelete && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm">
                      <strong>Orden:</strong> {orderToDelete.order_number || `#${orderToDelete.id}`}<br />
                      <strong>Cliente:</strong> {orderToDelete.client?.name || `Cliente #${orderToDelete.client_id}`}<br />
                      <strong>Email:</strong> {orderToDelete.client?.email || 'No disponible'}<br />
                      <strong>Total:</strong> Q{orderToDelete.total_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteOrder}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Main>
  )
} 