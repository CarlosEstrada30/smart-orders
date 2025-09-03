import { apiClient } from '../api/client'
import { 
  Company, 
  CompanyCreate, 
  CompanyUpdate, 
  CompaniesListParams, 
  CompaniesListResponse 
} from './types'

/**
 * Servicio para gestión de empresas/tenants
 * Solo disponible para superusuarios en dominio principal
 */
export const companiesService = {
  /**
   * Obtener lista de empresas
   */
  async getCompanies(params?: CompaniesListParams): Promise<CompaniesListResponse> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by)
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order)
    if (params?.show_inactive) searchParams.set('show_inactive', 'true')

    const queryString = searchParams.toString()
    const url = queryString ? `/tenants/?${queryString}` : '/tenants/'

    return apiClient.get<Company[]>(url).then(items => ({
      items,
      total: items.length, // La API actual no devuelve paginación completa
      page: params?.page || 1,
      limit: params?.limit || 50,
      total_pages: 1
    }))
  },

  /**
   * Crear nueva empresa
   */
  async createCompany(data: CompanyCreate): Promise<Company> {
    return apiClient.post<Company>('/tenants/', data)
  },

  /**
   * Obtener empresa por ID
   */
  async getCompany(id: string): Promise<Company> {
    return apiClient.get<Company>(`/tenants/${id}`)
  },

  /**
   * Actualizar empresa
   */
  async updateCompany(id: string, data: CompanyUpdate): Promise<Company> {
    return apiClient.put<Company>(`/tenants/${id}`, data)
  },

  /**
   * Desactivar empresa (soft delete)
   */
  async deactivateCompany(id: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${id}`)
  },

  /**
   * Restaurar empresa inactiva
   */
  async restoreCompany(id: string): Promise<Company> {
    return apiClient.post<Company>(`/tenants/${id}/restore`)
  },

  /**
   * Eliminar empresa permanentemente (cuidado - destructivo)
   */
  async permanentDeleteCompany(id: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${id}/permanent`)
  },

  /**
   * Verificar si un subdominio está disponible
   */
  async checkSubdomainAvailability(subdomain: string): Promise<{ available: boolean }> {
    // Por ahora retornamos true, pero esto podría ser un endpoint específico
    // en el backend para validar disponibilidad
    return Promise.resolve({ available: true })
  }
}
