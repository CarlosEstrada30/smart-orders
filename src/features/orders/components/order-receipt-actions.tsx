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

interface OrderReceiptActionsProps {
  orderId: number
  orderNumber?: string
}

export function OrderReceiptActions({ orderId, orderNumber }: OrderReceiptActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadReceipt = async () => {
    try {
      setIsLoading(true)
      await ordersService.downloadReceipt(orderId)
      toast.success('Comprobante descargado exitosamente')
    } catch (error) {
      toast.error('Error al descargar el comprobante')
      console.error('Error downloading receipt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewReceipt = async () => {
    try {
      setIsLoading(true)
      const url = await ordersService.getReceiptPreviewBlob(orderId)
      
      // Usar el mismo método que funciona en la tabla - ventana nueva
      const newWindow = window.open('', '_blank', 'width=800,height=600')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Comprobante - ${orderNumber || `Orden ${orderId}`}</title></head>
            <body style="margin:0;">
              <iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe>
            </body>
          </html>
        `)
        newWindow.document.close()
        
        // Cleanup cuando se cierre la ventana
        newWindow.addEventListener('beforeunload', () => {
          window.URL.revokeObjectURL(url)
        })
        
        toast.success('Vista previa abierta en nueva ventana')
      } else {
        toast.error('No se pudo abrir la ventana. Verifica que los popups estén permitidos.')
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast.error('Error al abrir la vista previa')
      console.error('Error previewing receipt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReceipt = async () => {
    try {
      setIsLoading(true)
      await ordersService.generateReceipt(orderId)
      toast.success('Comprobante generado exitosamente')
    } catch (error) {
      toast.error('Error al generar el comprobante')
      console.error('Error generating receipt:', error)
    } finally {
      setIsLoading(false)
    }
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
          <DropdownMenuItem onClick={handleGenerateReceipt} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Generar nuevo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

  const handleDownloadReceipt = async () => {
    try {
      setIsLoading(true)
      await ordersService.downloadReceipt(orderId)
      toast.success('Comprobante descargado')
    } catch (error) {
      toast.error('Error al descargar comprobante')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewReceipt = async () => {
    try {
      setIsLoading(true)
      const url = await ordersService.getReceiptPreviewBlob(orderId)
      
      // Usar el mismo método que funciona en la tabla - ventana nueva
      const newWindow = window.open('', '_blank', 'width=800,height=600')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Comprobante - Orden ${orderId}</title></head>
            <body style="margin:0;">
              <iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe>
            </body>
          </html>
        `)
        newWindow.document.close()
        
        // Cleanup cuando se cierre la ventana
        newWindow.addEventListener('beforeunload', () => {
          window.URL.revokeObjectURL(url)
        })
        
        toast.success('Vista previa abierta en nueva ventana')
      } else {
        toast.error('No se pudo abrir la ventana. Verifica que los popups estén permitidos.')
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast.error('Error al abrir vista previa')
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
}
