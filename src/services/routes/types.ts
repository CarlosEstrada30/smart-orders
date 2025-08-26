// Tipos para el servicio de rutas
export interface Route {
  id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface CreateRouteRequest {
  name: string
}

export interface UpdateRouteRequest {
  name?: string | null
  is_active?: boolean | null
}

export interface RoutesListParams {
  skip?: number
  limit?: number
  active_only?: boolean
  search?: string
}
