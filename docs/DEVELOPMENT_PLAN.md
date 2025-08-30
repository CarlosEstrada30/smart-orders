# 🛠️ Plan de Desarrollo Técnico - SmartOrders

## 📋 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas
- ✅ Sistema de autenticación JWT completo
- ✅ CRUD de órdenes, clientes, productos, usuarios
- ✅ Gestión de inventario básica
- ✅ Rutas y logística
- ✅ UI moderna con ShadcnUI + Tailwind
- ✅ Sistema de permisos basado en roles
- ✅ Generación de comprobantes PDF

### ❌ Gaps Técnicos Críticos
- ❌ Dashboard con datos mock/random
- ❌ Sin sistema de pagos
- ❌ Configuración hardcodeada para localhost
- ❌ Sin testing automatizado
- ❌ Sin notificaciones automáticas
- ❌ Sin reportes exportables funcionales

---

## 🔧 FASE 0: PREPARACIÓN TÉCNICA

### Task 1: Variables de Entorno (4 horas)

**Problema actual:**
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1', // ❌ Hardcoded
  TIMEOUT: 10000,
}
```

**Solución:**
```bash
# Crear archivos de configuración
touch .env.example .env.development .env.production
mkdir -p src/config
```

```typescript
// src/config/environment.ts
export const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SmartOrders',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
} as const

// src/config/api-config.ts
import { ENV } from './environment'

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const
```

```env
# .env.example
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=SmartOrders
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

### Task 2: Testing Setup (8 horas)

```bash
# Instalar dependencias
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock del store de autenticación
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    auth: {
      user: { id: 1, name: 'Test User' },
      accessToken: 'test-token',
    }
  }))
}))
```

**Tests críticos a implementar:**
```typescript
// src/services/__tests__/orders.service.test.ts
describe('Orders Service', () => {
  test('should fetch orders successfully', async () => {
    const orders = await ordersService.getOrders()
    expect(orders).toBeInstanceOf(Array)
  })
  
  test('should create order with valid data', async () => {
    const orderData = { client_id: 1, items: [] }
    const order = await ordersService.createOrder(orderData)
    expect(order.id).toBeDefined()
  })
})

// src/components/__tests__/dashboard.test.tsx
describe('Dashboard Component', () => {
  test('should render without crashing', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
```

### Task 3: Documentación Base (8 horas)

```markdown
# docs/ARCHITECTURE.md
# Arquitectura del Sistema SmartOrders

## Stack Tecnológico
- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router  
- **State**: Zustand
- **UI**: ShadcnUI + Tailwind CSS
- **HTTP**: Axios
- **Charts**: Recharts

## Estructura de Carpetas
/src
  /components    - Componentes reutilizables
  /features      - Módulos de negocio
  /services      - Lógica de API
  /stores        - Estado global
  /routes        - Definición de rutas
  /hooks         - Custom hooks
```

---

## 📊 FASE 1: DASHBOARD CON DATOS REALES

### Sprint 1, Day 1: API Service (8 horas)

**Crear servicio de dashboard:**
```typescript
// src/services/dashboard/dashboard.service.ts
export interface DashboardMetrics {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  ordersByStatus: Record<OrderStatus, number>
  revenueByMonth: Array<{
    month: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    id: number
    name: string
    sales: number
    revenue: number
  }>
  lowStockAlerts: Array<{
    id: number
    product_name: string
    current_stock: number
    min_stock: number
  }>
  recentOrders: Order[]
}

export interface DateRange {
  from: Date
  to: Date
}

export const dashboardService = {
  async getMetrics(dateRange?: DateRange): Promise<DashboardMetrics> {
    const params = dateRange ? {
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString()
    } : undefined

    return apiClient.get<DashboardMetrics>('/dashboard/metrics', params)
  },

  async getRevenueChart(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ChartData[]> {
    return apiClient.get<ChartData[]>(`/dashboard/revenue-chart?period=${period}`)
  },

  async getOrdersChart(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ChartData[]> {
    return apiClient.get<ChartData[]>(`/dashboard/orders-chart?period=${period}`)
  }
}
```

### Sprint 1, Day 2: KPI Components (6 horas)

