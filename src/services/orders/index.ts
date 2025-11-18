import { apiClient } from '../api/client'
import { API_CONFIG } from '../api/config'
import { useAuthStore } from '@/stores/auth-store'

// Tipos basados en la API de Smart Orders
export interface OrderItem {
  id?: number
  product_id: number
  quantity: number
  unit_price: number
  total_price?: number
  product_name?: string
  product_sku?: string
  product_description?: string
}

// Parámetros para filtrado y paginación de órdenes
export interface OrdersQueryParams {
  skip?: number
  limit?: number
  status_filter?: string
  route_id?: number
  date_from?: string
  date_to?: string
  search?: string
}

// Información de paginación mejorada del backend
export interface PaginationInfo {
  total: number          // Total de registros disponibles
  count: number          // Registros en página actual
  page: number           // Página actual
  pages: number          // Total de páginas
  per_page: number       // Registros por página
  has_next: boolean      // ¿Hay página siguiente?
  has_previous: boolean  // ¿Hay página anterior?
}

// Respuesta paginada del backend
export interface OrdersResponse {
  items: Order[]
  pagination: PaginationInfo
}

export interface Client {
  id: number
  name: string
  email: string | null
  phone: string | null
  nit: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface Order {
  id?: number
  order_number?: string
  client_id: number
  route_id?: number
  status: OrderStatus
  discount_amount?: number
  notes?: string
  total_amount?: number
  created_at?: string
  updated_at?: string
  items: OrderItem[]
  client?: Client
}

export interface OrderCreate {
  client_id: number
  route_id?: number
  status?: OrderStatus
  discount_amount?: number
  notes?: string
  items: OrderItem[]
}

export interface OrderUpdate {
  status?: OrderStatus
  notes?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'

// Tipos para respuesta de cambio masivo de estados
export interface ProductUpdateDetail {
  product_id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
}

export interface ProductErrorDetail {
  product_id: number
  product_name: string
  product_sku: string
  error_type: 'product_not_found' | 'product_inactive' | 'insufficient_stock'
  error_message: string
  required_quantity?: number
  available_quantity?: number
}

export interface SuccessOrderDetail {
  order_id: number
  order_number: string | null
  products_updated: ProductUpdateDetail[]
}

export interface FailedOrderDetail {
  order_id: number
  order_number: string | null
  error_type: 'order_not_found' | 'order_inactive' | 'invalid_status' | 'product_errors' | 'stock_validation_failed'
  error_message: string
  products_with_errors: ProductErrorDetail[]
}

export interface BulkOrderStatusResponse {
  updated_count: number
  failed_count: number
  total_orders: number
  status: OrderStatus
  failed_orders: number[]
  success_orders: number[]
  success_details: SuccessOrderDetail[]
  failed_details: FailedOrderDetail[]
}

// Tipos para respuestas de receipt/comprobante
export interface ReceiptGenerateResponse {
  message: string
  pdf_path?: string
  success: boolean
}

export interface ReceiptDownloadResponse {
  file: Blob
  filename: string
}

export interface ReceiptPreviewConfig {
  orderId: number
  previewUrl: string
  downloadUrl: string
}

export interface ReceiptPreviewBlob {
  url: string
  cleanup: () => void
}

// Servicio de órdenes
export const ordersService = {
  // Obtener todas las órdenes con filtrado y paginación
  async getOrders(params?: OrdersQueryParams): Promise<OrdersResponse> {
    const queryParams = params ? {
      ...(params.skip !== undefined && { skip: params.skip.toString() }),
      ...(params.limit !== undefined && { limit: params.limit.toString() }),
      ...(params.status_filter && { status_filter: params.status_filter }),
      ...(params.route_id !== undefined && { route_id: params.route_id.toString() }),
      ...(params.date_from && { date_from: params.date_from }),
      ...(params.date_to && { date_to: params.date_to }),
      ...(params.search && { search: params.search })
    } : undefined
    
    const response = await apiClient.get<any>('/orders/', queryParams)
    
    // Verificar si la respuesta usa la nueva estructura con items y pagination
    if (response && response.items && response.pagination) {
      // Nueva estructura del backend
      return {
        items: Array.isArray(response.items) ? response.items : [],
        pagination: {
          total: response.pagination.total || 0,
          count: response.pagination.count || 0,
          page: response.pagination.page || 1,
          pages: response.pagination.pages || 1,
          per_page: response.pagination.per_page || (params?.limit || 10),
          has_next: response.pagination.has_next || false,
          has_previous: response.pagination.has_previous || false
        }
      }
    } else if (Array.isArray(response)) {
      // Formato legacy: array directo
      return {
        items: response,
        pagination: {
          total: response.length,
          count: response.length,
          page: 1,
          pages: 1,
          per_page: response.length,
          has_next: false,
          has_previous: false
        }
      }
    } else if (response && response.data) {
      // Formato legacy: objeto con data
      return {
        items: Array.isArray(response.data) ? response.data : [],
        pagination: {
          total: response.total || 0,
          count: response.data.length,
          page: response.page || 1,
          pages: response.pages || 1,
          per_page: response.size || (params?.limit || 10),
          has_next: (response.page || 1) < (response.pages || 1),
          has_previous: (response.page || 1) > 1
        }
      }
    } else {
      // Fallback seguro
      return {
        items: [],
        pagination: {
          total: 0,
          count: 0,
          page: 1,
          pages: 1,
          per_page: params?.limit || 10,
          has_next: false,
          has_previous: false
        }
      }
    }
  },

  // Obtener una orden por ID
  async getOrder(orderId: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`)
  },

  // Crear una nueva orden
  async createOrder(orderData: OrderCreate): Promise<Order> {
    return apiClient.post<Order>('/orders/', orderData)
  },

  // Actualizar una orden
  async updateOrder(orderId: number, orderData: OrderUpdate): Promise<Order> {
    return apiClient.put<Order>(`/orders/${orderId}`, orderData)
  },

  // Actualizar orden completa (incluyendo items) - para órdenes PENDING
  async updateOrderComplete(orderId: number, orderData: {
    client_id?: number
    route_id?: number
    discount_amount?: number
    notes?: string
    items: OrderItem[]
  }): Promise<Order> {
    // Usar el endpoint PUT directo con OrderFullUpdate para órdenes PENDING
    const fullUpdateData: Record<string, any> = {}
    
    if (orderData.client_id !== undefined) {
      fullUpdateData.client_id = orderData.client_id
    }
    if (orderData.route_id !== undefined) {
      fullUpdateData.route_id = orderData.route_id
    }
    if (orderData.discount_amount !== undefined) {
      fullUpdateData.discount_amount = orderData.discount_amount
    }
    if (orderData.notes !== undefined) {
      fullUpdateData.notes = orderData.notes
    }
    if (orderData.items && orderData.items.length > 0) {
      // Convertir OrderItem[] a OrderItemCreate[] para la API
      fullUpdateData.items = orderData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    }

    return apiClient.put<Order>(`/orders/${orderId}`, fullUpdateData)
  },

  // Eliminar una orden
  async deleteOrder(orderId: number): Promise<void> {
    return apiClient.delete<void>(`/orders/${orderId}`)
  },

  // Actualizar estado de una orden
  async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/status/${newStatus}`)
  },

