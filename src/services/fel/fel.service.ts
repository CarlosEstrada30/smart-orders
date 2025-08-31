/**
 * FEL Service - Facturación Electrónica Guatemala
 * Maneja toda la lógica de facturación fiscal con SAT
 */

import { apiClient } from '@/services/api/client'
import type {
  FELInvoice,
  FELStatusSummary,
  FiscalRevenueMetrics,
  CreateFELInvoiceRequest,
  CreateReceiptRequest,
  RetryFELRequest,
  RecordPaymentRequest,
  FELProcessResponse,
  OrderWithInvoiceInfo,
  InvoiceFilters,
  FELStatus,
  DocumentType,
} from './types'

class FELService {
  
  // ========================================
  // CREACIÓN DE DOCUMENTOS
  // ========================================
  
  /**
   * Crea una factura FEL válida fiscalmente
   * Procesa con SAT y obtiene UUID
   */
  async createFELInvoice(request: CreateFELInvoiceRequest): Promise<FELProcessResponse> {
    const response = await apiClient.post(
      `/invoices/orders/${request.order_id}/auto-invoice-with-fel`,
      {
        requires_fel: true,
        payment_method: request.payment_method,
        due_date: request.due_date,
        notes: request.notes,
        payment_terms: request.payment_terms || 'Pago contra entrega'
      },
      {
        params: { certifier: request.certifier || 'digifact' }
      }
    )
    
    // Mapear respuesta a FELProcessResponse
    const invoice = response
    return {
      success: true,
      invoice_id: invoice.id,
      status: invoice.status,
      fel_uuid: invoice.fel_uuid,
      dte_number: invoice.dte_number,
      fel_series: invoice.fel_series,
      fel_number: invoice.fel_number,
      error_message: invoice.fel_error_message,
      processed_at: new Date().toISOString(),
      certifier: request.certifier || 'digifact'
    }
  }
  
  /**
   * Genera comprobante sin valor fiscal
   * Descarga PDF inmediata
   */
  async createReceipt(request: CreateReceiptRequest): Promise<Blob> {
    const response = await apiClient.post<Blob>(
      `/invoices/orders/${request.order_id}/receipt-only`,
      {
        notes: request.notes,
        payment_terms: request.payment_terms || 'Comprobante sin valor fiscal'
      },
      {
        responseType: 'blob'
      }
    )
    
    return response
  }
  
  // ========================================
  // GESTIÓN DE ESTADO FEL
  // ========================================
  
  /**
   * Obtiene el resumen de estado FEL para dashboard
   */
  async getFELStatusSummary(): Promise<FELStatusSummary> {
    try {
      return await apiClient.get<FELStatusSummary>('/invoices/fel/status-summary')
    } catch (error) {
      console.error('Error fetching FEL status summary:', error)
      // Retornar estructura mínima válida sin datos simulados
      return {
        total_invoices: 0,
        fel_invoices: 0,
        receipt_only: 0,
        fel_authorized: 0,
        fel_processing: 0,
        fel_failed: 0,
        fel_pending: 0,
        common_errors: [],
        last_updated: new Date().toISOString()
      }
    }
  }
  
  /**
   * Reintenta procesamiento FEL para factura fallida
   */
  async retryFELProcessing(request: RetryFELRequest): Promise<FELProcessResponse> {
    const response = await apiClient.post(
      `/invoices/fel/retry-failed`,
      {},
      {
        params: { certifier: request.certifier || 'digifact' }
      }
    )
    
    return {
      success: true,
      invoice_id: request.invoice_id,
      status: 'fel_pending' as any,
      fel_uuid: null,
      dte_number: null,
      fel_series: null,
      fel_number: null,
      error_message: null,
      processed_at: new Date().toISOString(),
      certifier: request.certifier || 'digifact'
    }
  }
  
  /**
   * Verifica estado actual de una factura FEL específica
   * Usado para polling durante procesamiento
   */
  async checkFELStatus(invoiceId: number): Promise<{ fel_status: FELStatus; fel_uuid?: string; fel_error_message?: string }> {
    const response = await apiClient.get(`/invoices/${invoiceId}`)
    const invoice = response
    
    return {
      fel_status: this.mapInvoiceStatusToFELStatus(invoice.status),
      fel_uuid: invoice.fel_uuid,
      fel_error_message: invoice.fel_error_message
    }
  }

