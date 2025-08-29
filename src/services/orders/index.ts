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
  status: OrderStatus
  notes?: string
  total_amount?: number
  created_at?: string
  updated_at?: string
  items: OrderItem[]
  client?: Client
}

export interface OrderCreate {
  client_id: number
  status?: OrderStatus
  notes?: string
  items: OrderItem[]
}

export interface OrderUpdate {
  status?: OrderStatus
  notes?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'

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
  // Obtener todas las órdenes
  async getOrders(params?: {
    skip?: number
    limit?: number
    status_filter?: string
  }): Promise<Order[]> {
    const queryParams = params ? {
      ...(params.skip !== undefined && { skip: params.skip.toString() }),
      ...(params.limit !== undefined && { limit: params.limit.toString() }),
      ...(params.status_filter && { status_filter: params.status_filter })
    } : undefined
    
    return apiClient.get<Order[]>('/orders/', queryParams)
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

  // Actualizar orden completa (incluyendo items)
  async updateOrderComplete(orderId: number, orderData: {
    notes?: string
    items: OrderItem[]
  }): Promise<Order> {
    // Primero actualizar los datos básicos de la orden
    await this.updateOrder(orderId, {
      notes: orderData.notes
    })

    // Obtener la orden actual para ver los items existentes
    const currentOrder = await this.getOrder(orderId)
    
    // Remover todos los items existentes
    for (const item of currentOrder.items) {
      if (item.id) {
        await this.removeOrderItem(orderId, item.id)
      }
    }

    // Agregar los nuevos items
    for (const item of orderData.items) {
      await this.addOrderItem(orderId, {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      })
    }

    // Retornar la orden actualizada
    return this.getOrder(orderId)
  },

  // Eliminar una orden
  async deleteOrder(orderId: number): Promise<void> {
    return apiClient.delete<void>(`/orders/${orderId}`)
  },

  // Actualizar estado de una orden
  async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/status/${newStatus}`)
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
      const token = useAuthStore.getState().auth.accessToken
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/receipt`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Error al descargar el comprobante: ${response.statusText}`)
      }

      const blob = await response.blob()
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
      const token = useAuthStore.getState().auth.accessToken
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/receipt/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Error al obtener vista previa: ${response.statusText}`)
      }

      const blob = await response.blob()
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

  // Verificar si un comprobante existe para una orden
  async checkReceiptExists(orderId: number): Promise<boolean> {
    try {
      // Intentar obtener información del comprobante
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/receipt`, {
        method: 'HEAD', // Solo verificar headers, no descargar contenido
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().auth.accessToken}`,
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Hooks para usar con React Query
export const useOrders = () => {
  return {
    getOrders: (params?: Parameters<typeof ordersService.getOrders>[0]) => 
      ordersService.getOrders(params),
    getOrder: (orderId: number) => ordersService.getOrder(orderId),
    createOrder: (orderData: OrderCreate) => ordersService.createOrder(orderData),
    updateOrder: (orderId: number, orderData: OrderUpdate) => 
      ordersService.updateOrder(orderId, orderData),
    updateOrderComplete: (orderId: number, orderData: Parameters<typeof ordersService.updateOrderComplete>[1]) => 
      ordersService.updateOrderComplete(orderId, orderData),
    deleteOrder: (orderId: number) => ordersService.deleteOrder(orderId),
    updateOrderStatus: (orderId: number, newStatus: OrderStatus) => 
      ordersService.updateOrderStatus(orderId, newStatus),
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
    checkReceiptExists: (orderId: number) => ordersService.checkReceiptExists(orderId)
  }
} 