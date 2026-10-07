import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Package, XCircle } from 'lucide-react'
import { type BulkOrderStatusResponse } from '@/services/orders'
import { cn } from '@/lib/utils'

interface StockErrorModalProps {
  isOpen: boolean
  onClose: () => void
  onCloseAndClear?: () => void
  bulkResult: BulkOrderStatusResponse
}

export function StockErrorModal({ isOpen, onClose, onCloseAndClear, bulkResult }: StockErrorModalProps) {
  console.log('StockErrorModal rendered:', { isOpen, bulkResult })
  console.log('StockErrorModal isOpen:', isOpen)
  
  // Filtrar solo órdenes que fallaron por stock
  const stockFailedOrders = bulkResult.failed_details.filter(
    order => order.error_type === 'stock_validation_failed'
  )
  
  console.log('Stock failed orders:', stockFailedOrders)

  // Contar total de productos con problemas de stock
  const totalProductsWithStockIssues = stockFailedOrders.reduce(
    (total, order) => total + order.products_with_errors.length,
    0
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <XCircle className="h-6 w-6 text-destructive" />
            <span>Algunos pedidos no cambiaron por falta de stock</span>
          </DialogTitle>
          <DialogDescription>
            {bulkResult.failed_count} orden{bulkResult.failed_count !== 1 ? 'es' : ''} no pudo{bulkResult.failed_count !== 1 ? 'ron' : ''} ser actualizada{bulkResult.failed_count !== 1 ? 's' : ''} debido a falta de stock en {totalProductsWithStockIssues} producto{totalProductsWithStockIssues !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Resumen de errores */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-destructive/30 bg-destructive/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Pedidos sin cambiar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{bulkResult.failed_count}</div>
                <p className="text-xs text-destructive mt-1">Por falta de stock</p>
              </CardContent>
            </Card>
            <Card className="border-warning/50 bg-warning/15">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-warning-foreground dark:text-warning">Productos afectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning-foreground dark:text-warning">{totalProductsWithStockIssues}</div>
                <p className="text-xs text-warning-foreground dark:text-warning mt-1">Con stock insuficiente</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de órdenes con problemas de stock */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-destructive">Pedidos con stock insuficiente</h3>
            {stockFailedOrders.map((order) => (
              <Card key={order.order_id} className="border-destructive/30 bg-destructive/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Orden {order.order_number || `#${order.order_id}`}
                    </CardTitle>
                    <Badge variant="outline" className="text-destructive border-destructive/30">
                      Stock Insuficiente
                    </Badge>
                  </div>
                  <CardDescription className="text-destructive">
                    {order.error_message}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">Productos con stock insuficiente:</p>
                    {order.products_with_errors.map((product) => (
                      <div key={product.product_id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-destructive/30">
                        <div className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-destructive" />
                          <div>
                            <p className="font-medium text-sm">{product.product_name}</p>
                            <p className="text-xs text-muted-foreground">SKU: {product.product_sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Requerido:</span>
                            <Badge variant="outline" className="text-destructive border-destructive/30">
                              {product.required_quantity}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-muted-foreground">Disponible:</span>
                            <Badge variant="outline" className="text-warning-foreground dark:text-warning border-warning/50">
                              {product.available_quantity}
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-destructive">
                              Faltan: {product.required_quantity! - product.available_quantity!} unidades
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Información adicional */}
          <Card className="border-info/30 bg-info/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-info flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>¿Qué hacer ahora?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-info space-y-1">
                <p>• Revisa el inventario de los productos mencionados</p>
                <p>• Actualiza el stock disponible en el sistema</p>
                <p>• Intenta cambiar el estado nuevamente después de actualizar el stock</p>
                <p>• Contacta al administrador si necesitas ayuda</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Entendido
          </Button>
          {onCloseAndClear && (
            <Button onClick={onCloseAndClear} className="flex-1">
              Cerrar y Limpiar Selección
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
