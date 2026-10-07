/**
 * FEL (Facturación Electrónica en Línea) Types - Guatemala
 * Sistema de facturación fiscal válida ante SAT
 */

// ========================================
// ESTADOS Y ENUMS FEL
// ========================================

/** Estados de procesamiento FEL */
export type FELStatus = 
  | 'pending'     // Iniciando proceso FEL
  | 'processing'  // Enviando a SAT
  | 'authorized'  // FEL autorizada con UUID
  | 'rejected'    // Rechazada por SAT
  | 'error'       // Error técnico
  | 'timeout'     // Timeout de conexión

/** Estados de factura extendidos para FEL */
export type InvoiceStatus = 
  | 'draft'       // Borrador
  | 'issued'      // Emitida (con UUID si es FEL)
  | 'paid'        // Pagada
  | 'overdue'     // Vencida
  | 'cancelled'   // Cancelada

/** Métodos de pago */
export type PaymentMethod = 
  | 'cash'         // Efectivo
  | 'credit_card'  // Tarjeta de crédito
  | 'bank_transfer'// Transferencia bancaria
  | 'check'        // Cheque
  | 'other'        // Otro

/** Tipos de documento */
export type DocumentType = 'invoice' | 'receipt'

// ========================================
// ERRORES FEL COMUNES
// ========================================

/** Códigos de error FEL predefinidos */
export const FEL_ERROR_CODES = {
  'connection_timeout': 'Sin conexión con SAT - Intente nuevamente',
  'invalid_nit': 'NIT del cliente es inválido',
  'client_incomplete': 'Datos del cliente incompletos para FEL',
  'invalid_amount': 'Monto de factura inválido',
  'server_error': 'Error en servidor SAT - Intente más tarde',
  'duplicate_document': 'Documento duplicado en SAT',
  'invalid_date': 'Fecha de factura inválida',
  'tax_calculation_error': 'Error en cálculo de impuestos',
  'client_not_found': 'Cliente no encontrado en registros SAT',
  'unknown_error': 'Error desconocido - Contacte soporte'
} as const

export type FELErrorCode = keyof typeof FEL_ERROR_CODES

// ========================================
// INTERFACES PRINCIPALES
// ========================================

/** Información FEL de una factura */
export interface FELInfo {
  /** UUID otorgado por SAT (si existe = válida fiscalmente) */
  fel_uuid?: string
  
  /** Estado actual del proceso FEL */
  fel_status: FELStatus
  
  /** Mensaje de error si el proceso falló */
  fel_error_message?: string
  
  /** Código de error estructurado */
  fel_error_code?: FELErrorCode
  
  /** Si esta factura requiere procesamiento FEL */
  requires_fel: boolean
  
  /** Fecha de autorización SAT */
  fel_authorized_at?: string
  
  /** Número de serie SAT */
  fel_series?: string
  
  /** Número de documento SAT */
  fel_document_number?: string
  
  /** URL del XML firmado */
  fel_xml_url?: string
  
  /** Intentos de procesamiento FEL */
  fel_attempts: number
  
  /** Máximo intentos permitidos */
  fel_max_attempts: number
}

/** Factura extendida con información FEL */
export interface FELInvoice {
  // Datos base de factura (del OpenAPI existente)
  id: number
  invoice_number: string
  order_id: number
  status: InvoiceStatus
  subtotal: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  issue_date: string
  due_date?: string
  paid_date?: string
  payment_method?: PaymentMethod
  payment_terms: string
  notes?: string
  pdf_generated: boolean
  pdf_path?: string
  created_at: string
  updated_at?: string
  
  // Información FEL específica
  fel: FELInfo
  
  // Información del cliente (necesaria para FEL)
  client: {
    id: number
    name: string
    email?: string
    phone?: string
    nit?: string
    address?: string
    is_active: boolean
  }
  
  // Información de la orden
  order: {
    id: number
    order_number: string
    status: string
    total_amount: number
    created_at: string
  }
}

/** Resumen de estado FEL para dashboard */
export interface FELStatusSummary {
  total_invoices: number
  fel_invoices: number
  receipt_only: number
  
  // Estados FEL
  fel_authorized: number
  fel_processing: number
  fel_failed: number
  fel_pending: number
  
  // Errores más comunes
  common_errors: Array<{
    error_code: FELErrorCode
    count: number
    description: string
  }>
  
  // Métricas financieras
  fiscal_revenue: number      // Solo facturas con UUID
  non_fiscal_revenue: number  // Comprobantes sin UUID
  total_revenue: number
  
  // Pendientes de acción
  orders_without_document: number
  failed_fel_to_retry: number
}

