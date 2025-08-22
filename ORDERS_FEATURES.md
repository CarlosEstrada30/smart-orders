# Funcionalidades de Órdenes - Smart Orders API

## Descripción General

Se han implementado las funcionalidades completas de gestión de órdenes para la aplicación Smart Orders, conectando con la API REST de Smart Orders.

## Funcionalidades Implementadas

### 1. Listado de Órdenes (`/orders`)
- **Vista de tabla** con todas las órdenes desde la API
- **Búsqueda** por número de orden, cliente o ID
- **Filtros** por estado (pendiente, confirmado, en proceso, enviado, entregado, cancelado)
- **Acciones rápidas** desde el menú desplegable:
  - Ver detalles
  - Editar orden
  - Eliminar orden
- **Confirmación de eliminación** con diálogo

### 2. Creación de Órdenes (`/new-order`)
- **Selección de cliente** desde API con filtrado en tiempo real
- **Selección de productos** desde API con filtrado en tiempo real
- **Combobox con búsqueda** para clientes y productos
- **Información detallada** en las opciones (email del cliente, precio y stock del producto)
- **Validación** de campos requeridos
- **Estados de carga** para clientes y productos
- **Redirección** automática al detalle de la orden creada

### 3. Detalle de Orden (`/orders/{orderId}`)
- **Vista completa** de la información de la orden
- **Modo de edición** inline para notas
- **Gestión de items**:
  - Agregar nuevos productos con filtrado
  - Modificar cantidades
  - Eliminar items
- **Cambio de estado** con combobox filtrable
- **Eliminación** de orden con confirmación
- **Resumen** con totales y estadísticas

### 4. Componente Combobox con Filtrado
- **Búsqueda en tiempo real** por nombre
- **Filtrado automático** de opciones
- **Estados deshabilitados** para items no disponibles
- **Información contextual** en las etiquetas
- **Placeholders personalizables**

### 5. Servicios de API

#### `ordersService`
- `getOrders(params?)` - Obtener lista de órdenes con paginación y filtros
- `getOrder(orderId)` - Obtener orden específica por ID
- `createOrder(orderData)` - Crear nueva orden
- `updateOrder(orderId, orderData)` - Actualizar orden existente
- `deleteOrder(orderId)` - Eliminar orden
- `updateOrderStatus(orderId, newStatus)` - Cambiar estado de orden
- `addOrderItem(orderId, item)` - Agregar item a orden
- `removeOrderItem(orderId, itemId)` - Remover item de orden
- `getOrdersByClient(clientId, params?)` - Obtener órdenes por cliente

#### `clientsService`
- `getClients(params?)` - Obtener lista de clientes activos
- Filtrado por estado activo/inactivo

#### `productsService`
- `getProducts(params?)` - Obtener lista de productos activos
- Filtrado por estado activo/inactivo y categoría

## Estados de Orden

La aplicación maneja los siguientes estados de orden según la API:

- **pending** - Pendiente
- **confirmed** - Confirmado  
- **in_progress** - En Proceso
- **shipped** - Enviado
- **delivered** - Entregado
- **cancelled** - Cancelado

## Estructura de Datos

### Order
```typescript
interface Order {
  id?: number
  order_number?: string
  client_id: number
  client_name?: string
  status: OrderStatus
  notes?: string
  total_amount?: number
  created_at?: string
  updated_at?: string
  items: OrderItem[]
}
```

### OrderItem
```typescript
interface OrderItem {
  id?: number
  product_id: number
  quantity: number
  unit_price: number
  total_price?: number
  product_name?: string
}
```

### Client
```typescript
interface Client {
  id: number
  name: string
  email: string
  phone: string
  address: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}
```

### Product
```typescript
interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  sku: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}
```

## Rutas Implementadas

- `GET /orders` - Lista de órdenes
- `POST /orders` - Crear orden
- `GET /orders/{orderId}` - Detalle de orden
- `PUT /orders/{orderId}` - Actualizar orden
- `DELETE /orders/{orderId}` - Eliminar orden
- `POST /orders/{orderId}/status/{newStatus}` - Cambiar estado
- `POST /orders/{orderId}/items` - Agregar item
- `DELETE /orders/{orderId}/items/{itemId}` - Remover item
- `GET /orders/client/{clientId}` - Órdenes por cliente
- `GET /clients` - Lista de clientes
- `GET /products` - Lista de productos

## Características Técnicas

- **Integración completa** con la API de Smart Orders
- **Servicios reales** para clientes y productos
- **Filtrado en tiempo real** con componente Combobox
- **Manejo de errores** con mensajes informativos
- **Estados de carga** para mejor UX
- **Validación** de formularios
- **Confirmaciones** para acciones destructivas
- **Navegación** fluida entre vistas
- **Responsive design** para diferentes dispositivos
- **Información contextual** en las opciones de selección

## Componente Combobox

El componente Combobox proporciona:

- **Búsqueda en tiempo real** por texto
- **Filtrado automático** de opciones
- **Estados deshabilitados** para opciones no disponibles
- **Información detallada** en las etiquetas
- **Placeholders personalizables**
- **Mensajes de error personalizables**

### Uso del Combobox

```typescript
<Combobox
  options={options}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Selecciona una opción"
  searchPlaceholder="Buscar..."
  emptyMessage="No se encontraron resultados."
  disabled={loading}
/>
```

## Próximas Mejoras

- Filtros avanzados por fecha y rango de precios
- Exportación de órdenes a PDF
- Notificaciones en tiempo real de cambios de estado
- Historial de cambios de estado
- Dashboard con estadísticas de órdenes
- Búsqueda avanzada con múltiples criterios
- Paginación en listas grandes
- Cache de datos para mejor rendimiento 