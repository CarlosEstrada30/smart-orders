# Plan de Implementación: Pagos Múltiples de Órdenes

## 📋 Resumen

Implementar funcionalidad para registrar pagos de múltiples órdenes simultáneamente, mejorando la eficiencia del proceso y proporcionando una excelente experiencia de usuario.

## 🎯 Objetivos

1. Permitir seleccionar múltiples órdenes y registrar pagos en una sola operación
2. Validar que las órdenes seleccionadas puedan recibir pagos (no canceladas, con saldo pendiente)
3. Mostrar resumen claro de las órdenes seleccionadas antes de procesar
4. Proporcionar feedback detallado sobre pagos exitosos y errores
5. Mantener consistencia con el diseño existente del sistema

## 🏗️ Arquitectura

### 1. Actualización de Tipos TypeScript

**Archivo:** `src/services/payments/types.ts`

Agregar tipos para pagos bulk:
- `CreateBulkPaymentRequest` - Request con array de pagos
- `BulkPaymentResponse` - Respuesta con pagos creados, totales y errores
- `PaymentError` - Tipo para errores individuales de pagos

### 2. Servicio de Pagos

**Archivo:** `src/services/payments/payments.service.ts`

Agregar método:
- `createBulkPayments(request: CreateBulkPaymentRequest): Promise<BulkPaymentResponse>`

### 3. Componentes UI

#### 3.1. BulkPaymentsModal
**Archivo:** `src/features/orders/components/bulk-payments-modal.tsx`

**Características:**
- Resumen de órdenes seleccionadas con información clave:
  - Número de orden
  - Cliente
  - Total de la orden
  - Saldo pendiente
  - Estado de pago actual
- Validación previa:
  - Filtrar órdenes canceladas
  - Filtrar órdenes ya pagadas completamente
  - Mostrar advertencias para órdenes que no pueden recibir pagos
- Configuración de pagos:
  - Opción 1: Método de pago común para todas las órdenes
  - Opción 2: Método de pago individual por orden (modo avanzado)
  - Campo de notas común (opcional)
  - Opción de "Pagar saldo completo" o "Monto personalizado"
- Indicadores visuales:
  - Badges de estado de pago
  - Íconos de advertencia para órdenes inválidas
  - Total acumulado de pagos a procesar

#### 3.2. BulkPaymentsResultsModal
**Archivo:** `src/features/orders/components/bulk-payments-results-modal.tsx`

**Características:**
- Resumen de resultados:
  - Total de pagos procesados
  - Pagos exitosos (con contador y monto total)
  - Pagos fallidos (con contador)
- Lista de pagos exitosos:
  - Número de orden
  - Cliente
  - Monto pagado
  - Método de pago
  - Número de pago generado
- Lista de errores:
  - Número de orden
  - Cliente (si existe)
  - Razón del error
  - Monto intentado
- Acciones:
  - Botón para cerrar y refrescar datos
  - Opción de copiar resumen

### 4. Integración con BulkActionsToolbar

**Archivo:** `src/features/orders/components/bulk-actions-toolbar.tsx`

Agregar:
- Botón "Registrar Pagos" junto al botón "Cambiar Estado"
- Validar que haya órdenes seleccionadas con saldo pendiente
- Abrir BulkPaymentsModal al hacer clic
- Pasar callback para refrescar datos después de procesar

### 5. Integración con OrdersTable

**Archivo:** `src/features/orders/components/orders-table.tsx`

Modificar:
- Pasar datos completos de órdenes seleccionadas (no solo IDs) al BulkActionsToolbar
- Agregar callback `onBulkPaymentsCreated` para refrescar datos

## 🎨 Diseño UX/UI

### Flujo de Usuario

1. **Selección de Órdenes**
   - Usuario selecciona múltiples órdenes usando checkboxes
   - Aparece BulkActionsToolbar con opciones disponibles

2. **Abrir Modal de Pagos**
   - Usuario hace clic en "Registrar Pagos"
   - Se valida que haya órdenes válidas para pagar
   - Se abre BulkPaymentsModal con resumen

3. **Revisión y Configuración**
   - Usuario revisa las órdenes seleccionadas
   - Ve advertencias para órdenes que no pueden recibir pagos
   - Configura método de pago (común o individual)
   - Opcionalmente ajusta montos individuales
   - Agrega notas si es necesario

4. **Procesamiento**
   - Usuario confirma y envía
   - Se muestra estado de carga
   - Se procesan todos los pagos válidos

5. **Resultados**
   - Se muestra modal de resultados con:
     - Resumen de éxitos y errores
     - Lista detallada de cada pago procesado
     - Lista de errores con razones
   - Usuario puede cerrar y refrescar datos

