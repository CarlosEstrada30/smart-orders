import { Building } from 'lucide-react'
import type { Company } from './schema'

// Iconos para estados de empresa
export const companyStatuses = [
  {
    value: 'active',
    label: 'Activa',
    icon: Building,
  },
  {
    value: 'inactive',
    label: 'Inactiva',
    icon: Building,
  },
]

// Filtros adicionales para mostrar empresas
export const companyFilters = [
  {
    value: 'active_only',
    label: 'Solo activas',
  },
  {
    value: 'show_all',
    label: 'Incluir inactivas',
  },
]

// Tipos de empresa
export const companyTypes = [
  {
    value: 'production',
    label: 'Producción',
  },
  {
    value: 'trial',
    label: 'Prueba',
  },
]

// Datos de ejemplo para desarrollo (se eliminarán cuando se conecte a la API real)
export const mockCompanies: Company[] = [
  {
    id: '1',
    nombre: 'Smart Orders',
    subdominio: 'smart-orders',
    token: 'smart-orders-token-123',
    schema_name: 'smart-orders_schema',
    created_at: '2024-01-15T10:30:00Z',
    active: true,
    is_trial: false,
    status: 'active',
    url: 'smart-orders.localhost:3000'
  },
  {
    id: '2',
    nombre: 'Panadería El Sol',
    subdominio: 'panaderia-sol',
    token: 'sol-token-456',
    schema_name: 'panaderia_sol_schema',
    created_at: '2024-02-20T14:15:00Z',
    active: true,
    is_trial: true,
    status: 'active',
    url: 'panaderia-sol.localhost:3000'
  },
  {
    id: '3',
    nombre: 'Ferretería Central',
    subdominio: 'ferreteria',
    token: 'ferreteria-token-789',
    schema_name: 'ferreteria_schema',
    created_at: '2024-03-10T09:45:00Z',
    active: false,
    is_trial: false,
    status: 'inactive',
    url: 'ferreteria.localhost:3000'
  }
]
