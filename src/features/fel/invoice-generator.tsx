/**
 * FEL Invoice Generator
 * Generador de facturas/comprobantes desde órdenes entregadas
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText,
  Receipt,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { felService } from '@/services/fel'
import { DocumentSelector } from '@/components/FEL'
import type { OrderWithoutDocument } from '@/services/fel/types'

interface InvoiceGeneratorState {
  orders: OrderWithoutDocument[]
  isLoading: boolean
  error: string | null
  selectedOrder: OrderWithoutDocument | null
  isProcessing: boolean
  processingOrderId: number | null
}

export function FELInvoiceGenerator() {
  const [state, setState] = useState<InvoiceGeneratorState>({
    orders: [],
    isLoading: true,
    error: null,
    selectedOrder: null,
    isProcessing: false,
    processingOrderId: null
  })

  // Cargar órdenes sin documento
  const loadOrders = React.useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const orders = await felService.getOrdersWithoutDocument()
      
      setState(prev => ({
        ...prev,
        orders,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error cargando órdenes'
      }))
    }
  }, [])

  // Efecto inicial
  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Manejar generación de documento
  const handleGenerateDocument = async (
    orderId: number, 
    documentType: 'invoice' | 'receipt'
  ) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      processingOrderId: orderId,
      selectedOrder: null 
    }))
    
    try {
      if (documentType === 'invoice') {
        // Generar factura FEL
        await felService.createFELInvoiceFromOrder(orderId, 'digifact')
      } else {
        // Generar comprobante sin FEL
        await felService.createReceiptFromOrder(orderId)
      }
      
      // Recargar órdenes después de generar documento
      setTimeout(() => {
        loadOrders()
        setState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          processingOrderId: null 
        }))
      }, 2000) // Dar tiempo para que se procese
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingOrderId: null,
        error: error instanceof Error ? error.message : 'Error generando documento'
      }))
    }
  }

  // Determinar tipo de documento sugerido
  const getSuggestedDocumentType = (order: OrderWithoutDocument): 'invoice' | 'receipt' => {
    return order.suggested_document_type
  }

  // Loading state
  if (state.isLoading && state.orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generar Facturas</h1>
          <p className="text-muted-foreground">
            Generar facturas FEL o comprobantes desde órdenes entregadas
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={loadOrders}
          disabled={state.isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", state.isLoading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-2xl font-bold">{state.orders.length}</p>
                <p className="text-xs text-muted-foreground">Órdenes pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="ml-2">
                <p className="text-2xl font-bold text-blue-600">
                  {state.orders.filter(o => getSuggestedDocumentType(o) === 'invoice').length}
                </p>
                <p className="text-xs text-muted-foreground">Para factura FEL</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-5 w-5 text-gray-600" />
              <div className="ml-2">
                <p className="text-2xl font-bold text-gray-600">
                  {state.orders.filter(o => getSuggestedDocumentType(o) === 'receipt').length}
                </p>
                <p className="text-xs text-muted-foreground">Para comprobante</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="ml-2">
                <p className="text-lg font-bold text-green-600">
                  {felService.formatCurrency(
                    state.orders.reduce((sum, o) => sum + o.total_amount, 0)
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Total pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de órdenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Órdenes Entregadas Sin Factura
          </CardTitle>
          <CardDescription>
            Solo se pueden generar facturas para órdenes con estado "Entregado"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : state.orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-lg font-medium">¡Excelente trabajo!</p>
              <p>No hay órdenes pendientes de facturación</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.orders.map((order) => {
                const suggestedType = getSuggestedDocumentType(order)
                const isProcessingThis = state.processingOrderId === order.id
                
                return (
                  <div 
                    key={order.id}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg",
                      "hover:bg-muted/50 transition-colors",
                      isProcessingThis && "bg-blue-50 border-blue-200"
                    )}
                  >
                    {/* Información de la orden */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Orden */}
                      <div>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {felService.formatDate(order.delivery_date)}
                        </div>
                      </div>

                      {/* Cliente */}
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {order.client.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.client.nit ? (
                            <span className="text-blue-600 font-medium">
                              NIT: {order.client.nit}
                            </span>
                          ) : (
                            <span className="text-gray-500">Sin NIT</span>
                          )}
                        </div>
                      </div>

                      {/* Monto */}
                      <div>
                        <div className="font-medium">
                          {felService.formatCurrency(order.total_amount)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Sugerencia */}
                      <div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Sugerido: </span>
                          {suggestedType === 'invoice' ? (
                            <span className="text-blue-600 font-medium flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Factura FEL
                            </span>
                          ) : (
                            <span className="text-gray-600 font-medium flex items-center gap-1">
                              <Receipt className="h-3 w-3" />
                              Comprobante
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {suggestedType === 'invoice' ? 'Con SAT UUID' : 'Sin proceso FEL'}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="ml-4">
                      {isProcessingThis ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Procesando...</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setState(prev => ({ ...prev, selectedOrder: order }))}
                          disabled={state.isProcessing}
                        >
                          Generar Documento
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de selección de documento */}
      {state.selectedOrder && (
        <DocumentSelector
          isOpen={!!state.selectedOrder}
          onClose={() => setState(prev => ({ ...prev, selectedOrder: null }))}
          order={state.selectedOrder}
          onSelectDocument={(documentType) => {
            if (state.selectedOrder) {
              handleGenerateDocument(state.selectedOrder.id, documentType)
            }
          }}
          suggestedType={getSuggestedDocumentType(state.selectedOrder)}
          isProcessing={state.isProcessing}
        />
      )}
    </div>
  )
}
