/**
 * Document Actions
 * Componente controlador para acciones de documentos desde órdenes
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  FileText, 
  Receipt, 
  Download,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { ModernPDFViewer } from '@/components/pdf-viewer'
import { cn } from '@/lib/utils'
import type { OrderWithInvoiceInfo, CreateFELInvoiceRequest, CreateReceiptRequest } from '@/services/fel/types'
import { felService } from '@/services/fel'
import { useFELProcessing } from '@/hooks/use-fel-processing'
import { 
  DocumentSelector,
  FELProcessingLoader,
  FELStatusIndicator,
  FELErrorHandler
} from '@/components/FEL'

interface DocumentActionsProps {
  /** Orden a procesar */
  order: OrderWithInvoiceInfo
  
  /** Callback cuando se actualiza la orden/factura */
  onUpdate?: () => void
  
  /** Si mostrar como botones o dropdown */
  variant?: 'buttons' | 'dropdown' | 'compact'
  
  /** Tamaño de los botones */
  size?: 'sm' | 'default' | 'lg'
  
  /** Clase CSS adicional */
  className?: string
}

export function DocumentActions({
  order,
  onUpdate,
  variant = 'buttons',
  size = 'default',
  className
}: DocumentActionsProps) {

  const [showSelector, setShowSelector] = useState(false)
  const [showErrorHandler, setShowErrorHandler] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const {
    isProcessing,
    currentStatus,
    invoice,
    error,
    progress,
    timeElapsed,
    estimatedTimeLeft,
    canRetry,
    createFELInvoice,
    createReceipt,
    retryFEL,
    cancelProcess,
    reset,
    formatCurrency
  } = useFELProcessing()

  // Determinar estado actual y acciones disponibles
  const getOrderStatus = () => {
    // Si ya tiene factura
    if (order.invoice) {
      const { fel } = order.invoice
      
      return {
        hasInvoice: true,
        documentType: fel.requires_fel ? 'invoice' : 'receipt',
        canDownload: order.invoice.pdf_generated,
        hasFELError: fel.fel_status === 'error' || fel.fel_status === 'rejected',
        canRetryFEL: fel.requires_fel && ['error', 'rejected', 'timeout'].includes(fel.fel_status) && fel.fel_attempts < fel.fel_max_attempts,
        status: order.invoice.status,
        felStatus: fel.fel_status
      }
    }

    // Si puede crear documentos
    if (order.can_create_invoice) {
      const availableTypes = felService.getAvailableDocumentTypes(order)
      
      return {
        hasInvoice: false,
        canCreateFEL: availableTypes.includes('invoice'),
        canCreateReceipt: availableTypes.includes('receipt'),
        availableTypes
      }
    }

    return {
      hasInvoice: false,
      canCreateFEL: false,
      canCreateReceipt: false,
      reason: order.status !== 'delivered' ? 'Orden no entregada' : 'Estado no válido'
    }
  }

  const orderStatus = getOrderStatus()

  // Manejadores de acciones
  const handleCreateFEL = async (orderId: number) => {
    const request: CreateFELInvoiceRequest = {
      order_id: orderId,
      requires_fel: true,
      payment_terms: 'Pago contra entrega'
    }
    
    const result = await createFELInvoice(request)
    if (result) {
      onUpdate?.()
    }
  }

  const handleCreateReceipt = async (orderId: number) => {
    const request: CreateReceiptRequest = {
      order_id: orderId,
      payment_terms: 'Comprobante sin valor fiscal'
    }
    
    const success = await createReceipt(request)
    if (success) {
      onUpdate?.()
    }
  }

  const handleRetryFEL = async () => {
    if (!order.invoice) return
    
    const success = await retryFEL(order.invoice.id)
    if (success) {
      onUpdate?.()
      setShowErrorHandler(false)
    }
  }

  const handlePreviewPDF = async () => {
    if (!order.invoice) return
    
    try {
      const blob = await felService.downloadInvoicePDF(order.invoice.id)
      const url = window.URL.createObjectURL(blob)
      setPdfUrl(url)
      setPdfViewerOpen(true)
      toast.success('Abriendo vista previa del documento')
    } catch (_error) {
      toast.error('Error al abrir vista previa del documento')
    }
  }

  const handleDownloadPDF = async () => {
    if (!order.invoice) return
    
    try {
      const blob = await felService.downloadInvoicePDF(order.invoice.id)
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${order.invoice.invoice_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF descargado correctamente')
    } catch (_error) {
      toast.error('Error descargando PDF')
    }
  }

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false)
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }

  // Renderizado para orden sin factura
  if (!orderStatus.hasInvoice) {
    if (!order.can_create_invoice) {
      return (
        <Badge variant="outline" className={cn("text-muted-foreground", className)}>
          {orderStatus.reason || 'No disponible'}
        </Badge>
      )
    }

    if (variant === 'compact') {
      return (
        <Button
          size={size}
          onClick={() => setShowSelector(true)}
          disabled={isProcessing}
          className={className}
        >
          {orderStatus.canCreateFEL ? (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Crear Documento
            </>
          ) : (
            <>
              <Receipt className="h-4 w-4 mr-2" />
              Comprobante
            </>
          )}
        </Button>
      )
    }

    if (variant === 'dropdown') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={size} disabled={isProcessing} className={className}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {orderStatus.canCreateFEL && (
              <DropdownMenuItem onClick={() => handleCreateFEL(order.id)}>
                <FileText className="h-4 w-4 mr-2" />
                Crear Factura FEL
              </DropdownMenuItem>
            )}
            {orderStatus.canCreateReceipt && (
              <DropdownMenuItem onClick={() => handleCreateReceipt(order.id)}>
                <Receipt className="h-4 w-4 mr-2" />
                Generar Comprobante
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Variant buttons (default)
    return (
      <div className={cn("flex gap-2", className)}>
        {orderStatus.canCreateFEL && (
          <Button
            size={size}
            onClick={() => handleCreateFEL(order.id)}
            disabled={isProcessing}
          >
            <FileText className="h-4 w-4 mr-2" />
            Factura FEL
          </Button>
        )}
        
        {orderStatus.canCreateReceipt && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handleCreateReceipt(order.id)}
            disabled={isProcessing}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Comprobante
          </Button>
        )}
        
        {!orderStatus.canCreateFEL && !orderStatus.canCreateReceipt && (
          <Badge variant="outline" className="text-muted-foreground">
            Sin opciones disponibles
          </Badge>
        )}
      </div>
    )
  }

  // Renderizado para orden con factura
  const orderInvoice = order.invoice!
  
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <FELStatusIndicator
          fel_status={orderInvoice.fel.fel_status}
          fel_uuid={orderInvoice.fel.fel_uuid}
          fel_error_message={orderInvoice.fel.fel_error_message}
          invoice_status={orderInvoice.status}
          requires_fel={orderInvoice.fel.requires_fel}
          size="sm"
        />
        
        {orderStatus.canDownload && (
          <>
            <Button variant="ghost" size="sm" onClick={handlePreviewPDF} title="Ver documento">
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadPDF} title="Descargar PDF">
              <Download className="h-3 w-3" />
            </Button>
          </>
        )}
        
        {orderStatus.hasFELError && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowErrorHandler(true)}
          >
            <AlertTriangle className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <>
        <div className="flex items-center gap-2">
          <FELStatusIndicator
            fel_status={orderInvoice.fel.fel_status}
            fel_uuid={orderInvoice.fel.fel_uuid}
            fel_error_message={orderInvoice.fel.fel_error_message}
            invoice_status={orderInvoice.status}
            requires_fel={orderInvoice.fel.requires_fel}
            size="sm"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={className}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {orderStatus.canDownload && (
                <>
                  <DropdownMenuItem onClick={handlePreviewPDF}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver documento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </DropdownMenuItem>
                </>
              )}
              
              {orderStatus.canRetryFEL && (
                <DropdownMenuItem onClick={handleRetryFEL} disabled={isProcessing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar FEL
                </DropdownMenuItem>
              )}
              
              {orderStatus.hasFELError && (
                <DropdownMenuItem onClick={() => setShowErrorHandler(true)}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Ver Error
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    )
  }

  // Variant buttons para factura existente
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <FELStatusIndicator
        fel_status={orderInvoice.fel.fel_status}
        fel_uuid={orderInvoice.fel.fel_uuid}
        fel_error_message={orderInvoice.fel.fel_error_message}
        invoice_status={orderInvoice.status}
        requires_fel={orderInvoice.fel.requires_fel}
        variant="full"
      />
      
      <div className="flex gap-2">
        {orderStatus.canDownload && (
          <>
            <Button variant="outline" size={size} onClick={handlePreviewPDF}>
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </Button>
            <Button variant="outline" size={size} onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </>
        )}
        
        {orderStatus.canRetryFEL && (
          <Button 
            variant="outline" 
            size={size} 
            onClick={handleRetryFEL} 
            disabled={isProcessing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
        
        {orderStatus.hasFELError && (
          <Button 
            variant="destructive" 
            size={size} 
            onClick={() => setShowErrorHandler(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Ver Error
          </Button>
        )}
      </div>

      {/* Modals y Dialogs */}
      <>
        <DocumentSelector
          order={order}
          open={showSelector}
          onClose={() => setShowSelector(false)}
          onCreateFEL={handleCreateFEL}
          onCreateReceipt={handleCreateReceipt}
          isProcessing={isProcessing}
        />

        <FELProcessingLoader
          open={isProcessing && !!currentStatus}
          status={currentStatus}
          progress={progress}
          timeElapsed={timeElapsed}
          estimatedTimeLeft={estimatedTimeLeft}
          error={error}
          fel_uuid={orderInvoice?.fel?.fel_uuid}
          canCancel={true}
          canRetry={canRetry}
          onCancel={cancelProcess}
          onRetry={() => handleRetryFEL()}
          onClose={reset}
        />

        {showErrorHandler && order.invoice && (
          <FELErrorHandler
            invoice={order.invoice}
            isProcessing={isProcessing}
            onRetryFEL={handleRetryFEL}
            onCreateReceipt={() => handleCreateReceipt(order.id)}
            onEditClient={() => {
              // Aquí podrías abrir modal de edición de cliente
              toast.info('Función de editar cliente pendiente de implementar')
            }}
          />
        )}

        <ModernPDFViewer
          pdfUrl={pdfUrl}
          title={order.invoice ? `${order.invoice.fel.requires_fel ? 'Factura FEL' : 'Comprobante'} - ${order.invoice.invoice_number}` : 'Documento'}
          isOpen={pdfViewerOpen}
          onClose={handleClosePdfViewer}
          onDownload={handleDownloadPDF}
        />
      </>
    </div>
  )
}
