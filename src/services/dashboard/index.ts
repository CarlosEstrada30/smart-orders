/**
 * Dashboard Service - Entry Point
 */

export { dashboardService } from './dashboard.service'
export * from './types'

// Exportar tipos específicos para mayor claridad
export type { 
  MonthlyAnalyticsResponse, 
  MonthlyAnalyticsData, 
  AnalyticsFilters,
  StatusDistributionResponse,
  StatusDistributionItem,
  StatusDistributionFilters
} from './types'
