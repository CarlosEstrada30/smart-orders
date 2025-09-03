// Exportar configuración de la API
export { API_CONFIG, ApiError } from './api/config'
export { apiClient } from './api/client'

// Exportar servicios
export { clientsService } from './clients'
export { productsService } from './products'
export { authService } from './auth'
export { ordersService } from './orders'
export { usersService } from './users'
export { routesService } from './routes'
export { inventoryService } from './inventory'
export { dashboardService } from './dashboard'
export { felService } from './fel'
export { companiesService } from './companies'
export { SettingsService } from './settings'

// Exportar tipos
export type { Client, CreateClientRequest, UpdateClientRequest, ClientsListParams } from './clients'
export type { Product, CreateProductRequest, UpdateProductRequest, ProductsListParams } from './products'
export type { LoginRequest, LoginResponse, AuthUser } from './auth'
export type { Order, OrderCreate, OrderUpdate, OrderItem, OrderStatus } from './orders'
export type { User, UserCreate, UserUpdate, UsersListParams } from './users'
export type { Route, CreateRouteRequest, UpdateRouteRequest, RoutesListParams } from './routes'
export type { InventoryEntry, InventoryEntryCreate, InventoryEntryUpdate, EntryType, EntryStatus } from './inventory'
export type { DashboardMetrics, InvoiceSummary, InventoryEntrySummary, LowStockProduct, OrderSummary } from './dashboard'
export type { 
  FELInvoice, 
  FELStatusSummary, 
  FiscalRevenueMetrics, 
  OrderWithInvoiceInfo, 
  FELStatus, 
  InvoiceStatus, 
  DocumentType, 
  PaymentMethod, 
  CreateFELInvoiceRequest, 
  CreateReceiptRequest, 
  RecordPaymentRequest, 
  FELProcessResponse, 
  InvoiceFilters 
} from './fel' 
export type { Company, CompanyCreate, CompanyUpdate, CompaniesListParams, CompaniesListResponse } from './companies'
export type { CompanySettings, CompanySettingsCreate, CompanySettingsUpdate, SettingsFormData } from './settings'