# Implementación Frontend - Flujo Fábrica de Lácteos

## 📋 Resumen Ejecutivo

Plan de implementación del frontend para soportar el flujo de fábrica de lácteos con **órdenes libres sin restricción de stock** y **dashboard de producción inteligente**.

### 🎯 Objetivos Principales
- ✅ Crear órdenes sin limitación de stock actual
- ✅ Editar órdenes pendientes libremente  
- ✅ Dashboard consolidado para el equipo de producción
- ✅ Evaluación automática FIFO de completitud
- ✅ Confirmación controlada con validación de stock

---

## 🚀 **ETAPA 1: Órdenes Pendientes Sin Restricciones + Edición Libre**

### 🎯 **Objetivo**
Permitir crear y editar órdenes en estado PENDING sin validar stock, dando flexibilidad máxima al equipo de ventas.

### 📝 **Componentes a Modificar**

#### **1. NewOrderPage.tsx - Remover Validaciones de Stock**
```typescript
// ❌ REMOVER estas validaciones:
if (totalQuantity > product.stock) {
  setStockError(`Stock insuficiente...`)
  return
}

// ✅ CAMBIAR A:
// Solo validar que el producto existe y está activo
if (!product || !product.is_active) {
  setError('Producto no válido o inactivo')
  return
}
```

**Cambios específicos:**
- Eliminar función `validateStock()`
- Remover `stockError` state y sus referencias
- Actualizar `productOptions` para no deshabilitar por stock
- Cambiar placeholder de productos: `"${product.name} - Q${product.price.toFixed(2)}"` (sin stock)

#### **2. Crear EditOrderPage.tsx - Nueva Página**
```typescript
// 📄 /routes/_authenticated/edit-order/$orderId/edit-order-page.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
// ... imports similares a NewOrderPage

export function EditOrderPage() {
  // Estados similares a NewOrderPage + carga de datos existentes
  const { orderId } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Cargar orden existente
  useEffect(() => {
    loadOrderData()
  }, [orderId])
  
  // Funciones de edición
  const handleUpdateOrder = async () => {
    // Usar ordersService.updateOrderComplete()
  }
  
  // UI similar a NewOrderPage pero con datos precargados
}
```

**Funcionalidades:**
- ✅ Pre-cargar datos existentes (cliente, ruta, items, notas)
- ✅ Permitir modificar cualquier campo 
- ✅ Agregar/quitar productos libremente
- ✅ Cambiar cantidades sin restricción
- ✅ Solo disponible para órdenes con `status === 'pending'`
- ✅ Recalculo automático de totales

#### **3. Modificar OrderDetailPage.tsx - Agregar Botón Editar**
```typescript
// Agregar en la sección de botones de acción:
{order.status === 'pending' && (
  <PermissionGuard orderPermission="can_update">
    <Link to="/edit-order/$orderId" params={{ orderId: order.id!.toString() }}>
      <Button variant="outline" size="sm">
        <Edit className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Editar</span>
      </Button>
    </Link>
  </PermissionGuard>
)}
```

#### **4. Actualizar OrdersColumns.tsx - Acción de Editar**
```typescript
// En el DropdownMenu de acciones:
{order.status === 'pending' && (
  <DropdownMenuItem 
    onClick={() => navigate({ 
      to: '/edit-order/$orderId', 
      params: { orderId: order.id!.toString() } 
    })}
  >
    <Edit className="mr-2 h-4 w-4" />
    Editar
  </DropdownMenuItem>
)}
```

#### **5. Crear Ruta de Edición**
```typescript
// 📄 /routes/_authenticated/edit-order/$orderId/route.tsx
import { createFileRoute } from '@tanstack/react-router'
import { EditOrderPage } from './edit-order-page'

export const Route = createFileRoute('/_authenticated/edit-order/$orderId')({
  component: EditOrderPage,
})
```

