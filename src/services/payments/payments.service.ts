import { apiClient } from '../api/client'
import { ApiError } from '../api/config'
import type {
  Payment,
  CreatePaymentRequest,
  PaymentsListParams,
  PaymentsListResponse,
  PaymentSummary,
  CreateBulkPaymentRequest,
  BulkPaymentResponse,
} from './types'

// Servicio para manejar operaciones de pagos
export class PaymentsService {
  private readonly baseEndpoint = '/payments'

  /**
   * Crear un nuevo pago
   * Requiere rol de Vendedor o superior
   */
  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    try {
      return await apiClient.post<Payment>(this.baseEndpoint, request)
    } catch (error) {
      throw this.handleError(error, 'Error al crear el pago')
    }
  }

  /**
   * Crear múltiples pagos en una sola solicitud
   * Requiere rol de Vendedor o superior
   * Si algunos pagos fallan, los válidos se procesarán normalmente
   */
  async createBulkPayments(request: CreateBulkPaymentRequest): Promise<BulkPaymentResponse> {
    try {
      return await apiClient.post<BulkPaymentResponse>(
        `${this.baseEndpoint}/bulk`,
        request
      )
    } catch (error) {
      throw this.handleError(error, 'Error al crear pagos múltiples')
    }
  }

  /**
   * Listar pagos con filtros y paginación
   * Requiere permiso de ver pagos
   */
  async getPayments(params: PaymentsListParams = {}): Promise<PaymentsListResponse> {
    try {
      const queryParams: Record<string, string> = {}
      
      if (params.skip !== undefined) queryParams.skip = params.skip.toString()
      if (params.limit !== undefined) queryParams.limit = params.limit.toString()
      if (params.order_id !== undefined) queryParams.order_id = params.order_id.toString()
      if (params.payment_method) queryParams.payment_method = params.payment_method
      if (params.status_filter) queryParams.status_filter = params.status_filter
      if (params.date_from) queryParams.date_from = params.date_from
      if (params.date_to) queryParams.date_to = params.date_to
      if (params.only_confirmed !== undefined) {
        queryParams.only_confirmed = params.only_confirmed.toString()
      }

      const response = await apiClient.get<PaymentsListResponse>(
        this.baseEndpoint,
        queryParams
      )

      // Asegurar que la respuesta tenga la estructura correcta
      return {
        items: response.items || [],
        total: response.total || 0,
        skip: response.skip || 0,
        limit: response.limit || 100,
      }
    } catch (error) {
      throw this.handleError(error, 'Error al obtener pagos')
    }
  }

  /**
   * Obtener un pago específico por ID
   * Requiere permiso de ver pagos
   */
  async getPaymentById(paymentId: number): Promise<Payment> {
    try {
      return await apiClient.get<Payment>(`${this.baseEndpoint}/${paymentId}`)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el pago')
    }
  }

  /**
   * Cancelar un pago
   * Requiere rol de Vendedor o superior
   */
  async cancelPayment(paymentId: number): Promise<Payment> {
    try {
      return await apiClient.post<Payment>(
        `${this.baseEndpoint}/${paymentId}/cancel`
      )
    } catch (error) {
      throw this.handleError(error, 'Error al cancelar el pago')
    }
  }

  /**
   * Obtener pagos de una orden específica
   * Requiere permiso de ver pagos
   */
  async getOrderPayments(
    orderId: number,
    onlyConfirmed: boolean = true
  ): Promise<Payment[]> {
    try {
      const queryParams: Record<string, string> = {}
      if (onlyConfirmed !== undefined) {
        queryParams.only_confirmed = onlyConfirmed.toString()
      }

      return await apiClient.get<Payment[]>(
        `/orders/${orderId}/payments`,
        queryParams
      )
    } catch (error) {
      throw this.handleError(error, 'Error al obtener pagos de la orden')
    }
  }

  /**
   * Obtener resumen de pagos de una orden
   * Requiere permiso de ver pagos
   */
  async getOrderPaymentSummary(orderId: number): Promise<PaymentSummary> {
    try {
      return await apiClient.get<PaymentSummary>(
        `/orders/${orderId}/payment-summary`
      )
    } catch (error) {
      throw this.handleError(error, 'Error al obtener resumen de pagos')
    }
  }

  /**
   * Manejar errores de manera consistente
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (error instanceof ApiError) {
      return error
    }
    
    if (error instanceof Error) {
      return new Error(`${defaultMessage}: ${error.message}`)
    }
    
    return new Error(defaultMessage)
  }
}

// Instancia singleton del servicio
export const paymentsService = new PaymentsService()


