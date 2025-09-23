import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  X,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Tipos genéricos para el componente
export interface BulkUploadError {
  row: number
  field: string
  error: string
}

export interface BulkUploadResult {
  total_rows: number
  successful_uploads: number
  failed_uploads: number
  success_rate: number
  errors: BulkUploadError[]
  [key: string]: any // Para permitir propiedades adicionales específicas del tipo
}

export interface BulkImportProps {
  // Props básicas
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  
  // Funciones del servicio
  onDownloadTemplate: () => Promise<Blob>
  onUploadFile: (file: File) => Promise<any>
  
  // Callback para cuando se completa la importación
  onImportComplete?: (result: any) => void
  
  // Configuración opcional
  acceptedFileTypes?: string
  maxFileSize?: number // en MB
}

export function BulkImport({
  isOpen,
  onClose,
  title,
  description,
  onDownloadTemplate,
  onUploadFile,
  onImportComplete,
  acceptedFileTypes = '.xlsx,.xls',
  maxFileSize = 10
}: BulkImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Limpiar estado al cerrar
  const handleClose = () => {
    setSelectedFile(null)
    setUploadResult(null)
    setError(null)
    onClose()
  }

  // Descargar plantilla
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true)
      setError(null)

      const blob = await onDownloadTemplate()
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `plantilla_${title.toLowerCase().replace(/\s+/g, '_')}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Plantilla descargada exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar la plantilla'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsDownloading(false)
    }
  }

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    // Validar tipo de archivo
    const isExcelFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       file.type === 'application/vnd.ms-excel' ||
                       file.name.endsWith('.xlsx') ||
                       file.name.endsWith('.xls')

    if (!isExcelFile) {
      setError('Por favor selecciona un archivo de Excel válido (.xlsx o .xls)')
      setSelectedFile(null)
      return
    }

    // Validar tamaño de archivo
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      setError(`El archivo es muy grande. Máximo permitido: ${maxFileSize}MB`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  // Subir archivo
  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError(null)
      setUploadResult(null)

      const result = await onUploadFile(selectedFile)
      setUploadResult(result)

      if (result.successful_uploads > 0) {
        toast.success(`${result.successful_uploads} registros importados exitosamente`)
      }

      if (result.failed_uploads > 0) {
        toast.warning(`${result.failed_uploads} registros fallaron en la importación`)
      }

      onImportComplete?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el archivo'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección 1: Descargar Plantilla */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                Paso 1: Descargar Plantilla
              </CardTitle>
              <CardDescription>
                Descarga la plantilla de Excel con el formato correcto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                variant="outline"
                className="w-full"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Descargar Plantilla
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sección 2: Subir Archivo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Paso 2: Subir Archivo
              </CardTitle>
              <CardDescription>
                Selecciona el archivo de Excel con los datos a importar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Archivo de Excel</Label>
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  accept={acceptedFileTypes}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground">
                  Máximo {maxFileSize}MB. Formatos soportados: {acceptedFileTypes}
                </p>
              </div>

              {/* Información del archivo seleccionado */}
              {selectedFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(selectedFile.size)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando archivo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Datos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Mostrar errores */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Mostrar resultado de la carga */}
          {uploadResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {uploadResult.failed_uploads === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  Resultado de la Importación
                </CardTitle>
                <CardDescription>
                  Resumen del proceso de importación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadResult.total_rows}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.successful_uploads}
                    </div>
                    <div className="text-sm text-muted-foreground">Exitosos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResult.failed_uploads}
                    </div>
                    <div className="text-sm text-muted-foreground">Fallidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {uploadResult.success_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Éxito</div>
                  </div>
                </div>

                {/* Lista de errores */}
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-red-600">
                      Errores encontrados:
                    </h4>
                    <div className="max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fila</TableHead>
                            <TableHead>Campo</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {error.row}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{error.field}</Badge>
                              </TableCell>
                              <TableCell className="text-red-600">
                                {error.error}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading || isDownloading}
          >
            {uploadResult ? 'Cerrar' : 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