### 🎨 **Componentes Nuevos**
- `EditOrderPage.tsx` (página principal de edición)
- `EditOrderRoute.tsx` (configuración de ruta)

### 📱 **Mejoras UI/UX**
- **Toast notifications:** "Orden creada sin restricción de stock" / "Orden actualizada exitosamente"
- **Indicador visual:** Badge "SIN RESTRICCIÓN" en órdenes PENDING
- **Breadcrumbs:** Navegación clara "Órdenes > Editar > #123"
- **Confirmación:** Dialog antes de guardar cambios grandes

### ✅ **Criterios de Aceptación**
- [ ] Crear órdenes con cualquier cantidad, independiente del stock
- [ ] Editar órdenes PENDING: cambiar cliente, ruta, productos, cantidades
- [ ] Solo productos activos aparecen en selección
- [ ] Botón "Editar" visible solo para órdenes PENDING
- [ ] Recalculo automático de totales en edición
- [ ] UI responsive en móviles
- [ ] Validaciones básicas (cliente obligatorio, mínimo 1 producto)
- [ ] Historial de cambios (opcional)

### ⚠️ **Riesgo:** **BAJO** - Modificaciones controladas sin afectar lógica core

---

## 🏭 **ETAPA 2: Dashboard de Producción Inteligente**

### 🎯 **Objetivo**
Crear dashboard consolidado que muestre stock actual, demanda total por producto, y faltantes de producción para el equipo manufacturero.

### 📝 **Componentes a Crear**

#### **1. ProductionDashboardPage.tsx - Página Principal**
```typescript
// 📄 /routes/_authenticated/production-dashboard/production-dashboard-page.tsx
export function ProductionDashboardPage() {
  const [dashboardData, setDashboardData] = useState<ProductionDashboard | null>(null)
  
  return (
    <Main>
      <div className="space-y-6">
        {/* Header con controles */}
        <DashboardHeader onRefresh={handleRefresh} />
        
        {/* Cards de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ProductionSummaryCards data={dashboardData?.summary} />
        </div>
        
        {/* Tabla principal de productos */}
        <ProductionDemandTable data={dashboardData?.products} />
        
        {/* Órdenes completables vs incompletas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompletableOrdersList orders={dashboardData?.completable_orders} />
          <IncompleteOrdersList orders={dashboardData?.incomplete_orders} />
        </div>
      </div>
    </Main>
  )
}
```

#### **2. ProductionSummaryCards.tsx - Cards de Resumen**
```typescript
// Mostrar 4 cards principales:
export function ProductionSummaryCards({ data }: { data?: ProductionSummary }) {
  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
            <p className="text-2xl font-bold">{data?.total_orders || 0}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-blue-600" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completables</p>
            <p className="text-2xl font-bold text-green-600">{data?.completable_orders || 0}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Faltan Producir</p>
            <p className="text-2xl font-bold text-red-600">{data?.incomplete_orders || 0}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Productos Críticos</p>
            <p className="text-2xl font-bold text-orange-600">{data?.critical_products || 0}</p>
          </div>
          <Factory className="h-8 w-8 text-orange-600" />
        </CardContent>
      </Card>
    </>
  )
}
```

