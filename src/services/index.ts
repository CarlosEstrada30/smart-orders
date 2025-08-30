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

// Exportar tipos
export type { Client, CreateClientRequest, UpdateClientRequest, ClientsListParams } from './clients'
export type { Product, CreateProductRequest, UpdateProductRequest, ProductsListParams } from './products'
export type { LoginRequest, LoginResponse, AuthUser } from './auth'
export type { Order, OrderCreate, OrderUpdate, OrderItem, OrderStatus } from './orders'
export type { User, UserCreate, UserUpdate, UsersListParams } from './users'
export type { Route, CreateRouteRequest, UpdateRouteRequest, RoutesListParams } from './routes'
export type { InventoryEntry, InventoryEntryCreate, InventoryEntryUpdate, EntryType, EntryStatus } from './inventory'
export type { DashboardMetrics, InvoiceSummary, InventoryEntrySummary, LowStockProduct, OrderSummary } from './dashboard' 