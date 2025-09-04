import {
  Package,
  ShoppingCart,
  Truck,
  CheckCircle,
  X,
  Clock,
  Route,
} from 'lucide-react'

// Estados de órdenes con sus íconos y colores
export const orderStatuses = [
  {
    value: 'pending',
    label: 'Pendiente',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  {
    value: 'confirmed',
    label: 'Confirmado',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    value: 'in_progress',
    label: 'En Proceso',
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  {
    value: 'shipped',
    label: 'Enviado',
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  {
    value: 'delivered',
    label: 'Entregado',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    value: 'cancelled',
    label: 'Cancelado',
    icon: X,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
] as const

export const orderStatusMap = new Map(
  orderStatuses.map(status => [status.value, status])
)

// Función para obtener datos de estado
export const getOrderStatusData = (status: string) => {
  return orderStatusMap.get(status) || {
    value: status,
    label: status,
    icon: Package,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
  }
}

// Función para obtener rutas únicas de una lista de órdenes
export const getUniqueRoutes = (orders: any[]) => {
  const routes = new Map()
  
  orders.forEach(order => {
    if (order.route && order.route.is_active) {
      routes.set(order.route.id, {
        value: order.route.id.toString(),
        label: order.route.name,
        icon: Route,
      })
    }
  })

  // Agregar opción para órdenes sin ruta
  routes.set('null', {
    value: 'null',
    label: 'Sin ruta asignada',
    icon: X,
  })

  return Array.from(routes.values())
}