#### **3. ProductionDemandTable.tsx - Tabla Principal**
```typescript
// Tabla con columnas:
export function ProductionDemandTable({ data }: { data?: ProductDemand[] }) {
  const columns: ColumnDef<ProductDemand>[] = [
    {
      accessorKey: 'product_name',
      header: 'Producto',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('product_name')}</div>
      )
    },
    {
      accessorKey: 'current_stock',
      header: 'Stock Actual',
      cell: ({ row }) => {
        const stock = row.getValue('current_stock') as number
        return (
          <div className="flex items-center space-x-2">
            <span className="font-mono">{stock}</span>
            <StockStatusBadge stock={stock} />
          </div>
        )
      }
    },
    {
      accessorKey: 'total_ordered',
      header: 'Total Pedido',
      cell: ({ row }) => (
        <div className="font-mono font-bold">
          {row.getValue('total_ordered')}
        </div>
      )
    },
    {
      accessorKey: 'needed_production',
      header: 'Falta Producir',
      cell: ({ row }) => {
        const needed = row.getValue('needed_production') as number
        return (
          <div className={cn(
            "font-mono font-bold",
            needed > 0 ? "text-red-600" : "text-green-600"
          )}>
            {needed > 0 ? `+${needed}` : '✓ Suficiente'}
          </div>
        )
      }
    },
    {
      accessorKey: 'priority_level',
      header: 'Prioridad',
      cell: ({ row }) => {
        const priority = row.getValue('priority_level') as string
        return <PriorityBadge priority={priority} />
      }
    }
  ]
  
  return <DataTable columns={columns} data={data || []} />
}
```

