// Tipos para el servicio de pagos

export type PaymentMethod = 
  | 'cash' 
  | 'credit_card' 
  | 'debit_card' 
  | 'bank_transfer' 
  | 'check' 
  | 'other'

export type PaymentStatus = 'confirmed' | 'cancelled'

export type OrderPaymentStatus = 'unpaid' | 'partial' | 'paid'

export interface Payment {
  id: number
  payment_number: string
  order_id: number
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  payment_date: string
  notes?: string | null
  created_by_user_id?: number
  created_at: string
  updated_at?: string
}

export interface CreatePaymentRequest {
  order_id: number
  amount: number
  payment_method: PaymentMethod
  notes?: string | null
}

export interface PaymentsListParams {
  skip?: number
  limit?: number
  order_id?: number
  payment_method?: PaymentMethod
  status_filter?: PaymentStatus
  date_from?: string // YYYY-MM-DD
  date_to?: string // YYYY-MM-DD
  only_confirmed?: boolean
}

export interface PaymentsListResponse {
  items: Payment[]
  total: number
  skip: number
  limit: number
}

export interface PaymentSummary {
  order_id: number
  order_number: string
  total_amount: number
  paid_amount: number
  balance_due: number
  payment_status: OrderPaymentStatus
  payment_count: number
  payments: Payment[]
}

// Tipos para pagos múltiples (bulk)
export interface CreateBulkPaymentRequest {
  payments: CreatePaymentRequest[]
}

export interface PaymentError {
  order_id: number
  order_number: string | null
  client_name: string | null
  amount: number
  payment_method: PaymentMethod
  reason: string
  notes?: string | null
}

export interface BulkPaymentResponse {
  payments: Payment[]
  total_payments: number
  total_amount: number
  success_count: number
  failed_count: number
  errors: PaymentError[]
}


