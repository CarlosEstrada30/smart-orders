import { apiClient } from '../api/client'
import { ApiError } from '../api/config'
import type { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientsListParams 
} from './types'

// Servicio para manejar operaciones de clientes
export class ClientsService {
  private readonly baseEndpoint = '/clients'

  // Obtener lista de clientes
  async getClients(params: ClientsListParams = {}): Promise<Client[]> {
    try {
      const queryParams: Record<string, string> = {}
      
      if (params.skip !== undefined) queryParams.skip = params.skip.toString()
      if (params.limit !== undefined) queryParams.limit = params.limit.toString()
      if (params.active_only !== undefined) queryParams.active_only = params.active_only.toString()

      return await apiClient.get<Client[]>(this.baseEndpoint, queryParams)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener clientes')
    }
  }

  // Obtener un cliente por ID
  async getClientById(id: number): Promise<Client> {
    try {
      return await apiClient.get<Client>(`${this.baseEndpoint}/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el cliente')
    }
  }

  // Crear un nuevo cliente
  async createClient(clientData: CreateClientRequest): Promise<Client> {
    try {
      return await apiClient.post<Client>(this.baseEndpoint, clientData)
    } catch (error) {
      throw this.handleError(error, 'Error al crear el cliente')
    }
  }

  // Actualizar un cliente
  async updateClient(id: number, clientData: UpdateClientRequest): Promise<Client> {
    try {
      return await apiClient.put<Client>(`${this.baseEndpoint}/${id}`, clientData)
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar el cliente')
    }
  }

  // Eliminar un cliente
  async deleteClient(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseEndpoint}/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar el cliente')
    }
  }

  // Método privado para manejar errores
  private handleError(error: unknown, defaultMessage: string): ApiError {
    if (error instanceof ApiError) {
      return error
    }
    
    return new ApiError(
      0,
      defaultMessage,
      error instanceof Error ? error.message : 'Error desconocido'
    )
  }
}

// Instancia singleton del servicio
export const clientsService = new ClientsService() 