  private mapInvoiceStatusToFELStatus(status: string): FELStatus {
    switch (status) {
      case 'fel_authorized': return 'authorized'
      case 'fel_pending': return 'pending'
      case 'fel_rejected': return 'error'
      case 'ISSUED': return 'authorized'
      default: return 'pending'
    }
  }
  
  // ========================================
  // MÉTRICAS Y REPORTES
  // ========================================
  
  /**
   * Obtiene métricas de ingresos fiscales
   */
  async getFiscalRevenueMetrics(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<FiscalRevenueMetrics> {
    const today = new Date()
    let startDate: string, endDate: string
    
    switch (period) {
      case 'today':
        startDate = today.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(today.setDate(today.getDate() - 7))
        startDate = weekStart.toISOString().split('T')[0]
        endDate = new Date().toISOString().split('T')[0]
        break
      case 'year':
        startDate = `${today.getFullYear()}-01-01`
        endDate = new Date().toISOString().split('T')[0]
        break
      case 'month':
      default:
        startDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-01`
        endDate = new Date().toISOString().split('T')[0]
        break
    }
    
    try {
      return await apiClient.get<FiscalRevenueMetrics>(
        `/invoices/revenue/fiscal?start_date=${startDate}&end_date=${endDate}`
      )
    } catch (error) {
      console.error('Error fetching fiscal revenue metrics:', error)
      // Retornar estructura mínima válida sin datos simulados
      return {
        period: period,
        start_date: startDate,
        end_date: endDate,
        total_revenue: 0,
        fel_revenue: 0,
        receipt_revenue: 0,
        total_invoices: 0,
        fel_invoices: 0,
        receipts: 0,
        average_ticket: 0,
        growth_percentage: 0,
        top_clients: []
      }
    }
  }
  
  /**
   * Obtiene órdenes que pueden generar documentos
   * (DELIVERED sin factura)
   */
  async getOrdersWithoutDocument(): Promise<OrderWithoutDocument[]> {
    try {
      // Usar endpoint de órdenes existente filtrando por delivered
      const response = await apiClient.get<any[]>(`/orders/?status_filter=delivered&limit=50`)
      
      // Verificar si hay datos válidos - apiClient devuelve directamente el array
      if (!response || !Array.isArray(response)) {
        console.warn('getOrdersWithoutDocument: No data returned from API, using empty array')
        return []
      }
      
      return response.map((order: any): OrderWithoutDocument => ({
        id: order.id,
        order_number: order.order_number,
        client_id: order.client_id,
        status: 'delivered', // Solo órdenes delivered llegan aquí
        total_amount: order.total_amount || 0,
        delivery_date: order.updated_at || order.created_at, // Usar updated_at como fecha de entrega
        created_at: order.created_at,
        updated_at: order.updated_at,
        client: {
          id: order.client?.id || 0,
          name: order.client?.name || 'Cliente desconocido',
          nit: order.client?.nit || null,
          address: order.client?.address || '',
          email: order.client?.email || '',
          phone: order.client?.phone || ''
        },
        can_create_invoice: true,
        suggested_document_type: (order.client?.nit && order.client.nit.length >= 8 && order.client.nit !== 'C/F') 
          ? 'invoice' as DocumentType 
          : 'receipt' as DocumentType
      }))
    } catch (error) {
      console.error('Error fetching orders without document:', error)
      // Retornar array vacío sin datos simulados
      return []
    }
  }
  
  /**
   * Obtiene facturas que fallaron en FEL y pueden reintentarse
   */
  async getFailedFELInvoices(): Promise<FELInvoice[]> {
    try {
      const response = await apiClient.get('/invoices/?status_filter=fel_rejected&limit=50')
      
      // Verificar si hay datos válidos
      if (!response || !Array.isArray(response)) {
        console.warn('getFailedFELInvoices: No data returned from API, using empty array')
        return []
      }
      
      return response.map((invoice: any) => this.mapInvoiceToFELInvoice(invoice))
    } catch (error) {
      console.error('Error fetching failed FEL invoices:', error)
      // Retornar array vacío sin datos simulados
      return []
    }
  }

  private mapInvoiceToFELInvoice(invoice: any): FELInvoice {
    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      order_id: invoice.order_id,
      status: invoice.status,
      total_amount: invoice.total_amount,
      client: {
        id: 0,
        name: invoice.client_name || 'Cliente',
        nit: null,
        address: null,
        email: null
      },
      fel: {
        fel_uuid: invoice.fel_uuid,
        fel_status: this.mapInvoiceStatusToFELStatus(invoice.status),
        fel_authorized_at: invoice.fel_authorization_date,
        fel_error_message: invoice.fel_error_message,
        requires_fel: invoice.requires_fel || true,
        certifier: invoice.fel_certifier,
        fel_series: invoice.fel_series,
        fel_number: invoice.fel_number,
        fel_attempts: 1,
        fel_max_attempts: 3
      },
      due_date: invoice.due_date,
      pdf_generated: invoice.pdf_generated,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at
    }
  }
  
  // ========================================
  // GESTIÓN DE FACTURAS
  // ========================================
  
  /**
   * Obtiene lista de facturas con filtros
   */
  async getInvoices(filters?: InvoiceFilters): Promise<FELInvoice[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value))
          }
        })
      }
      
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/invoices/?${queryString}` : '/invoices/'
      
      const response = await apiClient.get(endpoint)
      
      // Validar que response existe y es un array
      if (!response || !Array.isArray(response)) {
        console.warn('getInvoices: No data returned from API, using empty array')
        return []
      }
      
      return response.map((invoice: any) => this.mapInvoiceToFELInvoice(invoice))
    } catch (error) {
      console.error('Error fetching invoices:', error)
      // Retornar array vacío sin datos simulados
      return []
    }
  }
  
  /**
   * Obtiene factura específica con información FEL
   */
  async getInvoice(invoiceId: number): Promise<FELInvoice> {
    const response = await apiClient.get(`/invoices/${invoiceId}`)
    return this.mapInvoiceToFELInvoice(response)
  }
  
  // ========================================
  // PAGOS
  // ========================================
  
  /**
   * Registra pago contra una factura
   */
  async recordPayment(request: RecordPaymentRequest): Promise<FELInvoice> {
    const response = await apiClient.post('/invoices/payments', {
      invoice_id: request.invoice_id,
      amount: request.amount,
      payment_method: request.payment_method,
      payment_date: request.payment_date || new Date().toISOString(),
      notes: request.notes
    })
    
    return this.mapInvoiceToFELInvoice(response)
  }
  
  // ========================================
  // GENERACIÓN DE FACTURAS DESDE ÓRDENES
  // ========================================
  
  /**
   * Genera factura automática (sin FEL) desde orden entregada
   */
  async createInvoiceFromOrder(orderId: number): Promise<FELInvoice> {
    const response = await apiClient.post(`/invoices/orders/${orderId}/auto-invoice`)
    return this.mapInvoiceToFELInvoice(response)
  }
  
  /**
   * Genera factura con FEL desde orden entregada
   */
  async createFELInvoiceFromOrder(
    orderId: number, 
    certifier: 'digifact' | 'infile' = 'digifact'
  ): Promise<FELProcessResponse> {
    const response = await apiClient.post(`/invoices/orders/${orderId}/auto-invoice-with-fel?certifier=${certifier}`)
    return response
  }
  
  /**
   * Genera solo comprobante (sin FEL) desde orden entregada
   */
  async createReceiptFromOrder(orderId: number): Promise<FELInvoice> {
    const response = await apiClient.post(`/invoices/orders/${orderId}/receipt-only`)
    return this.mapInvoiceToFELInvoice(response)
  }

  // ========================================
  // DESCARGAS Y ARCHIVOS
  // ========================================
  
  /**
   * Descarga PDF de factura (con UUID si es FEL)
   */
  async downloadInvoicePDF(invoiceId: number, regenerate = false): Promise<Blob> {
    return await apiClient.get<Blob>(
      `/invoices/${invoiceId}/pdf?regenerate=${regenerate}`,
      { responseType: 'blob' }
    )
  }
  
  /**
   * Descarga XML de factura FEL (si tiene UUID)
   */
  async downloadFELXML(invoiceId: number): Promise<Blob> {
    // El endpoint XML FEL no existe en la API actual
    // Por ahora devolvemos un error o implementamos un fallback
    throw new Error('La descarga de XML FEL no está disponible en la API actual')
  }
  
  // ========================================
  // UTILIDADES
  // ========================================
  
  /**
   * Determina qué tipo de documento puede crear una orden
   */
  getAvailableDocumentTypes(order: OrderWithInvoiceInfo | OrderWithoutDocument): DocumentType[] {
    const types: DocumentType[] = []
    
    // Si la orden ya tiene factura (solo aplica para OrderWithInvoiceInfo)
    if ('invoice' in order && order.invoice) {
      return types
    }
    
    // Solo órdenes entregadas pueden generar documentos
    if (order.status !== 'delivered') {
      return types
    }
    
    // Verificar si el cliente tiene NIT válido para FEL
    const hasValidNIT = order.client.nit && 
                       order.client.nit.length >= 8 && 
                       order.client.nit !== '0' &&
                       order.client.nit !== 'C/F'
    
    // Siempre puede generar comprobante
    types.push('receipt')
    
    // Puede generar factura FEL si tiene datos completos del cliente
    if (hasValidNIT && order.client.name && order.client.address) {
      types.push('invoice')
    }
    
    return types
  }
  
  /**
   * Valida si una orden puede crear factura FEL
   */
  canCreateFEL(order: OrderWithInvoiceInfo | OrderWithoutDocument): { canCreate: boolean; reason?: string } {
    if (order.status !== 'delivered') {
      return { canCreate: false, reason: 'La orden debe estar entregada' }
    }
    
    if ('invoice' in order && order.invoice) {
      return { canCreate: false, reason: 'La orden ya tiene factura asociada' }
    }
    
    if (!order.client.nit || order.client.nit.length < 8) {
      return { canCreate: false, reason: 'Cliente no tiene NIT válido' }
    }
    
    if (!order.client.name || !order.client.address) {
      return { canCreate: false, reason: 'Datos del cliente incompletos' }
    }
    
    return { canCreate: true }
  }
  
  /**
   * Formatea UUID FEL para mostrar
   */
  formatFELUUID(uuid?: string): string {
    if (!uuid) return 'N/A'
    
    // Mostrar solo primeros 8 y últimos 4 caracteres
    if (uuid.length > 12) {
      return `${uuid.substring(0, 8)}...${uuid.substring(uuid.length - 4)}`
    }
    
    return uuid
  }
  
  /**
   * Calcula porcentaje de facturas con FEL válido
   */
  calculateFELSuccessRate(summary: FELStatusSummary): number {
    if (summary.fel_invoices === 0) return 0
    return Math.round((summary.fel_authorized / summary.fel_invoices) * 100)
  }
  
  /**
   * Obtiene el error FEL más común
   */
  getMostCommonFELError(summary: FELStatusSummary): string {
    if (!summary.common_errors || summary.common_errors.length === 0) {
      return 'Sin errores'
    }
    
    const topError = summary.common_errors[0]
    return `${topError.description} (${topError.count})`
  }
  
  /**
   * Formatea montos en Quetzales
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount)
  }
  
  /**
   * Formatea fechas para mostrar
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  /**
   * Calcula días hasta vencimiento
   */
  getDaysUntilDue(dueDateString?: string): number | null {
    if (!dueDateString) return null
    
    const dueDate = new Date(dueDateString)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }
  
  /**
   * Determina si una factura está vencida
   */
  isOverdue(invoice: FELInvoice): boolean {
    if (!invoice.due_date || invoice.status === 'paid') return false
    
    const daysUntilDue = this.getDaysUntilDue(invoice.due_date)
    return daysUntilDue !== null && daysUntilDue < 0
  }
}

export const felService = new FELService()
