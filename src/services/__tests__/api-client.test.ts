/**
 * Tests para API Client - Versión Simplificada
 * Verifica que el cliente HTTP maneje correctamente requests, responses y errores
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient } from '../api/client'
import { ApiError } from '../api/config'

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Successful requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test Order' }
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      const result = await apiClient.get('/orders/1')
      
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders/1'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should make successful POST request', async () => {
      const requestData = { client_id: 1, items: [] }
      const responseData = { id: 1, ...requestData }
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      const result = await apiClient.post('/orders', requestData)
      
      expect(result).toEqual(responseData)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({ 
          method: 'POST',
          body: JSON.stringify(requestData)
        })
      )
    })

    it('should handle 204 No Content response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      })

      const result = await apiClient.delete('/orders/1')
      
      expect(result).toBeNull()
    })
  })

  describe('Error handling', () => {
    it('should throw ApiError for HTTP errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ detail: 'Order not found' }),
        headers: new Headers(),
      })

      await expect(apiClient.get('/orders/999')).rejects.toThrow(ApiError)
    })

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiClient.get('/orders')).rejects.toThrow(ApiError)
    })

    it('should handle malformed JSON responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Invalid JSON') },
        headers: new Headers(),
      })

      await expect(apiClient.get('/orders')).rejects.toThrow(ApiError)
    })
  })

  describe('Request configuration', () => {
    it('should use correct base URL', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers(),
      })

      await apiClient.get('/test')
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8000/api/v1/test'),
        expect.any(Object)
      )
    })

    it('should set Content-Type header for POST requests', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers(),
      })

      await apiClient.post('/orders', {})
      
      const callArgs = (global.fetch as any).mock.calls[0]
      expect(callArgs[1].headers['Content-Type']).toBe('application/json')
    })

    it('should handle query parameters correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers: new Headers(),
      })

      await apiClient.get('/orders', { status: 'pending', limit: '10' })
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=pending&limit=10'),
        expect.any(Object)
      )
    })
  })

  describe('ApiError class', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError(404, 'Not found', 'Custom message')
      
      expect(error.status).toBe(404)
      expect(error.detail).toBe('Not found')
      expect(error.message).toBe('Custom message')
      expect(error.name).toBe('ApiError')
    })

    it('should identify error types correctly', () => {
      expect(new ApiError(0, 'Network').isNetworkError()).toBe(true)
      expect(new ApiError(400, 'Bad request').isClientError()).toBe(true)
      expect(new ApiError(401, 'Unauthorized').isAuthError()).toBe(true)
      expect(new ApiError(403, 'Forbidden').isAuthError()).toBe(true)
      expect(new ApiError(422, 'Validation').isValidationError()).toBe(true)
      expect(new ApiError(500, 'Server error').isNetworkError()).toBe(true)
    })
  })
})