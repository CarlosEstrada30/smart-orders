import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  UserCog,
  Palette,
  Bell,
  Monitor,
  UserCheck,
  Route,
  Archive,
} from 'lucide-react'

import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Bethel',
    email: 'admin@bethel.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Lacteos Bethel',
      logo: '/images/bethel.jpeg',
      plan: 'Sistema de Gestión',
    },
  ],
  navGroups: [
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
          title: 'Productos',
          url: '/products',
          icon: Package,
        },
        {
          title: 'Rutas',
          url: '/routes',
          icon: Route,
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
      title: 'Configuración',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
