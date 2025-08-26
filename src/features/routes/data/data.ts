import { Route, MapPin, Navigation } from 'lucide-react'
import { type RouteStatus } from './schema'

export const routeStatusTypes = new Map<RouteStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const routeStatusLabels = new Map<RouteStatus, string>([
  ['active', 'Activa'],
  ['inactive', 'Inactiva'],
])

export const routeIcons = [
  {
    label: 'Ruta',
    value: 'route',
    icon: Route,
  },
  {
    label: 'Ubicación',
    value: 'location',
    icon: MapPin,
  },
  {
    label: 'Navegación',
    value: 'navigation',
    icon: Navigation,
  },
] as const
