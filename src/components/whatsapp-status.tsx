import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { whatsappService } from '@/services/whatsapp'
import type { WhatsAppDeviceStatus } from '@/services/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/**
 * Componente para mostrar el estado de conexión de WhatsApp
 * Muestra un icono en el header que indica si el dispositivo está conectado
 * y permite ver el QR si no está conectado
 */
export function WhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppDeviceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Función para obtener el estado
  const fetchStatus = useCallback(async () => {
    try {
      const deviceStatus = await whatsappService.getDeviceStatus()
      setStatus(deviceStatus)
    } catch (error) {
      console.error('Error obteniendo estado de WhatsApp:', error)
      toast.error('Error al obtener el estado de WhatsApp')
    } finally {
      setLoading(false)
    }
  }, [])

  // Efecto para carga inicial del estado
  useEffect(() => {
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo se ejecuta una vez al montar

  // Efecto para polling periódico
  // Solo hace polling si está conectado (para verificar que sigue conectado) o si el modal está abierto (para detectar conexión)
  useEffect(() => {
    // Solo hacer polling si:
    // 1. Está conectado (para verificar que sigue conectado)
    // 2. El modal está abierto (para detectar cuando se conecta después de escanear el QR)
    const shouldPoll = status?.status === 'connected' || isModalOpen

    if (!shouldPoll || loading) {
      return
    }

    // Configurar polling: cada 10 segundos
    const interval = setInterval(() => {
      fetchStatus()
    }, 10000)

    // Limpiar intervalo al desmontar o cuando cambian las condiciones
    return () => {
      clearInterval(interval)
    }
  }, [fetchStatus, status?.status, isModalOpen, loading])

  // Efecto para cerrar el modal automáticamente cuando se detecta conexión
  useEffect(() => {
    if (status?.status === 'connected' && isModalOpen) {
      setIsModalOpen(false)
      toast.success('WhatsApp conectado exitosamente')
    }
  }, [status?.status, isModalOpen])

  const handleClick = () => {
    if (status?.status === 'connected') {
      toast.success('WhatsApp está conectado')
    } else {
      // Si no está conectado, abrir modal y consultar estado
      setIsModalOpen(true)
      fetchStatus()
    }
  }

  const getStatusColor = () => {
    if (loading) return 'text-muted-foreground'
    if (status?.status === 'connected') return 'text-green-500'
    // Si hay QR disponible, considerar como "connecting" (amarillo)
    if (status?.status === 'connecting' || (status?.status === 'disconnected' && (status?.qr_code || status?.qr_url))) {
      return 'text-yellow-500'
    }
    return 'text-red-500'
  }

  const getStatusTooltip = () => {
    if (loading) return 'Verificando estado de WhatsApp...'
    if (status?.status === 'connected') return 'WhatsApp conectado'
    if (status?.status === 'connecting') return 'Conectando WhatsApp...'
    return 'WhatsApp desconectado - Click para ver QR'
  }

  // Función para formatear el QR code (puede venir como base64 o URL)
  const getQRImageSrc = (): string | null => {
    if (!status) return null
    
    // Si hay qr_url, usarlo directamente
    if (status.qr_url) {
      return status.qr_url
    }
    
    // Si hay qr_code, verificar si ya tiene el prefijo data: o agregarlo
    if (status.qr_code) {
      // Si ya tiene el prefijo data:, usarlo directamente
      if (status.qr_code.startsWith('data:')) {
        return status.qr_code
      }
      // Si no tiene el prefijo, asumir que es base64 PNG y agregarlo
      return `data:image/png;base64,${status.qr_code}`
    }
    
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn('relative', getStatusColor())}
        title={getStatusTooltip()}
        aria-label={getStatusTooltip()}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        {/* Indicador de estado */}
        {!loading && status && (
          <span
            className={cn(
              'absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-background',
              status.status === 'connected' && 'bg-green-500',
              (status.status === 'connecting' || (status.status === 'disconnected' && (status.qr_code || status.qr_url))) && 'bg-yellow-500',
              status.status === 'disconnected' && !status.qr_code && !status.qr_url && 'bg-red-500'
            )}
          />
        )}
      </Button>

      {/* Modal para mostrar QR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              {status?.status === 'connecting'
                ? 'Escanea el código QR con tu teléfono para conectar WhatsApp'
                : 'El dispositivo de WhatsApp no está conectado. Escanea el código QR para conectarlo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {getQRImageSrc() ? (
              <>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <img
                    src={getQRImageSrc() || ''}
                    alt="QR Code para conectar WhatsApp"
                    className="w-full max-w-[300px] h-auto"
                    onError={(e) => {
                      console.error('Error cargando imagen QR:', e)
                      toast.error('Error al cargar el código QR')
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Abre WhatsApp en tu teléfono, ve a Configuración → Dispositivos vinculados → Vincular un dispositivo
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {status?.message || 'Obteniendo código QR...'}
                </p>
              </div>
            )}

            {(status?.status === 'connecting' || (status?.status === 'disconnected' && (status?.qr_code || status?.qr_url))) && (
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Esperando conexión...</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                fetchStatus()
              }}
            >
              Actualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

