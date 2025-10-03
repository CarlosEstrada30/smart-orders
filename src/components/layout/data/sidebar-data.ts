import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  UserCheck,
  Route,
  Archive,
  FileText,
  Receipt,
  Building,
  TrendingUp,
} from 'lucide-react'

import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Smart Orders',
    email: 'admin@smartorders.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Smart Orders',
      logo: '/images/bethel.jpeg',
      plan: 'Sistema de Gestión',
    },
  ],
  navGroups: [
    {
      title: 'Sistema',
      items: [
        {
          title: 'Empresas',
          url: '/companies',
          icon: Building,
        },
      ],
    },
    {
      title: 'Gestión',
      items: [
        {
          title: 'Usuarios',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Clientes',
          url: '/clients',
          icon: UserCheck,
        },
        {
          title: 'Rutas',
          url: '/routes',
          icon: Route,
        },
        {
          title: 'Productos',
          url: '/products',
          icon: Package,
        },
        {
          title: 'Pedidos',
          url: '/orders',
          icon: ShoppingCart,
        },
        {
          title: 'Inventario',
          url: '/inventory',
          icon: Archive,
        },
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Producción',
      items: [
        {
          title: 'Dashboard Producción',
          url: '/production',
          icon: TrendingUp,
        },
      ],
    },
    // {
    //   title: 'Facturación',
    //   items: [
    //     {
    //       title: 'Dashboard FEL',
    //       url: '/fel',
    //       icon: FileText,
    //     },
    //               {
    //         title: 'Facturas',
    //         url: '/fel/invoices',
    //         icon: Receipt,
    //       },
    //       {
    //         title: 'Generar Factura',
    //         url: '/fel/generate',
    //         icon: FileText,
    //       },
    //   ],
    // },
    {
      title: 'Configuración',
      items: [
        {
          title: 'Configuración de Empresa',
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ],
}
