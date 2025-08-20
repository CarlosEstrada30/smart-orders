import { apiClient } from '../api/client'
import { ApiError } from '../api/config'
import type { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductsListParams 
} from './types'

// Servicio para manejar operaciones de productos
export class ProductsService {
  private readonly baseEndpoint = '/products'

  // Obtener lista de productos
  async getProducts(params: ProductsListParams = {}): Promise<Product[]> {
    try {
      const queryParams: Record<string, string> = {}
      
      if (params.skip !== undefined) queryParams.skip = params.skip.toString()
      if (params.limit !== undefined) queryParams.limit = params.limit.toString()
      if (params.active_only !== undefined) queryParams.active_only = params.active_only.toString()
      if (params.category) queryParams.category = params.category

      return await apiClient.get<Product[]>(this.baseEndpoint, queryParams)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener productos')
    }
  }

  // Obtener un producto por ID
  async getProductById(id: number): Promise<Product> {
    try {
      return await apiClient.get<Product>(`${this.baseEndpoint}/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el producto')
    }
  }

  // Crear un nuevo producto
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      return await apiClient.post<Product>(this.baseEndpoint, productData)
    } catch (error) {
      throw this.handleError(error, 'Error al crear el producto')
    }
  }

  // Actualizar un producto
  async updateProduct(id: number, productData: UpdateProductRequest): Promise<Product> {
    try {
      return await apiClient.put<Product>(`${this.baseEndpoint}/${id}`, productData)
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar el producto')
    }
  }

  // Eliminar un producto
  async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseEndpoint}/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar el producto')
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
export const productsService = new ProductsService() 