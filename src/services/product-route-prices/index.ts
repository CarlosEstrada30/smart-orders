// Exportar tipos
export type {
  ProductRoutePrice,
  CreateProductRoutePriceRequest,
  UpdateProductRoutePriceRequest,
} from './types'

// Exportar servicio
export { productRoutePricesService } from './product-route-prices.service'

// Hook para usar con React Query
export const useProductRoutePrices = () => {
  return {
    getProductRoutePrices: (productId: number) => productRoutePricesService.getProductRoutePrices(productId),
    createProductRoutePrice: (data: CreateProductRoutePriceRequest) => productRoutePricesService.createProductRoutePrice(data),
    updateProductRoutePrice: (routePriceId: number, data: UpdateProductRoutePriceRequest) => 
      productRoutePricesService.updateProductRoutePrice(routePriceId, data),
    deleteProductRoutePrice: (productId: number, routeId: number) => 
      productRoutePricesService.deleteProductRoutePrice(productId, routeId),
    getProductRoutePrice: (routePriceId: number) => 
      productRoutePricesService.getProductRoutePrice(routePriceId),
    getAllProductRoutePrices: (skip?: number, limit?: number) => 
      productRoutePricesService.getAllProductRoutePrices(skip, limit),
  }
}
