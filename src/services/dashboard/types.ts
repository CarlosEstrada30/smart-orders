/**
 * Dashboard Service Types
 * Tipos para las métricas del dashboard usando endpoints existentes
 */

// ========================================
// TIPOS BASADOS EN OPENAPI EXISTENTES
// ========================================

// De /api/v1/invoices/summary
export interface InvoiceSummary {
  total_invoices: number
  total_amount: number
  paid_amount: number
  pending_amount: number
  overdue_count: number
  overdue_amount: number
}

// De /api/v1/inventory/entries/summary
export interface InventoryEntrySummary {
  total_entries: number
  total_cost: number
  entries_by_type: Record<string, number>
  entries_by_status: Record<string, number>
  pending_entries: number
  completed_today: number
}

// De /api/v1/products/low-stock
export interface LowStockProduct {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  sku: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// De /api/v1/orders/ (array)
export interface OrderSummary {
  id: number
  order_number: string
  client_id: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at?: string
  client?: {
    id: number
    name: string
    email?: string
    phone?: string
  }
}

// ========================================
// TIPOS CALCULADOS PARA DASHBOARD
// ========================================

export interface DashboardMetrics {
  // Métricas financieras (basadas en órdenes entregadas del mes actual)
  financial: {
    totalRevenue: number        // SUM(total_amount) de órdenes delivered del mes actual
    paidAmount: number          // Igual a totalRevenue (consideramos entregas como pagadas)
    pendingAmount: number       // 0 (no usamos facturas)
    overdueAmount: number       // 0 (no usamos facturas)
    overdueCount: number        // 0 (no usamos facturas)
    monthlyGrowth: number       // % crecimiento vs mes anterior en ingresos de órdenes entregadas
    currentMonthDelivered: number // COUNT de órdenes entregadas del mes actual
  }
  
  // Métricas de pedidos
  orders: {
    totalOrders: number
    pendingOrders: number
    confirmedOrders: number
    deliveredOrders: number
    todayOrders: number
    averageOrderValue: number
    orderGrowth: number
    // Nuevos: distribución de estados del mes actual
    currentMonthByStatus: {
      pending: number
      confirmed: number
      in_progress: number
      shipped: number
      delivered: number
      cancelled: number
    }
    currentMonthTotal: number // Total de pedidos del mes actual
  }
  
  // Métricas de inventario
  inventory: {
    totalEntries: number
    pendingEntries: number
    completedToday: number
    totalCost: number
    lowStockCount: number
    lowStockProducts: LowStockProduct[]
  }
  
  // Métricas de productos
  products: {
    totalActive: number
    lowStockCount: number
    newThisMonth: number
  }
  
  // Actividad reciente
  recentActivity: {
    recentOrders: OrderSummary[]
    recentInvoices: any[]
  }
}

// ========================================
// TIPOS PARA GRÁFICOS
// ========================================

export interface ChartDataPoint {
  name: string
  value: number
  label?: string
}

export interface SalesChartData {
  month: string
  sales: number
  orders: number
  revenue: number
}

// ========================================
// TIPOS PARA NUEVO ENDPOINT DE ANALYTICS
// ========================================

export interface MonthlyAnalyticsData {
  year: number
  month: number
  month_name: string
  order_count: number
  total_amount: number
}

export interface MonthlyAnalyticsResponse {
  monthly_data: MonthlyAnalyticsData[]
  total_orders: number
  total_amount: number
  period_start: string | null
  period_end: string | null
}

export interface AnalyticsFilters {
  status_filter: 'delivered' // Requerido
  year?: number // Opcional: año específico
  start_date?: string // Opcional: fecha inicio (formato: 2024-01-01)
  end_date?: string // Opcional: fecha fin (formato: 2024-12-31)
}

// ========================================
// TIPOS PARA MÉTRICAS DE ÓRDENES ENTREGADAS
// ========================================

export interface DeliveredOrdersMetrics {
  totalRevenue: number
  deliveredCount: number
  averageOrderValue: number
}

// ========================================
// TIPOS PARA ENDPOINT DE DISTRIBUCIÓN DE ESTADOS
// ========================================

export interface StatusDistributionItem {
  status: 'pending' | 'confirmed' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'
  status_name: string
  count: number
  percentage: number
}

export interface StatusDistributionResponse {
  status_data: StatusDistributionItem[]
  total_orders: number
  month: number
  year: number
  period_name: string
}

export interface StatusDistributionFilters {
  year?: number  // Año para análisis (por defecto: año actual)
  month?: number // Mes para análisis 1-12 (por defecto: mes actual)
}

// ========================================
// TIPOS PARA FILTROS Y PERÍODOS
// ========================================

export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year'

export interface DashboardFilters {
  period?: DashboardPeriod
  startDate?: string
  endDate?: string
  clientId?: number
  status?: string
}

// ========================================
// TIPOS PARA ESTADOS DE CARGA
// ========================================

export interface DashboardState {
  metrics?: DashboardMetrics
  isLoading: boolean
  error?: string
  lastUpdated?: Date
}

// ========================================
// TIPOS PARA STATUS MAPPING
// ========================================

export const ORDER_STATUS_MAP = {
  pending: { label: 'Pendiente', variant: 'secondary' as const },
  confirmed: { label: 'Confirmado', variant: 'default' as const },
  in_progress: { label: 'En Proceso', variant: 'default' as const },
  shipped: { label: 'Enviado', variant: 'outline' as const },
  delivered: { label: 'Entregado', variant: 'default' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
} as const

export const INVOICE_STATUS_MAP = {
  draft: { label: 'Borrador', variant: 'secondary' as const },
  issued: { label: 'Emitida', variant: 'default' as const },
  paid: { label: 'Pagada', variant: 'default' as const },
  overdue: { label: 'Vencida', variant: 'destructive' as const },
  cancelled: { label: 'Cancelada', variant: 'destructive' as const },
} as const
