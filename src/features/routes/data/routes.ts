import { type Route } from './schema'

// Datos de ejemplo para rutas (para desarrollo)
export const sampleRoutes: Route[] = [
  {
    id: 1,
    name: 'Ruta Norte',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Ruta Sur',
    is_active: true,
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
  },
  {
    id: 3,
    name: 'Ruta Centro',
    is_active: false,
    created_at: '2024-01-17T12:00:00Z',
    updated_at: '2024-01-20T14:00:00Z',
  },
  {
    id: 4,
    name: 'Ruta Oeste',
    is_active: true,
    created_at: '2024-01-18T13:00:00Z',
    updated_at: null,
  },
]