#### **4. CompletableOrdersList.tsx - Órdenes Completables**
```typescript
// Lista de órdenes que SÍ pueden completarse
export function CompletableOrdersList({ orders }: { orders?: Order[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
          Órdenes Completables ({orders?.length || 0})
        </CardTitle>
        <CardDescription>
          Órdenes que pueden completarse con el stock actual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders?.map(order => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">#{order.order_number}</div>
                <div className="text-sm text-muted-foreground">{order.client?.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">Q{order.total_amount?.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  {order.items?.length} items
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### **5. IncompleteOrdersList.tsx - Órdenes Incompletas**
```typescript
// Lista de órdenes que NO pueden completarse
export function IncompleteOrdersList({ orders }: { orders?: Order[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          Órdenes Incompletas ({orders?.length || 0})
        </CardTitle>
        <CardDescription>
          Órdenes que requieren más producción
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders?.map(order => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
              <div>
                <div className="font-medium">#{order.order_number}</div>
                <div className="text-sm text-muted-foreground">{order.client?.name}</div>
                <div className="text-xs text-red-600 mt-1">
                  Productos faltantes: {/* Lista de faltantes */}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">Q{order.total_amount?.toFixed(2)}</div>
                <Badge variant="destructive" className="text-xs">
                  Incompleta
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 📊 **Tipos TypeScript**
```typescript
// Tipos para el dashboard de producción
interface ProductDemand {
  product_id: number
  product_name: string
  current_stock: number
  total_ordered: number
  needed_production: number
  priority_level: 'low' | 'medium' | 'high' | 'critical'
  orders_affected: number
}

interface ProductionSummary {
  total_orders: number
  completable_orders: number
  incomplete_orders: number
  critical_products: number
  last_updated: string
}

interface ProductionDashboard {
  summary: ProductionSummary
  products: ProductDemand[]
  completable_orders: Order[]
  incomplete_orders: Order[]
}
```

### 🔌 **Actualización del Service**
```typescript
// En ordersService.ts
export const ordersService = {
  // ... métodos existentes
  
  // Nuevo método para el dashboard
  async getProductionDashboard(): Promise<ProductionDashboard> {
    return apiClient.get<ProductionDashboard>('/orders/production-dashboard')
  },
  
  // Actualizar datos de producción
  async refreshProductionData(): Promise<ProductionDashboard> {
    return apiClient.post<ProductionDashboard>('/orders/production-dashboard/refresh')
  }
}
```

### 🧭 **Navegación**
```typescript
// Agregar en el sidebar/navigation
{
  name: 'Dashboard Producción',
  href: '/production-dashboard',
  icon: Factory,
  current: pathname.startsWith('/production-dashboard'),
  permission: 'production_dashboard_access' // Solo roles de producción
}
```

### ✅ **Criterios de Aceptación**
- [ ] Dashboard muestra stock actual vs demanda por producto
- [ ] Calcula automáticamente cuánto falta producir
- [ ] Lista órdenes completables vs incompletas
- [ ] Priorización visual por nivel de criticidad
- [ ] Actualización en tiempo real o manual
- [ ] Export a PDF/Excel del reporte de producción
- [ ] Responsive design para tablets en piso de producción
- [ ] Filtros por fecha, producto, prioridad

### ⚠️ **Riesgo:** **MEDIO** - Nueva funcionalidad compleja pero independiente

---

## ⚡ **ETAPA 3: Confirmación Manual con Validación**

### 🎯 **Objetivo**
Implementar proceso de confirmación donde al cambiar PENDING → CONFIRMED se valide y descuente stock realmente.

### 📝 **Implementación**

#### **1. ConfirmOrderButton.tsx - Componente de Confirmación**
```typescript
export function ConfirmOrderButton({ order, onConfirm }: Props) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [stockErrors, setStockErrors] = useState<StockError[]>([])
  
  const handleConfirm = async () => {
    try {
      setIsConfirming(true)
      await ordersService.confirmOrder(order.id!)
      onConfirm()
      setConfirmDialog(false)
    } catch (error) {
      if (error.stock_errors) {
        setStockErrors(error.stock_errors)
      }
    } finally {
      setIsConfirming(false)
    }
  }
  
  return (
    <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={order.status !== 'pending'}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Confirmar Orden
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Orden #{order.order_number}</DialogTitle>
          <DialogDescription>
            Esta acción validará stock y descontará inventario. ¿Continuar?
          </DialogDescription>
        </DialogHeader>
        
        {stockErrors.length > 0 && (
          <StockErrorAlert errors={stockErrors} />
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### **2. Integración en OrderDetailPage.tsx**
```typescript
// Agregar botón de confirmación
{order.status === 'pending' && (
  <ConfirmOrderButton 
    order={order} 
    onConfirm={loadOrder} // Recargar datos después de confirmar
  />
)}
```

### ✅ **Criterios de Aceptación**
- [ ] Solo órdenes PENDING pueden confirmarse
- [ ] Validación de stock antes de confirmar
- [ ] Errores específicos si stock insuficiente
- [ ] Descuento automático solo si confirmación exitosa
- [ ] Estado cambia a CONFIRMED solo si no hay errores

---

## 🎯 **ETAPA 4: Indicador de Completitud Visual**

### 🎯 **Objetivo**
Mostrar badge visual de si una orden puede completarse con stock actual.

### 📝 **Implementación**

#### **1. CompletionStatusBadge.tsx**
```typescript
export function CompletionStatusBadge({ status }: { status?: CompletionStatus }) {
  const getStatusConfig = (status?: CompletionStatus) => {
    switch (status) {
      case 'completable':
        return { 
          label: 'Completable', 
          variant: 'success' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'incomplete':
        return { 
          label: 'Incompleto', 
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return { 
          label: 'Por evaluar', 
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
    }
  }
  
  const config = getStatusConfig(status)
  
  return (
    <Badge variant={config.variant} className={cn('text-xs', config.className)}>
      <config.icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
```

#### **2. Integración en OrdersColumns.tsx**
```typescript
// Nueva columna de completitud
{
  id: 'completion_status',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Completitud" />
  ),
  cell: ({ row }) => (
    <CompletionStatusBadge status={row.original.completion_status} />
  ),
  filterFn: (row, id, value) => {
    return value.includes(row.getValue(id))
  },
  enableSorting: false,
}
```

---

## 🔄 **ETAPA 5: Evaluación FIFO Automática**

### 🎯 **Objetivo**
Botón para evaluar todas las órdenes PENDING en orden cronológico y determinar completitud.

### 📝 **Implementación**

#### **1. FIFOEvaluationButton.tsx**
```typescript
export function FIFOEvaluationButton() {
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [results, setResults] = useState<EvaluationResults | null>(null)
  const [showResults, setShowResults] = useState(false)
  
  const handleEvaluate = async () => {
    try {
      setIsEvaluating(true)
      const evaluationResults = await ordersService.evaluateOrdersCompletion()
      setResults(evaluationResults)
      setShowResults(true)
    } catch (error) {
      // Handle error
    } finally {
      setIsEvaluating(false)
    }
  }
  
  return (
    <>
      <Button onClick={handleEvaluate} disabled={isEvaluating} variant="outline">
        <Calculator className="mr-2 h-4 w-4" />
        {isEvaluating ? 'Evaluando...' : 'Evaluar FIFO'}
      </Button>
      
      <EvaluationResultsDialog 
        open={showResults} 
        onOpenChange={setShowResults}
        results={results}
      />
    </>
  )
}
```

---

## 📈 **ETAPA 6: Mejoras de Workflow y Estado**

### 🎯 **Objetivo**
Mejorar la visualización del flujo de estados y transiciones de órdenes.

### 📝 **Implementación**

#### **1. OrderStatusWorkflow.tsx**
```typescript
// Componente visual del flujo completo
export function OrderStatusWorkflow({ currentStatus, orderId }: Props) {
  const statuses = [
    { key: 'pending', label: 'Pendiente', icon: Package },
    { key: 'confirmed', label: 'Confirmado', icon: CheckCircle },
    { key: 'in_progress', label: 'En Proceso', icon: Loader },
    { key: 'shipped', label: 'Enviado', icon: Truck },
    { key: 'delivered', label: 'Entregado', icon: MapPin }
  ]
  
  return (
    <div className="flex items-center justify-between">
      {statuses.map((status, index) => (
        <div key={status.key} className="flex items-center">
          <StatusStep 
            status={status} 
            isActive={currentStatus === status.key}
            isCompleted={getStatusIndex(currentStatus) > index}
          />
          {index < statuses.length - 1 && <StatusConnector />}
        </div>
      ))}
    </div>
  )
}
```

---

## 🚀 **Plan de Implementación General**

### **Por cada etapa:**

1. ✅ **Backend Ready** - Esperar endpoints del backend
2. ✅ **Tipos TypeScript** - Actualizar schemas y tipos
3. ✅ **Componentes Core** - Implementar funcionalidad principal  
4. ✅ **Integración UI** - Conectar con páginas existentes
5. ✅ **Testing** - Pruebas unitarias e integración
6. ✅ **Deploy & Feedback** - Despliegue y validación con usuarios

### **Estimaciones de Tiempo:**
- **Etapa 1:** 3-5 días (creación libre + edición)
- **Etapa 2:** 5-7 días (dashboard completo)
- **Etapa 3:** 2-3 días (confirmación)
- **Etapa 4:** 1-2 días (badges visuales)
- **Etapa 5:** 3-4 días (evaluación FIFO)
- **Etapa 6:** 2-3 días (workflow visual)

**Total estimado:** 16-24 días de desarrollo

### **Dependencias:**
- 🔗 Endpoints del backend implementados
- 🔗 Tipos/schemas actualizados
- 🔗 Permisos de usuario configurados
- 🔗 Testing environment listo

---

## 📊 **Métricas de Éxito**

### **Etapa 1:**
- ✅ 0% errores de stock al crear órdenes
- ✅ 100% órdenes PENDING son editables
- ✅ <2 segundos tiempo de creación/edición

### **Etapa 2:**
- ✅ Dashboard carga en <3 segundos
- ✅ Datos actualizados cada 5 minutos
- ✅ 100% productos muestran stock vs demanda

### **Métricas Generales:**
- ✅ 95% satisfacción del equipo de ventas
- ✅ 90% reducción en tiempo de consolidación manual
- ✅ 0% errores de stock por órdenes confirmadas
- ✅ 100% visibilidad para equipo de producción

---

**Fecha de creación:** Septiembre 2025  
**Estado:** Planificación  
**Próximo paso:** Implementar Etapa 1 - Órdenes sin restricciones + Edición libre


