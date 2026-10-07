import {
  Package,
  ShoppingCart,
  Truck,
  CheckCircle,
  X,
  Clock,
  Route,
} from 'lucide-react'
import type { StatusTone } from '@/components/status-badge'

// Estados de órdenes con sus íconos y colores
export const orderStatuses = [
  {
    value: 'pending',
    label: 'Pendiente',
    icon: Clock,
    tone: 'warning' as StatusTone,
    color: 'text-warning-foreground dark:text-warning',
    bgColor: 'bg-warning/20 border-warning/50',
  },
  {
    value: 'confirmed',
    label: 'Confirmado',
    icon: ShoppingCart,
    tone: 'info' as StatusTone,
    color: 'text-info',
    bgColor: 'bg-info/10 border-info/25',
  },
  {
    value: 'in_progress',
    label: 'En proceso',
    icon: Package,
    tone: 'info' as StatusTone,
    color: 'text-info',
    bgColor: 'bg-info/10 border-info/25',
  },
  {
    value: 'shipped',
    label: 'Enviado',
    icon: Truck,
    tone: 'primary' as StatusTone,
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/25',
  },
  {
    value: 'delivered',
    label: 'Entregado',
    icon: CheckCircle,
    tone: 'success' as StatusTone,
    color: 'text-success',
    bgColor: 'bg-success/10 border-success/25',
  },
  {
    value: 'cancelled',
    label: 'Cancelado',
    icon: X,
    tone: 'danger' as StatusTone,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/25',
  },
] as const

export const orderStatusMap = new Map(
  orderStatuses.map((status) => [status.value, status])
)

// Función para obtener datos de estado
export const getOrderStatusData = (status: string) => {
  return (
    orderStatusMap.get(status) || {
      value: status,
      label: status,
      icon: Package,
      tone: 'neutral' as StatusTone,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted border-border',
    }
  )
}

// Función para obtener rutas únicas de una lista de órdenes
export const getUniqueRoutes = (orders: any[]) => {
  const routes = new Map()

  orders.forEach((order) => {
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

// Estados de pago del pedido (saldo)
export const paymentStatuses = [
  { value: 'unpaid', label: 'Sin pagar', tone: 'danger' as StatusTone },
  { value: 'partial', label: 'Pago parcial', tone: 'warning' as StatusTone },
  { value: 'paid', label: 'Pagado', tone: 'success' as StatusTone },
] as const

export const getPaymentStatusData = (status?: string | null) =>
  paymentStatuses.find((s) => s.value === (status || 'unpaid')) ??
  paymentStatuses[0]
