// Exportar configuración de la API
export { API_CONFIG, ApiError } from './api/config'
export { apiClient } from './api/client'

// Exportar servicios
export { clientsService } from './clients'
export { productsService } from './products'

// Exportar tipos
export type { Client, CreateClientRequest, UpdateClientRequest, ClientsListParams } from './clients'
export type { Product, CreateProductRequest, UpdateProductRequest, ProductsListParams } from './products' 