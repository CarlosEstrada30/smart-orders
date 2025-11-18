import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Eye, FileText, MoreVertical } from 'lucide-react'
import { ordersService } from '@/services/orders'
import { toast } from 'sonner'
import { ModernPDFViewer } from '@/components/pdf-viewer'

interface OrderReceiptActionsProps {
  orderId: number
  orderNumber?: string
}

export function OrderReceiptActions({ orderId, orderNumber }: OrderReceiptActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleDownloadReceipt = async () => {
    try {
      setIsLoading(true)
      await ordersService.downloadReceipt(orderId)
      toast.success('Comprobante descargado exitosamente')
    } catch (_error) {
      toast.error('Error al descargar el comprobante')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewReceipt = async () => {
    try {
      setIsLoading(true)
      const url = await ordersService.getReceiptPreviewBlob(orderId)
      setPdfUrl(url)
      setPdfViewerOpen(true)
      toast.success('Abriendo vista previa del comprobante')
    } catch (_error) {
      toast.error('Error al abrir la vista previa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false)
    // Cleanup del blob URL
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }

  const handleShareWhatsApp = async (orderId: number) => {
    await ordersService.sendReceiptByWhatsApp(orderId)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Comprobante
            <MoreVertical className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePreviewReceipt} disabled={isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            Ver comprobante
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadReceipt} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModernPDFViewer
        pdfUrl={pdfUrl}
        title={`Comprobante - ${orderNumber || `Orden ${orderId}`}`}
        isOpen={pdfViewerOpen}
        onClose={handleClosePdfViewer}
        orderId={orderId}
        onShareWhatsApp={handleShareWhatsApp}
      />
    </>
  )
}

// Versión simplificada solo con botones individuales (para usar en espacios más pequeños)
interface OrderReceiptButtonsProps {
  orderId: number
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  showLabels?: boolean
}

export function OrderReceiptButtons({ 
  orderId, 
  variant = 'outline', 
  size = 'sm',
  showLabels = false
}: OrderReceiptButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleDownloadReceipt = async () => {
    try {
      setIsLoading(true)
      await ordersService.downloadReceipt(orderId)
      toast.success('Comprobante descargado')
    } catch (_error) {
      toast.error('Error al descargar comprobante')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewReceipt = async () => {
    try {
      setIsLoading(true)
      const url = await ordersService.getReceiptPreviewBlob(orderId)
      setPdfUrl(url)
      setPdfViewerOpen(true)
      toast.success('Abriendo vista previa del comprobante')
    } catch (_error) {
      toast.error('Error al abrir vista previa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false)
    // Cleanup del blob URL
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }

  const handleShareWhatsApp = async (orderId: number) => {
    await ordersService.sendReceiptByWhatsApp(orderId)
  }

  return (
    <>
      <div className="flex gap-1">
        <Button
          variant={variant}
          size={size}
          onClick={handlePreviewReceipt}
          disabled={isLoading}
          title="Ver comprobante"
        >
          <Eye className="h-4 w-4" />
          {showLabels && <span className="ml-1">Ver</span>}
        </Button>
        <Button
          variant={variant}
          size={size}
          onClick={handleDownloadReceipt}
          disabled={isLoading}
          title="Descargar comprobante"
        >
          <Download className="h-4 w-4" />
          {showLabels && <span className="ml-1">Descargar</span>}
        </Button>
      </div>

      <ModernPDFViewer
        pdfUrl={pdfUrl}
        title={`Comprobante - Orden ${orderId}`}
        isOpen={pdfViewerOpen}
        onClose={handleClosePdfViewer}
        orderId={orderId}
        onShareWhatsApp={handleShareWhatsApp}
      />
    </>
  )
}