/** Métricas de ingresos fiscales */
export interface FiscalRevenueMetrics {
  period: 'today' | 'week' | 'month' | 'year'
  
  // Ingresos fiscales (solo con UUID)
  fiscal_revenue: number
  fiscal_invoices: number
  
  // Ingresos totales
  total_revenue: number
  total_invoices: number
  
  // Porcentajes
  fiscal_percentage: number
  
  // Comparación período anterior
  fiscal_growth: number
  total_growth: number
  
  // Desglose por mes (para gráficos)
  monthly_breakdown?: Array<{
    month: string
    fiscal_revenue: number
    total_revenue: number
    fiscal_count: number
    total_count: number
  }>
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

/** Request para crear factura FEL automática */
export interface CreateFELInvoiceRequest {
  order_id: number
  requires_fel: boolean
  payment_method?: PaymentMethod
  due_date?: string
  notes?: string
  payment_terms?: string
}

/** Request para generar solo comprobante */
export interface CreateReceiptRequest {
  order_id: number
  notes?: string
  payment_terms?: string
}

/** Request para reintentar proceso FEL */
export interface RetryFELRequest {
  invoice_id: number
  force?: boolean  // Forzar reintento aunque esté en max_attempts
}

/** Request para registrar pago */
export interface RecordPaymentRequest {
  invoice_id: number
  amount: number
  payment_method: PaymentMethod
  payment_date?: string
  notes?: string
}

/** Response del proceso FEL */
export interface FELProcessResponse {
  success: boolean
  invoice: FELInvoice
  fel_status: FELStatus
  fel_uuid?: string
  fel_error?: {
    code: FELErrorCode
    message: string
    technical_details?: string
  }
  processing_time_ms: number
  retry_available: boolean
}

// ========================================
// CONFIGURACIÓN Y CONSTANTES
// ========================================

/** Configuración del polling FEL */
export const FEL_POLLING_CONFIG = {
  INTERVAL_MS: 2000,        // Verificar cada 2 segundos
  MAX_ATTEMPTS: 30,         // Máximo 30 intentos = 60 segundos
  TIMEOUT_MS: 60000,        // Timeout total de 60 segundos
} as const

/** Colores para estados FEL */
export const FEL_STATUS_COLORS = {
  pending: 'bg-warning/20 text-warning-foreground dark:text-warning',
  processing: 'bg-info/15 text-info',
  authorized: 'bg-success/15 text-success', 
  rejected: 'bg-destructive/15 text-destructive',
  error: 'bg-destructive/15 text-destructive',
  timeout: 'bg-warning/20 text-warning-foreground dark:text-warning',
} as const

/** Iconos para estados FEL */
export const FEL_STATUS_ICONS = {
  pending: '⏳',
  processing: '🔄',
  authorized: '✅',
  rejected: '❌',
  error: '⚠️',
  timeout: '⏱️',
} as const

// ========================================
// UTILITY TYPES
// ========================================

/** Orden extendida con información de facturación */
export interface OrderWithInvoiceInfo {
  id: number
  order_number: string
  client_id: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at?: string
  
  // Cliente asociado
  client: {
    id: number
    name: string
    email?: string
    phone?: string
    nit?: string
    address?: string
  }
  
  // Factura asociada (si existe)
  invoice?: FELInvoice
  
  // Helpers computed
  can_create_invoice: boolean  // Orden DELIVERED sin factura
  has_valid_fel: boolean       // Tiene factura con UUID válido
  document_type?: DocumentType // 'invoice' | 'receipt' | undefined
}

/** Orden entregada sin documento generado - para el generador de facturas */
export interface OrderWithoutDocument {
  id: number
  order_number: string
  client_id: number
  status: 'delivered'  // Solo órdenes entregadas
  total_amount: number
  delivery_date: string  // Fecha de entrega (updated_at cuando se cambió a delivered)
  created_at: string
  updated_at?: string
  
  // Cliente asociado
  client: {
    id: number
    name: string
    email?: string
    phone?: string
    nit?: string | null
    address?: string
  }
  
  // Metadatos de procesamiento
  can_create_invoice: boolean
  suggested_document_type: DocumentType
}

/** Filtros para lista de facturas */
export interface InvoiceFilters {
  status?: InvoiceStatus
  fel_status?: FELStatus
  client_id?: number
  date_from?: string
  date_to?: string
  requires_fel?: boolean
  has_fel_uuid?: boolean
  payment_method?: PaymentMethod
  search?: string
}

export default {
  FEL_ERROR_CODES,
  FEL_POLLING_CONFIG,
  FEL_STATUS_COLORS,
  FEL_STATUS_ICONS,
}