```typescript
// src/features/dashboard/components/metrics-cards.tsx
interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon: LucideIcon
  formatter?: (value: number) => string
}

export function MetricCard({ title, value, change, icon: Icon, formatter }: MetricCardProps) {
  const formattedValue = typeof value === 'number' && formatter 
    ? formatter(value) 
    : value.toString()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change && (
          <p className={cn(
            "text-xs flex items-center",
            change.trend === 'up' ? "text-green-600" : 
            change.trend === 'down' ? "text-red-600" : "text-muted-foreground"
          )}>
            {change.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
             change.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
            {change.value > 0 ? '+' : ''}{change.value}% desde {change.period}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function MetricsCards({ metrics, isLoading }: { 
  metrics: DashboardMetrics | null
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Ingresos del Mes"
        value={metrics.totalRevenue}
        formatter={(value) => `Q${value.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}
        change={{ value: 15.3, period: 'mes pasado', trend: 'up' }}
        icon={TrendingUp}
      />
      <MetricCard
        title="Total Pedidos"
        value={metrics.totalOrders}
        change={{ value: 12.7, period: 'mes pasado', trend: 'up' }}
        icon={ShoppingCart}
      />
      <MetricCard
        title="Valor Promedio"
        value={metrics.avgOrderValue}
        formatter={(value) => `Q${value.toFixed(2)}`}
        change={{ value: -2.1, period: 'mes pasado', trend: 'down' }}
        icon={Calculator}
      />
      <MetricCard
        title="Stock Bajo"
        value={metrics.lowStockAlerts.length}
        icon={AlertTriangle}
      />
    </div>
  )
}
```

### Sprint 1, Day 3: Charts Integration (6 horas)

```typescript
// src/features/dashboard/components/revenue-chart.tsx
export function RevenueChart({ data, isLoading }: { 
  data: DashboardMetrics['revenueByMonth'] 
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Mes</CardTitle>
        <CardDescription>
          Evolución de ingresos en los últimos 12 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Q${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [
                `Q${Number(value).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
                'Ingresos'
              ]}
              labelStyle={{ color: '#888888' }}
            />
            <Bar
              dataKey="revenue"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Sprint 1, Day 4: Date Filters (4 horas)

```typescript
// src/features/dashboard/components/date-range-picker.tsx
export function DateRangePicker({ 
  value, 
  onChange 
}: { 
  value?: DateRange
  onChange: (range: DateRange | undefined) => void 
}) {
  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y", { locale: es })} -{" "}
                  {format(value.to, "LLL dd, y", { locale: es })}
                </>
              ) : (
                format(value.from, "LLL dd, y", { locale: es })
              )
            ) : (
              <span>Selecciona un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        onClick={() => onChange(undefined)}
        className="px-3"
      >
        Limpiar
      </Button>
    </div>
  )
}
```

### Sprint 1, Day 5: Integration & Testing (4 horas)

```typescript
// src/features/dashboard/index.tsx - VERSIÓN ACTUALIZADA
export function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics', dateRange],
    queryFn: () => dashboardService.getMetrics(dateRange),
    refetchInterval: 5 * 60 * 1000, // Refresh cada 5 minutos
  })

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Error al cargar datos</h2>
            <p className="text-muted-foreground">
              No se pudieron cargar las métricas del dashboard.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <PermissionGuard 
        reportPermission="can_view"
        fallback={<AccessDenied />}
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button onClick={() => generateReport()}>
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <MetricsCards metrics={metrics} isLoading={isLoading} />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <RevenueChart 
                  data={metrics?.revenueByMonth || []} 
                  isLoading={isLoading} 
                />
              </div>
              <div className="col-span-3">
                <RecentOrders 
                  orders={metrics?.recentOrders || []} 
                  isLoading={isLoading} 
                />
              </div>
            </div>

            {metrics && metrics.lowStockAlerts.length > 0 && (
              <LowStockAlerts alerts={metrics.lowStockAlerts} />
            )}
          </TabsContent>
        </Tabs>
      </PermissionGuard>
    </Main>
  )
}
```

---

## 💳 FASE 1: SISTEMA DE PAGOS

### Modelo de Datos
```typescript
// src/services/payments/types.ts
export interface Payment {
  id: number
  order_id: number
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference?: string
  notes?: string
  created_by: number
  created_at: string
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'check'

export interface PaymentSummary {
  order_id: number
  total_amount: number
  paid_amount: number
  pending_amount: number
  overdue_amount: number
  payments: Payment[]
  payment_status: PaymentStatus
}

export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue'
```

### Componentes UI
```typescript
// src/features/payments/components/payment-panel.tsx
export function PaymentPanel({ orderId }: { orderId: number }) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['payment-summary', orderId],
    queryFn: () => paymentsService.getPaymentSummary(orderId)
  })

  const addPaymentMutation = useMutation({
    mutationFn: paymentsService.addPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-summary', orderId] })
      toast.success('Pago registrado exitosamente')
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gestión de Pagos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <>
            <PaymentSummaryDisplay summary={summary} />
            <PaymentHistory payments={summary.payments} />
            <AddPaymentForm 
              orderId={orderId}
              pendingAmount={summary.pending_amount}
              onSubmit={addPaymentMutation.mutate}
              isLoading={addPaymentMutation.isPending}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 🎯 CRITERIOS DE TESTING PARA CADA FEATURE

### Dashboard Tests:
```typescript
describe('Dashboard Integration', () => {
  test('should display real metrics from API', async () => {
    // Mock successful API response
    server.use(
      rest.get('/api/v1/dashboard/metrics', (req, res, ctx) => {
        return res(ctx.json(mockDashboardMetrics))
      })
    )

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Q24,995.50')).toBeInTheDocument()
      expect(screen.getByText('89')).toBeInTheDocument()
    })
  })

  test('should handle API errors gracefully', async () => {
    server.use(
      rest.get('/api/v1/dashboard/metrics', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos')).toBeInTheDocument()
    })
  })
})
```

---

## 📈 MÉTRICAS DE ÉXITO TÉCNICAS

### Performance Targets:
- **Initial Load**: <2 segundos
- **Dashboard Refresh**: <500ms
- **API Response Time**: <300ms promedio
- **Bundle Size**: <1MB total

### Quality Gates:
- **Test Coverage**: >80% para servicios críticos
- **TypeScript**: 100% tipado, no `any`
- **Linting**: 0 errores, 0 warnings
- **Accessibility**: Score >90 en Lighthouse

### Monitoring:
```typescript
// src/utils/analytics.ts
export function trackFeatureUsage(feature: string, action: string, metadata?: any) {
  if (ENV.ENVIRONMENT !== 'production') return
  
  // Implementar tracking real
  analytics.track(`${feature}:${action}`, {
    timestamp: new Date().toISOString(),
    user_id: useAuthStore.getState().auth.user?.id,
    ...metadata
  })
}
```

---

*Este documento se actualizará conforme avance el desarrollo. Versión actual: 1.0*

