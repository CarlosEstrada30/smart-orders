import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, CheckCircle, AlertCircle, Package, AlertTriangle, DollarSign } from 'lucide-react'
import { type OrderStatus, type Order } from '../data/schema'
import { getOrderStatusData } from '../data/data'
import { cn } from '@/lib/utils'
import { type BulkOrderStatusResponse } from '@/services/orders'
import { StockErrorModal } from './stock-error-modal'
import { BulkPaymentsModal } from './bulk-payments-modal'

interface BulkActionsToolbarProps {
  selectedOrders: number[]
  orders: Order[] // Órdenes completas para pagos múltiples
  onBulkStatusChange: (orderIds: number[], newStatus: OrderStatus) => Promise<BulkOrderStatusResponse>
  onClearSelection: () => void
  onStockError?: (result: BulkOrderStatusResponse) => void
  onPaymentsCreated?: () => void
  loading?: boolean
}

const orderStatuses: OrderStatus[] = [
  'pending',
  'confirmed', 
  'in_progress',
  'shipped',
  'delivered',
  'cancelled'
]

export function BulkActionsToolbar({ 
  selectedOrders,
  orders,
  onBulkStatusChange,
  onClearSelection,
  onStockError,
  onPaymentsCreated,
  loading = false 
}: BulkActionsToolbarProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [bulkResult, setBulkResult] = useState<BulkOrderStatusResponse | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showStockErrorModal, setShowStockErrorModal] = useState(false)

  const handleStatusChange = async () => {
    if (!selectedStatus) return

    try {
      setIsUpdating(true)
      const result = await onBulkStatusChange(selectedOrders, selectedStatus)
      setBulkResult(result)
      
      // Verificar si hay órdenes que fallaron por stock
      const hasStockErrors = result.failed_details.some(order => order.error_type === 'stock_validation_failed')
      
      if (hasStockErrors) {
        // Pasar el resultado al componente padre para mostrar el modal de errores de stock
        if (onStockError) {
          onStockError(result)
        }
        setIsStatusDialogOpen(false)
        setSelectedStatus(null)
      } else {
        // Mostrar resultados normales
        setShowResults(true)
        setShowStockErrorModal(false) // Asegurar que el modal de stock no se muestre
        
        setIsStatusDialogOpen(false)
        setSelectedStatus(null)
      }
    } catch (_error) {
      // Error handled by parent component
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCloseResults = () => {
    setShowResults(false)
    setBulkResult(null)
    onClearSelection()
  }

  const handleCloseStockErrorModal = () => {
    setShowStockErrorModal(false)
    setBulkResult(null)
    // No llamar onClearSelection() aquí para evitar recargar la página
  }

  const handleCloseStockErrorModalAndClear = () => {
    setShowStockErrorModal(false)
    setBulkResult(null)
    onClearSelection()
  }

  if (selectedOrders.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">
            {selectedOrders.length} orden{selectedOrders.length !== 1 ? 'es' : ''} seleccionada{selectedOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaymentsModalOpen(true)}
            disabled={loading || isUpdating}
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Registrar Pagos
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatusDialogOpen(true)}
            disabled={loading || isUpdating}
          >
            Cambiar Estado
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={loading || isUpdating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Órdenes</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para {selectedOrders.length} orden{selectedOrders.length !== 1 ? 'es' : ''} seleccionada{selectedOrders.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nuevo Estado</label>
              <Select value={selectedStatus || ''} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => {
                    const statusData = getOrderStatusData(status)
                    const IconComponent = statusData.icon
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{statusData.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus && (
              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">
                  Las órdenes cambiarán al estado: 
                  <Badge 
                    variant="outline" 
                    className={cn('ml-2', getOrderStatusData(selectedStatus).color)}
                  >
                    {(() => {
                      const statusData = getOrderStatusData(selectedStatus)
                      const IconComponent = statusData.icon
                      return (
                        <>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {statusData.label}
                        </>
                      )
                    })()}
                  </Badge>
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={!selectedStatus || isUpdating}
            >
              {isUpdating ? 'Actualizando...' : 'Cambiar Estado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de resultados detallados */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultados del Cambio de Estado</DialogTitle>
            <DialogDescription>
              Detalles de la actualización masiva de {bulkResult?.total_orders} orden{bulkResult?.total_orders !== 1 ? 'es' : ''}
            </DialogDescription>
          </DialogHeader>
          
          {bulkResult && (
            <div className="space-y-4">
              {/* Resumen general */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Exitosas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{bulkResult.updated_count}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">Fallidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{bulkResult.failed_count}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bulkResult.total_orders}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Órdenes exitosas */}
              {bulkResult.success_details.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Órdenes Actualizadas Exitosamente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {bulkResult.success_details.map((order) => (
                      <div key={order.order_id} className="border rounded-lg p-3 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Orden {order.order_number || `#${order.order_id}`}
                          </span>
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            {bulkResult.status}
                          </Badge>
                        </div>
                        {order.products_updated.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Productos actualizados:</p>
                            {order.products_updated.map((product) => (
                              <div key={product.product_id} className="flex items-center space-x-2 text-sm">
                                <Package className="h-3 w-3" />
                                <span>{product.product_name}</span>
                                <span className="text-muted-foreground">({product.product_sku})</span>
                                <span className="text-muted-foreground">- Q{product.unit_price} x {product.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Órdenes fallidas */}
              {bulkResult.failed_details.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>Órdenes con Errores</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {bulkResult.failed_details.map((order) => (
                      <div key={order.order_id} className="border rounded-lg p-3 bg-red-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Orden {order.order_number || `#${order.order_id}`}
                          </span>
                          <Badge variant="outline" className="text-red-700 border-red-300">
                            {order.error_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-red-600 mb-2">{order.error_message}</p>
                        {order.products_with_errors.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Productos con errores:</p>
                            {order.products_with_errors.map((product) => (
                              <div key={product.product_id} className="flex items-center space-x-2 text-sm">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span>{product.product_name}</span>
                                <span className="text-muted-foreground">({product.product_sku})</span>
                                <span className="text-red-600">- {product.error_message}</span>
                                {product.required_quantity && product.available_quantity && (
                                  <span className="text-muted-foreground">
                                    (Requerido: {product.required_quantity}, Disponible: {product.available_quantity})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseResults} className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal especial para errores de stock */}
      {bulkResult && (
        <>
          <StockErrorModal
            isOpen={showStockErrorModal}
            onClose={handleCloseStockErrorModal}
            onCloseAndClear={handleCloseStockErrorModalAndClear}
            bulkResult={bulkResult}
          />
        </>
      )}

      {/* Modal de pagos múltiples */}
      <BulkPaymentsModal
        open={isPaymentsModalOpen}
        onOpenChange={setIsPaymentsModalOpen}
        orders={orders}
        onPaymentsCreated={() => {
          onPaymentsCreated?.()
          onClearSelection()
        }}
      />
    </>
  )
}
