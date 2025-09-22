import { useState, useCallback, useEffect } from 'react'
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Download, Printer, AlertCircle } from 'lucide-react'

// Importar estilos CSS necesarios
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@/styles/pdf-viewer.css'

interface ModernPDFViewerProps {
  pdfUrl: string | null
  title?: string
  isOpen: boolean
  onClose: () => void
}

export function ModernPDFViewer({ 
  pdfUrl, 
  title = "Documento PDF",
  isOpen, 
  onClose
}: ModernPDFViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Reset states cuando se abre con nuevo PDF
  useEffect(() => {
    if (isOpen && pdfUrl) {
      setError(null)
      setLoading(true)
    }
  }, [isOpen, pdfUrl])

  // Funciones para descargar e imprimir
  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${title || 'documento'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [pdfUrl, title])

  const handlePrint = useCallback(() => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank')
      printWindow?.print()
    }
  }, [pdfUrl])

  // Worker URL para PDF.js
  const workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

  const handleDocumentLoad = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])


  if (!pdfUrl) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="pdf-modal-content p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>{title || 'Visor de PDF'}</DialogTitle>
          <DialogDescription>
            Visualiza el documento PDF usando los controles de navegación y zoom disponibles
          </DialogDescription>
        </VisuallyHidden>
        <div className="w-full h-full overflow-hidden rounded-lg bg-white dark:bg-gray-900">
          {error ? (
            /* Error al cargar PDF */
            <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-700 dark:text-red-300">Error al cargar PDF</p>
            </div>
          ) : (
            /* PDF Viewer sin header - pantalla completa - UNA SOLA COLUMNA */
            <div className="relative h-full flex flex-col">
              <Worker workerUrl={workerUrl}>
                {/* Toolbar minimalista - solo descargar e imprimir */}
                <div className="flex-shrink-0 border-b bg-gray-50 dark:bg-gray-800 p-3">
                  <div className="flex items-center gap-3 justify-center">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleDownload}
                      className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handlePrint}
                      className="flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                  </div>
                </div>
                
                {/* PDF Viewer abajo - ocupa todo el espacio restante */}
                <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800">
                  <Viewer
                    fileUrl={pdfUrl}
                    plugins={[]}
                    defaultScale={SpecialZoomLevel.PageWidth}
                    onDocumentLoad={handleDocumentLoad}
                  />
                </div>
              </Worker>
              
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center z-50">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cargando PDF...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
