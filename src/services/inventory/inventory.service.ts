import { apiClient } from '../api/client'
import type {
  InventoryEntry,
  InventoryEntryCreate,
  InventoryEntryUpdate,
  InventoryEntryListResponse,
  InventoryEntrySummary,
  InventoryEntryFilters,
  StockAdjustmentRequest,
  BatchUpdateRequest,
  EntryValidationRequest,
  InventoryReport,
  InventoryOperationResponse,
  EntryStatus
} from './types'

export const inventoryService = {
  // ===== GESTIÓN DE ENTRADAS DE INVENTARIO =====

  // Crear nueva entrada de inventario
  async createEntry(entryData: InventoryEntryCreate): Promise<InventoryEntry> {
    return apiClient.post<InventoryEntry>('/inventory/entries', entryData)
  },

  // Obtener lista de entradas con filtros
  async getEntries(filters?: InventoryEntryFilters): Promise<InventoryEntryListResponse[]> {
    const queryParams = filters ? {
      ...(filters.skip !== undefined && { skip: filters.skip.toString() }),
      ...(filters.limit !== undefined && { limit: filters.limit.toString() }),
      ...(filters.entry_type && { entry_type: filters.entry_type }),
      ...(filters.status_filter && { status_filter: filters.status_filter }),
      ...(filters.user_id && { user_id: filters.user_id.toString() }),
      ...(filters.product_id && { product_id: filters.product_id.toString() }),
      ...(filters.pending_only !== undefined && { pending_only: filters.pending_only.toString() }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date })
    } : undefined

    return apiClient.get<InventoryEntryListResponse[]>('/inventory/entries', queryParams)
  },

  // Obtener resumen/estadísticas de inventario
  async getEntriesSummary(startDate?: string, endDate?: string): Promise<InventoryEntrySummary> {
    const queryParams = {
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate })
    }

    return apiClient.get<InventoryEntrySummary>('/inventory/entries/summary', 
      Object.keys(queryParams).length > 0 ? queryParams : undefined)
  },

  // Obtener entrada específica por ID
  async getEntry(entryId: number): Promise<InventoryEntry> {
    return apiClient.get<InventoryEntry>(`/inventory/entries/${entryId}`)
  },

  // Obtener entrada por número
  async getEntryByNumber(entryNumber: string): Promise<InventoryEntry> {
    return apiClient.get<InventoryEntry>(`/inventory/entries/number/${encodeURIComponent(entryNumber)}`)
  },

  // Actualizar entrada
  async updateEntry(entryId: number, entryData: InventoryEntryUpdate): Promise<InventoryEntry> {
    return apiClient.put<InventoryEntry>(`/inventory/entries/${entryId}`, entryData)
  },

  // ===== FLUJO DE TRABAJO DE ENTRADAS =====

  // Enviar entrada para aprobación (DRAFT → PENDING)
  async submitEntry(entryId: number): Promise<InventoryEntry> {
    return apiClient.put<InventoryEntry>(`/inventory/entries/${entryId}`, { status: 'pending' })
  },

  // Aprobar entrada directamente (DRAFT → APPROVED) - para supervisores
  async approveDirectly(entryId: number): Promise<InventoryEntry> {
    return apiClient.put<InventoryEntry>(`/inventory/entries/${entryId}`, { status: 'approved' })
  },

  // Aprobar entrada (usando endpoint específico)
  async approveEntry(entryId: number): Promise<InventoryEntry> {
    return apiClient.post<InventoryEntry>(`/inventory/entries/${entryId}/approve`)
  },

  // Completar entrada (actualiza stock)
  async completeEntry(entryId: number): Promise<InventoryEntry> {
    return apiClient.post<InventoryEntry>(`/inventory/entries/${entryId}/complete`)
  },

  // Cancelar entrada
  async cancelEntry(entryId: number): Promise<InventoryEntry> {
    return apiClient.post<InventoryEntry>(`/inventory/entries/${entryId}/cancel`)
  },

  // Validar entrada antes de aprobar/completar
  async validateEntry(validationData: EntryValidationRequest): Promise<InventoryOperationResponse> {
    const response = await apiClient.post<any>(`/inventory/entries/${validationData.entry_id}/validate`, validationData)
    return {
      success: true,
      message: response?.message || 'Validación completada',
      entry: response?.entry
    }
  },

  // ===== WORKFLOWS ESPECIALIZADOS =====

  // Crear entrada de producción
  async createProductionEntry(entryData: InventoryEntryCreate, autoComplete = false): Promise<InventoryEntry> {
    const queryParams = autoComplete ? { auto_complete: 'true' } : undefined
    return apiClient.post<InventoryEntry>('/inventory/workflows/production', entryData, queryParams)
  },

  // Crear entrada de compra
  async createPurchaseEntry(entryData: InventoryEntryCreate, autoApprove = false): Promise<InventoryEntry> {
    const queryParams = autoApprove ? { auto_approve: 'true' } : undefined
    return apiClient.post<InventoryEntry>('/inventory/workflows/purchase', entryData, queryParams)
  },

  // ===== AJUSTES DE STOCK =====

  // Crear ajuste rápido de stock
  async createStockAdjustment(adjustmentData: StockAdjustmentRequest): Promise<InventoryEntry> {
    return apiClient.post<InventoryEntry>('/inventory/stock/adjust', adjustmentData)
  },

  // ===== OPERACIONES BATCH =====

  // Actualizar estado de múltiples entradas
  async batchUpdateEntries(batchData: BatchUpdateRequest): Promise<InventoryOperationResponse> {
    const response = await apiClient.post<any>('/inventory/entries/batch-update', batchData)
    return {
      success: true,
      message: response?.message || 'Entradas actualizadas exitosamente'
    }
  },

  // ===== REPORTES =====

  // Obtener reporte de movimientos de inventario
  async getInventoryMovementReport(productId?: number): Promise<InventoryReport[]> {
    const queryParams = productId ? { product_id: productId.toString() } : undefined
    return apiClient.get<InventoryReport[]>('/inventory/reports/movements', queryParams)
  },

  // ===== DATOS DE REFERENCIA =====

  // Obtener tipos de entrada disponibles
  async getEntryTypes(): Promise<string[]> {
    return apiClient.get<string[]>('/inventory/types')
  },

  // Obtener estados disponibles
  async getEntryStatuses(): Promise<string[]> {
    return apiClient.get<string[]>('/inventory/statuses')
  },

  // ===== FUNCIONES AUXILIARES =====

  // Verificar si una entrada puede ser editada
  canEditEntry(entry: InventoryEntry): boolean {
    return entry.status === 'draft' || entry.status === 'pending'
  },

  // Verificar si una entrada puede ser aprobada
  canApproveEntry(entry: InventoryEntry): boolean {
    return entry.status === 'pending'
  },

  // Verificar si una entrada puede ser completada
  canCompleteEntry(entry: InventoryEntry): boolean {
    return entry.status === 'approved'
  },

  // Verificar si una entrada puede ser cancelada
  canCancelEntry(entry: InventoryEntry): boolean {
    return entry.status !== 'completed' && entry.status !== 'cancelled'
  },

  // Calcular total de una entrada
  calculateEntryTotal(items: Array<{ quantity: number; unit_cost?: number }>): number {
    return items.reduce((total, item) => {
      return total + (item.quantity * (item.unit_cost || 0))
    }, 0)
  },

  // Generar datos para nueva entrada
  generateNewEntry(type: InventoryEntryCreate['entry_type']): Partial<InventoryEntryCreate> {
    return {
      entry_type: type,
      items: [],
      notes: '',
      supplier_info: type === 'purchase' ? '' : null,
      reference_document: null,
      expected_date: null
    }
  }
}

