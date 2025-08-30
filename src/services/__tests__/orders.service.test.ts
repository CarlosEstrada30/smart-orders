/**
 * Tests para Orders Service
 * Verifica las operaciones CRUD de órdenes y funcionalidades específicas
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ordersService, type Order, type OrderCreate, type OrderStatus } from '../orders'
import { mockApiSuccess, mockApiError } from '@/test/setup'

// Mock del apiClient
vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

import { apiClient } from '../api/client'

describe('Orders Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Data mock para tests
  const mockOrder: Order = {
    id: 1,
    order_number: 'ORD-001',
    client_id: 1,
    status: 'pending',
    notes: 'Test order',
    total_amount: 100.50,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    items: [
      {
        id: 1,
        product_id: 1,
        quantity: 2,
        unit_price: 50.25,
        total_price: 100.50,
        product_name: 'Test Product'
      }
    ],
    client: {
      id: 1,
      name: 'Test Client',
      email: 'client@test.com',
      phone: '555-0123',
      nit: '12345678',
      address: '123 Test St',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: null
    }
  }

  const mockOrderCreate: OrderCreate = {
    client_id: 1,
    status: 'pending',
    notes: 'New test order',
    items: [
      {
        product_id: 1,
        quantity: 2,
        unit_price: 50.25
      }
    ]
  }

  describe('getOrders', () => {
    it('should fetch orders without parameters', async () => {
      const mockOrders = [mockOrder]
      vi.mocked(apiClient.get).mockResolvedValue(mockOrders)

      const result = await ordersService.getOrders()

      expect(result).toEqual(mockOrders)
      expect(apiClient.get).toHaveBeenCalledWith('/orders/', undefined)
    })

    it('should fetch orders with parameters', async () => {
      const mockOrders = [mockOrder]
      vi.mocked(apiClient.get).mockResolvedValue(mockOrders)

      const params = { skip: 0, limit: 10, status_filter: 'pending' }
      const result = await ordersService.getOrders(params)

      expect(result).toEqual(mockOrders)
      expect(apiClient.get).toHaveBeenCalledWith('/orders/', {
        skip: '0',
        limit: '10',
        status_filter: 'pending'
      })
    })

    it('should handle undefined parameters correctly', async () => {
      const mockOrders = [mockOrder]
      vi.mocked(apiClient.get).mockResolvedValue(mockOrders)

      const params = { skip: undefined, limit: 5, status_filter: '' }
      const result = await ordersService.getOrders(params)

      expect(result).toEqual(mockOrders)
      expect(apiClient.get).toHaveBeenCalledWith('/orders/', {
        limit: '5'
      })
    })
  })

  describe('getOrder', () => {
    it('should fetch a single order by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockOrder)

      const result = await ordersService.getOrder(1)

      expect(result).toEqual(mockOrder)
      expect(apiClient.get).toHaveBeenCalledWith('/orders/1')
    })

    it('should handle order not found error', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Order not found'))

      await expect(ordersService.getOrder(999)).rejects.toThrow('Order not found')
    })
  })

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const createdOrder = { ...mockOrder, id: 2 }
      vi.mocked(apiClient.post).mockResolvedValue(createdOrder)

      const result = await ordersService.createOrder(mockOrderCreate)

      expect(result).toEqual(createdOrder)
      expect(apiClient.post).toHaveBeenCalledWith('/orders/', mockOrderCreate)
    })

    it('should handle validation errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation failed'))

      await expect(ordersService.createOrder(mockOrderCreate)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateOrder', () => {
    it('should update an existing order', async () => {
      const updateData = { notes: 'Updated notes' }
      const updatedOrder = { ...mockOrder, ...updateData }
      vi.mocked(apiClient.put).mockResolvedValue(updatedOrder)

      const result = await ordersService.updateOrder(1, updateData)

      expect(result).toEqual(updatedOrder)
      expect(apiClient.put).toHaveBeenCalledWith('/orders/1', updateData)
    })
  })

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await ordersService.deleteOrder(1)

      expect(apiClient.delete).toHaveBeenCalledWith('/orders/1')
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const newStatus: OrderStatus = 'confirmed'
      const updatedOrder = { ...mockOrder, status: newStatus }
      vi.mocked(apiClient.post).mockResolvedValue(updatedOrder)

      const result = await ordersService.updateOrderStatus(1, newStatus)

      expect(result).toEqual(updatedOrder)
      expect(apiClient.post).toHaveBeenCalledWith('/orders/1/status/confirmed')
    })

    it('should handle all valid status transitions', async () => {
      const statuses: OrderStatus[] = ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled']
      
      for (const status of statuses) {
        const updatedOrder = { ...mockOrder, status }
        vi.mocked(apiClient.post).mockResolvedValue(updatedOrder)

        const result = await ordersService.updateOrderStatus(1, status)
        expect(result.status).toBe(status)
      }
    })
  })

  describe('addOrderItem', () => {
    it('should add item to order', async () => {
      const newItem = { product_id: 2, quantity: 1, unit_price: 25.00 }
      const updatedOrder = {
        ...mockOrder,
        items: [...mockOrder.items, { ...newItem, id: 2, total_price: 25.00 }]
      }
      vi.mocked(apiClient.post).mockResolvedValue(updatedOrder)

      const result = await ordersService.addOrderItem(1, newItem)

      expect(result).toEqual(updatedOrder)
      expect(apiClient.post).toHaveBeenCalledWith('/orders/1/items', newItem)
    })
  })

  describe('removeOrderItem', () => {
    it('should remove item from order', async () => {
      const updatedOrder = { ...mockOrder, items: [] }
      vi.mocked(apiClient.delete).mockResolvedValue(updatedOrder)

      const result = await ordersService.removeOrderItem(1, 1)

      expect(result).toEqual(updatedOrder)
      expect(apiClient.delete).toHaveBeenCalledWith('/orders/1/items/1')
    })
  })

  describe('getOrdersByClient', () => {
    it('should fetch orders by client ID', async () => {
      const clientOrders = [mockOrder]
      vi.mocked(apiClient.get).mockResolvedValue(clientOrders)

      const result = await ordersService.getOrdersByClient(1)

      expect(result).toEqual(clientOrders)
      expect(apiClient.get).toHaveBeenCalledWith('/orders/client/1', undefined)
    })

    it('should fetch orders by client ID with pagination', async () => {
      const clientOrders = [mockOrder]
      vi.mocked(apiClient.get).mockResolvedValue(clientOrders)

      const params = { skip: 10, limit: 5 }
      const result = await ordersService.getOrdersByClient(1, params)

      expect(result).toEqual(clientOrders)
      expect(apiClient.get).toHaveBeenCalledWith('/orders/client/1', {
        skip: '10',
        limit: '5'
      })
    })
  })

  describe('updateOrderComplete', () => {
    it('should update order completely including items', async () => {
      // Mock para obtener orden actual
      vi.mocked(apiClient.get).mockResolvedValue(mockOrder)
      // Mock para actualizar orden
      vi.mocked(apiClient.put).mockResolvedValue(mockOrder)
      // Mock para remover items existentes
      vi.mocked(apiClient.delete).mockResolvedValue(mockOrder)
      // Mock para agregar nuevos items
      vi.mocked(apiClient.post).mockResolvedValue(mockOrder)

      const updateData = {
        notes: 'Completely updated order',
        items: [
          { product_id: 2, quantity: 3, unit_price: 30.00 }
        ]
      }

      const result = await ordersService.updateOrderComplete(1, updateData)

      expect(result).toEqual(mockOrder)
      // Verificar que se llamaron todos los métodos necesarios
      expect(apiClient.put).toHaveBeenCalledWith('/orders/1', { notes: updateData.notes })
      expect(apiClient.get).toHaveBeenCalledWith('/orders/1')
    })
  })

  describe('Receipt functions', () => {
    it('should check if receipt exists', async () => {
      // Mock fetch para HEAD request específicamente para este test
      (global.fetch as any).mockResolvedValueOnce({ 
        ok: true,
        status: 200,
        headers: new Headers()
      })

      const result = await ordersService.checkReceiptExists(1)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders/1/receipt'),
        expect.objectContaining({ 
          method: 'HEAD',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      )
    })

    it('should return false when receipt does not exist', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      const result = await ordersService.checkReceiptExists(1)

      expect(result).toBe(false)
    })

    it('should handle receipt check network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await ordersService.checkReceiptExists(1)

      expect(result).toBe(false)
    })

    it('should generate receipt URL correctly', () => {
      const url = ordersService.getReceiptPreviewUrl(1)
      expect(url).toBe('http://localhost:8000/api/v1/orders/1/receipt/preview')
    })
  })

  describe('Error handling', () => {
    it('should propagate API errors', async () => {
      const apiError = new Error('API Error')
      vi.mocked(apiClient.get).mockRejectedValue(apiError)

      await expect(ordersService.getOrders()).rejects.toThrow('API Error')
    })

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error')
      vi.mocked(apiClient.post).mockRejectedValue(networkError)

      await expect(ordersService.createOrder(mockOrderCreate)).rejects.toThrow('Network Error')
    })
  })
})
