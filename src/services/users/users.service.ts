import { apiClient } from '../api/client'
import type { User, UserCreate, UserUpdate, UsersListParams } from './types'

// Servicio de usuarios
export const usersService = {
  // Obtener todos los usuarios
  async getUsers(params?: UsersListParams): Promise<User[]> {
    const queryParams = new URLSearchParams()
    
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString())
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString())
    }
    
    const query = queryParams.toString()
    const endpoint = query ? `/users/?${query}` : '/users/'
    
    return apiClient.get<User[]>(endpoint)
  },

  // Obtener un usuario específico
  async getUser(userId: number): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`)
  },

  // Crear un nuevo usuario
  async createUser(userData: UserCreate): Promise<User> {
    return apiClient.post<User>('/users/', userData)
  },

  // Actualizar un usuario
  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    return apiClient.put<User>(`/users/${userId}`, userData)
  },

  // Eliminar un usuario
  async deleteUser(userId: number): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}`)
  }
}

// Hooks para usar con React Query
export const useUsers = () => {
  return {
    getUsers: (params?: UsersListParams) => usersService.getUsers(params),
    getUser: (userId: number) => usersService.getUser(userId),
    createUser: (userData: UserCreate) => usersService.createUser(userData),
    updateUser: (userId: number, userData: UserUpdate) => 
      usersService.updateUser(userId, userData),
    deleteUser: (userId: number) => usersService.deleteUser(userId)
  }
}