// Hooks para React Query
export const useInventory = () => {
  return {
    // Entradas
    createEntry: (entryData: InventoryEntryCreate) => inventoryService.createEntry(entryData),
    getEntries: (filters?: InventoryEntryFilters) => inventoryService.getEntries(filters),
    getEntry: (entryId: number) => inventoryService.getEntry(entryId),
    getEntryByNumber: (entryNumber: string) => inventoryService.getEntryByNumber(entryNumber),
    updateEntry: (entryId: number, entryData: InventoryEntryUpdate) => 
      inventoryService.updateEntry(entryId, entryData),
    
    // Flujo de trabajo
    approveEntry: (entryId: number) => inventoryService.approveEntry(entryId),
    completeEntry: (entryId: number) => inventoryService.completeEntry(entryId),
    cancelEntry: (entryId: number) => inventoryService.cancelEntry(entryId),
    validateEntry: (validationData: EntryValidationRequest) => 
      inventoryService.validateEntry(validationData),
    
    // Workflows especializados
    createProductionEntry: (entryData: InventoryEntryCreate, autoComplete?: boolean) => 
      inventoryService.createProductionEntry(entryData, autoComplete),
    createPurchaseEntry: (entryData: InventoryEntryCreate, autoApprove?: boolean) => 
      inventoryService.createPurchaseEntry(entryData, autoApprove),
    
    // Ajustes y operaciones
    createStockAdjustment: (adjustmentData: StockAdjustmentRequest) => 
      inventoryService.createStockAdjustment(adjustmentData),
    batchUpdateEntries: (batchData: BatchUpdateRequest) => 
      inventoryService.batchUpdateEntries(batchData),
    
    // Reportes y datos
    getEntriesSummary: (startDate?: string, endDate?: string) => 
      inventoryService.getEntriesSummary(startDate, endDate),
    getInventoryMovementReport: (productId?: number) => 
      inventoryService.getInventoryMovementReport(productId),
    getEntryTypes: () => inventoryService.getEntryTypes(),
    getEntryStatuses: () => inventoryService.getEntryStatuses()
  }
}

