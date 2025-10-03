// Tipos basados en la API de Smart Orders - Inventario

export type EntryType = 'production' | 'return' | 'adjustment' | 'initial'
export type EntryStatus = 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled'

export interface InventoryEntryItem {
  id?: number
  entry_id?: number
  product_id: number
  quantity: number
  unit_cost?: number
  batch_number?: string | null
  expiry_date?: string | null
  notes?: string | null
  total_cost?: number
  product_name?: string | null
  product_sku?: string | null
  product_description?: string | null
}

export interface InventoryEntryItemCreate {
  product_id: number
  quantity: number
  unit_cost?: number
  batch_number?: string | null
  expiry_date?: string | null
  notes?: string | null
}

export interface InventoryEntry {
  id?: number
  entry_number?: string
  entry_type: EntryType
  status?: EntryStatus
  user_id?: number
  supplier_info?: string | null
  expected_date?: string | null
  notes?: string | null
  reference_document?: string | null
  total_cost?: number
  entry_date?: string
  completed_date?: string | null
  created_at?: string
  updated_at?: string | null
  items: InventoryEntryItem[]
  user_name?: string | null
}

export interface InventoryEntryCreate {
  entry_type: EntryType
  supplier_info?: string | null
  expected_date?: string | null
  notes?: string | null
  reference_document?: string | null
  items: InventoryEntryItemCreate[]
}

export interface InventoryEntryUpdate {
  entry_type?: EntryType
  status?: EntryStatus
  supplier_info?: string | null
  expected_date?: string | null
  notes?: string | null
  reference_document?: string | null
}

export interface InventoryEntryListResponse {
  id: number
  entry_number: string
  entry_type: EntryType
  status: EntryStatus
  total_cost: number
  entry_date: string
  completed_date?: string | null
  user_name?: string | null
  items_count: number
  supplier_info?: string | null
}

export interface InventoryEntrySummary {
  total_entries: number
  total_cost: number
  entries_by_type: Record<string, number>
  entries_by_status: Record<string, number>
  pending_entries: number
  completed_today: number
}

export interface StockAdjustmentRequest {
  product_id: number
  quantity: number // Positive for increase, negative for decrease
  reason: string
  notes?: string | null
}

export interface BatchUpdateRequest {
  entry_ids: number[]
  status: EntryStatus
}

export interface EntryValidationRequest {
  entry_id: number
  validate_stock?: boolean
  validate_costs?: boolean
}

export interface InventoryReport {
  product_id: number
  product_name: string
  product_sku?: string | null
  current_stock: number
  total_entries: number
  total_quantity_added: number
  last_entry_date?: string | null
  average_cost: number
}

// Tipos para filtros
export interface InventoryEntryFilters {
  skip?: number
  limit?: number
  entry_type?: string | null
  status_filter?: string | null
  user_id?: number | null
  product_id?: number | null
  pending_only?: boolean
  start_date?: string | null
  end_date?: string | null
}

// Tipos para respuestas de operaciones
export interface InventoryOperationResponse {
  success: boolean
  message: string
  entry?: InventoryEntry
}

// Constantes para labels
export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  production: 'Producción',
  return: 'Devolución',
  adjustment: 'Ajuste',
  initial: 'Inventario Inicial'
}

export const ENTRY_STATUS_LABELS: Record<EntryStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  approved: 'Aprobado',
  completed: 'Completado',
  cancelled: 'Cancelado'
}

