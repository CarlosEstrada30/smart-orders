import { apiClient } from '../api/client'
import type { User, UserCreate, UserUpdate, UsersListParams } from './types'
import { roleToBackendFields, backendFieldsToRole } from './role-mapping'

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
    
    const users = await apiClient.get<User[]>(endpoint)
    
    // Agregar rol derivado a cada usuario
    return users.map(user => ({
      ...user,
      role: backendFieldsToRole(user.is_superuser, user.email, (user as any).role)
    }))
  },

  // Obtener un usuario específico
  async getUser(userId: number): Promise<User> {
    const user = await apiClient.get<User>(`/users/${userId}`)
    return {
      ...user,
      role: backendFieldsToRole(user.is_superuser, user.email, (user as any).role)
    }
  },

  // Crear un nuevo usuario
  async createUser(userData: UserCreate): Promise<User> {
    // Mapear rol del frontend a campos del backend
    const backendData = { ...userData }
    
    if (userData.role) {
      const roleFields = roleToBackendFields(userData.role)
      backendData.is_superuser = roleFields.is_superuser
      // Enviar rol en formato UPPERCASE que espera el API
      ;(backendData as any).role = roleFields.role
    }
    
    const createdUser = await apiClient.post<User>('/users/', backendData)
    return {
      ...createdUser,
      role: backendFieldsToRole(createdUser.is_superuser, createdUser.email, (createdUser as any).role)
    }
  },

  // Actualizar un usuario
  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    // Mapear rol del frontend a campos del backend
    const backendData = { ...userData }
    
    if (userData.role) {
      const roleFields = roleToBackendFields(userData.role)
      backendData.is_superuser = roleFields.is_superuser
      // Enviar rol en formato UPPERCASE que espera el API
      ;(backendData as any).role = roleFields.role
    }
    
    const updatedUser = await apiClient.put<User>(`/users/${userId}`, backendData)
    return {
      ...updatedUser,
      role: backendFieldsToRole(updatedUser.is_superuser, updatedUser.email, (updatedUser as any).role)
    }
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