### Estados Visuales

- **Órdenes válidas:** Fondo normal, badge de estado de pago
- **Órdenes canceladas:** Fondo gris, badge "Cancelada", deshabilitada
- **Órdenes pagadas:** Fondo gris claro, badge "Pagada", deshabilitada
- **Órdenes con saldo pendiente:** Resaltadas, badge de saldo pendiente

### Validaciones en Tiempo Real

- Deshabilitar órdenes canceladas o pagadas completamente
- Validar que el monto no exceda el saldo pendiente
- Mostrar total acumulado de pagos
- Advertencia si se intenta pagar más del saldo

## 🔧 Detalles Técnicos

### Estructura de Datos

```typescript
// Request
interface CreateBulkPaymentRequest {
  payments: Array<{
    order_id: number
    amount: number
    payment_method: PaymentMethod
    notes?: string | null
  }>
}

// Response
interface BulkPaymentResponse {
  payments: Payment[]
  total_payments: number
  total_amount: number
  success_count: number
  failed_count: number
  errors: Array<{
    order_id: number
    order_number: string | null
    client_name: string | null
    amount: number
    payment_method: PaymentMethod
    reason: string
    notes?: string | null
  }>
}
```

### Validaciones del Frontend

1. **Antes de abrir el modal:**
   - Verificar que haya órdenes seleccionadas
   - Filtrar órdenes canceladas
   - Filtrar órdenes completamente pagadas

2. **En el modal:**
   - Validar montos individuales
   - Validar que no excedan saldo pendiente
   - Mostrar advertencias para órdenes problemáticas

3. **Antes de enviar:**
   - Verificar que al menos un pago sea válido
   - Validar que todos los montos sean > 0
   - Confirmar método de pago seleccionado

### Manejo de Errores

- **Errores de validación:** Mostrar en el modal antes de enviar
- **Errores del servidor:** Mostrar en modal de resultados
- **Errores parciales:** Procesar pagos válidos, reportar errores
- **Errores de red:** Mostrar mensaje de error y permitir reintentar

## 📝 Consideraciones Especiales

1. **Rendimiento:**
   - Limitar número máximo de órdenes procesadas (sugerencia: 50)
   - Mostrar indicador de progreso para grandes lotes
   - Usar debounce para validaciones en tiempo real

2. **Accesibilidad:**
   - Labels descriptivos
   - Mensajes de error claros
   - Navegación por teclado
   - ARIA labels apropiados

3. **Responsive:**
   - Modal adaptable a móviles
   - Tabla de resultados con scroll horizontal si es necesario
   - Botones accesibles en pantallas pequeñas

4. **Internacionalización:**
   - Todos los textos en español (consistente con el sistema)
   - Formato de moneda: Q (Quetzales)
   - Formato de fechas: DD/MM/YYYY

## 🚀 Orden de Implementación

1. ✅ Actualizar tipos TypeScript
2. ✅ Agregar método al servicio de pagos
3. ✅ Crear BulkPaymentsModal básico
4. ✅ Crear BulkPaymentsResultsModal
5. ✅ Integrar con BulkActionsToolbar
6. ✅ Integrar con OrdersTable
7. ✅ Agregar validaciones y mejoras UX
8. ✅ Testing y refinamiento

## 🎯 Casos de Uso

### Caso 1: Pago Completo de Múltiples Órdenes
- Usuario selecciona 5 órdenes con saldo pendiente
- Configura método de pago común (efectivo)
- Selecciona "Pagar saldo completo" para todas
- Procesa y todas se marcan como pagadas

### Caso 2: Pago Parcial de Múltiples Órdenes
- Usuario selecciona 3 órdenes
- Configura método de pago común (transferencia)
- Ajusta montos individuales para pagos parciales
- Procesa y las órdenes quedan con estado "Pago Parcial"

### Caso 3: Pago con Errores
- Usuario selecciona 10 órdenes (2 canceladas, 8 válidas)
- El sistema filtra automáticamente las canceladas
- Procesa las 8 válidas
- Muestra resultados: 8 exitosas, 2 errores (con razones)

### Caso 4: Método de Pago Individual
- Usuario selecciona 3 órdenes
- Activa modo "Método individual"
- Configura efectivo para orden 1, transferencia para orden 2, tarjeta para orden 3
- Procesa con métodos diferentes

## 📊 Métricas de Éxito

- Tiempo de procesamiento < 3 segundos para 10 órdenes
- Tasa de éxito > 95% en condiciones normales
- Feedback visual claro en < 500ms
- Reducción de tiempo de registro de pagos en 70%



