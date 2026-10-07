import { Route, MapPin, Navigation } from 'lucide-react'
import { type RouteStatus } from './schema'

export const routeStatusTypes = new Map<RouteStatus, string>([
  ['active', 'bg-primary/15 text-primary  border-primary/30'],
  ['inactive', 'bg-muted-foreground border-border'],
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