  // Actualizar estado de múltiples órdenes
  async updateBulkOrderStatus(orderIds: number[], newStatus: OrderStatus): Promise<BulkOrderStatusResponse> {
    return apiClient.put<BulkOrderStatusResponse>('/orders/bulk-status', {
      order_ids: orderIds,
      status: newStatus
    })
  },

  // Agregar item a una orden
  async addOrderItem(orderId: number, item: OrderItem): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/items`, item)
  },

  // Remover item de una orden
  async removeOrderItem(orderId: number, itemId: number): Promise<Order> {
    return apiClient.delete<Order>(`/orders/${orderId}/items/${itemId}`)
  },

  // Obtener órdenes por cliente
  async getOrdersByClient(clientId: number, params?: {
    skip?: number
    limit?: number
  }): Promise<Order[]> {
    const queryParams = params ? {
      ...(params.skip !== undefined && { skip: params.skip.toString() }),
      ...(params.limit !== undefined && { limit: params.limit.toString() })
    } : undefined
    
    return apiClient.get<Order[]>(`/orders/client/${clientId}`, queryParams)
  },

  // ===== FUNCIONES DE COMPROBANTES/RECEIPTS =====
  
  // Descargar comprobante de orden como PDF
  async downloadReceipt(orderId: number): Promise<void> {
    try {
      const blob = await apiClient.downloadFile(`/orders/${orderId}/receipt`)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `order-${orderId}-receipt.pdf`)
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error('Error al descargar el comprobante')
    }
  },

  // Obtener blob del comprobante para preview
  async getReceiptPreviewBlob(orderId: number): Promise<string> {
    try {
      const blob = await apiClient.downloadFile(`/orders/${orderId}/receipt/preview`)
      const url = window.URL.createObjectURL(blob)
      return url
    } catch (error) {
      throw new Error('Error al obtener vista previa del comprobante')
    }
  },

  // Obtener URL para previsualizar en ventana nueva (fallback)
  getReceiptPreviewUrl(orderId: number): string {
    // Esta función ahora abre en ventana nueva con manejo de auth
    return `${API_CONFIG.BASE_URL}/orders/${orderId}/receipt/preview`
  },

  // Generar archivo PDF del comprobante
  async generateReceipt(orderId: number): Promise<ReceiptGenerateResponse> {
    const response = await apiClient.post<any>(`/orders/${orderId}/receipt/generate`)
    return {
      message: response?.message || 'Comprobante generado exitosamente',
      pdf_path: response?.pdf_path,
      success: true
    }
  },

  // Enviar comprobante por WhatsApp
  async sendReceiptByWhatsApp(orderId: number): Promise<void> {
    await apiClient.post(`/orders/${orderId}/receipt/send-whatsapp`)
  },

  // Verificar si un comprobante existe para una orden
  async checkReceiptExists(orderId: number): Promise<boolean> {
    try {
      // Usar apiClient para obtener headers con X-Timezone, pero hacer HEAD request
      const headers = apiClient.getPublicHeaders()
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/receipt`, {
        method: 'HEAD', // Solo verificar headers, no descargar contenido
        headers
      })
      return response.ok
    } catch {
      return false
    }
  },

  // ===== FUNCIONES DE REPORTE PDF PARA RUTEROS =====

  // Obtener blob del reporte para vista previa
