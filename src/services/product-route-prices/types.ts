// Tipos basados en la API real
export interface ProductRoutePrice {
  id: number
  product_id: number
  route_id: number
  price: number
  product_name?: string | null
  route_name?: string | null
}

export interface CreateProductRoutePriceRequest {
  product_id: number
  route_id: number
  price: number
}

export interface UpdateProductRoutePriceRequest {
  price?: number
}
