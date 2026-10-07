import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  UserCheck,
  Route,
  Building,
  ChartBar,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Usuario',
    email: '',
    avatar: '',
  },
  teams: [
    {
      name: 'SmartOrders',
      logo: 'Building2',
      plan: 'Sistema de Gestión',
    },
  ],
  navGroups: [
    {
      title: 'Operación',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        { title: 'Pedidos', url: '/orders', icon: ShoppingCart },
        { title: 'Clientes', url: '/clients', icon: UserCheck },
        { title: 'Rutas', url: '/routes', icon: Route },
        { title: 'Productos', url: '/products', icon: Package },
      ],
    },
    {
      title: 'Producción',
      items: [
        { title: 'Plan de producción', url: '/forecast', icon: ChartBar },
      ],
    },
    {
      title: 'Administración',
      items: [
        { title: 'Usuarios', url: '/users', icon: Users },
        { title: 'Mi empresa', url: '/settings', icon: Settings },
        { title: 'Empresas', url: '/companies', icon: Building },
      ],
    },
  ],
}