async getOrdersReportPreviewBlob(params?: OrdersQueryParams): Promise<string> {
    try {
      // Construir query params para el endpoint
      const queryParams: Record<string, string> = {}
      if (params?.status_filter) queryParams.status_filter = params.status_filter
      if (params?.route_id) queryParams.route_id = params.route_id.toString()
      if (params?.date_from) queryParams.date_from = params.date_from
      if (params?.date_to) queryParams.date_to = params.date_to
      if (params?.search) queryParams.search = params.search

      const blob = await apiClient.downloadFile('/orders/report/pdf', queryParams)
      const url_blob = window.URL.createObjectURL(blob)
      return url_blob
    } catch (error) {
      throw new Error('Error al obtener vista previa del reporte de órdenes')
    }
  },

  // Descargar reporte PDF de órdenes para ruteros
  async downloadOrdersReport(params?: OrdersQueryParams): Promise<void> {
    try {
      // Construir query params para el endpoint
      const queryParams: Record<string, string> = {}
      if (params?.status_filter) queryParams.status_filter = params.status_filter
      if (params?.route_id) queryParams.route_id = params.route_id.toString()
      if (params?.date_from) queryParams.date_from = params.date_from
      if (params?.date_to) queryParams.date_to = params.date_to
      if (params?.search) queryParams.search = params.search

      const blob = await apiClient.downloadFile('/orders/report/pdf', queryParams)
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      
      // Generar nombre del archivo con fecha actual
      const currentDate = new Date().toISOString().split('T')[0]
      link.setAttribute('download', `reporte-ordenes-ruteros-${currentDate}.pdf`)
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      throw new Error('Error al descargar el reporte de órdenes')
    }
  }
}

// Hooks para usar con React Query
export const useOrders = () => {
  return {
    getOrders: (params?: OrdersQueryParams) => ordersService.getOrders(params),
    getOrder: (orderId: number) => ordersService.getOrder(orderId),
    createOrder: (orderData: OrderCreate) => ordersService.createOrder(orderData),
    updateOrder: (orderId: number, orderData: OrderUpdate) => 
      ordersService.updateOrder(orderId, orderData),
    updateOrderComplete: (orderId: number, orderData: Parameters<typeof ordersService.updateOrderComplete>[1]) => 
      ordersService.updateOrderComplete(orderId, orderData),
    deleteOrder: (orderId: number) => ordersService.deleteOrder(orderId),
    updateOrderStatus: (orderId: number, newStatus: OrderStatus) => 
      ordersService.updateOrderStatus(orderId, newStatus),
    updateBulkOrderStatus: (orderIds: number[], newStatus: OrderStatus) => 
      ordersService.updateBulkOrderStatus(orderIds, newStatus),
    addOrderItem: (orderId: number, item: OrderItem) => 
      ordersService.addOrderItem(orderId, item),
    removeOrderItem: (orderId: number, itemId: number) => 
      ordersService.removeOrderItem(orderId, itemId),
    getOrdersByClient: (clientId: number, params?: Parameters<typeof ordersService.getOrdersByClient>[1]) => 
      ordersService.getOrdersByClient(clientId, params),
    
    // Receipt functions
    downloadReceipt: (orderId: number) => ordersService.downloadReceipt(orderId),
    getReceiptPreviewUrl: (orderId: number) => ordersService.getReceiptPreviewUrl(orderId),
    getReceiptPreviewBlob: (orderId: number) => ordersService.getReceiptPreviewBlob(orderId),
    generateReceipt: (orderId: number) => ordersService.generateReceipt(orderId),
    checkReceiptExists: (orderId: number) => ordersService.checkReceiptExists(orderId),
    
    // Report functions
    getOrdersReportPreviewBlob: (params?: OrdersQueryParams) => ordersService.getOrdersReportPreviewBlob(params),
    downloadOrdersReport: (params?: OrdersQueryParams) => ordersService.downloadOrdersReport(params)
  }
} 