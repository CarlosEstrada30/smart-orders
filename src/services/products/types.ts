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
  route_prices?: RoutePrice[]
}

export interface RoutePrice {
  product_id: number
  route_id: number
  price: number
  route_name: string
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

// Parámetros para exportación de productos
export interface ProductsExportParams {
  active_only?: boolean
  skip?: number
  limit?: number
}

// Tipos para carga masiva de productos
export interface BulkUploadError {
  row: number
  field: string
  error: string
}

export interface ProductBulkUploadResult {
  total_rows: number
  successful_uploads: number
  failed_uploads: number
  success_rate: number
  errors: BulkUploadError[]
  created_products: Array<{
    id: number
    name: string
    sku: string
    row: number
  }>
} 