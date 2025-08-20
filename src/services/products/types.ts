// Tipos para el servicio de productos
export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  sku: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  stock: number
  sku: string
}

export interface UpdateProductRequest {
  name: string
  description: string
  price: number
  stock: number
  sku: string
}

export interface ProductsListParams {
  skip?: number
  limit?: number
  active_only?: boolean
  category?: string
} 