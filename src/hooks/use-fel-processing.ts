/**
 * Hook para Procesamiento FEL
 * Maneja creación de facturas FEL con polling de estado en tiempo real
 */

import { useState, useCallback, useRef } from 'react'
import { felService } from '@/services/fel'
import { toast } from 'sonner'
import type {
  FELInvoice,
  FELStatus,
  FELProcessResponse,
  CreateFELInvoiceRequest,
  CreateReceiptRequest,
  FEL_POLLING_CONFIG
} from '@/services/fel/types'

interface FELProcessingState {
  isProcessing: boolean
  currentStatus: FELStatus | null
  invoice: FELInvoice | null
  error: string | null
  progress: number // 0-100
  timeElapsed: number // segundos
  canRetry: boolean
}

export function useFELProcessing() {
  const [state, setState] = useState<FELProcessingState>({
    isProcessing: false,
    currentStatus: null,
    invoice: null,
    error: null,
    progress: 0,
    timeElapsed: 0,
    canRetry: false
  })

  // Referencias para controlar polling y timer
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const attemptCountRef = useRef<number>(0)

  /**
   * Limpia todos los timers activos
   */
  const clearTimers = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /**
   * Actualiza el progreso basado en tiempo transcurrido
   */
  const updateProgress = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const maxTime = FEL_POLLING_CONFIG.TIMEOUT_MS / 1000 // 60 segundos
    const progress = Math.min((elapsed / maxTime) * 100, 100)
    
    setState(prev => ({
      ...prev,
      timeElapsed: Math.floor(elapsed),
      progress: Math.floor(progress)
    }))
  }, [])

  /**
   * Inicia polling para verificar estado FEL
   */
  const startPolling = useCallback((invoiceId: number) => {
    attemptCountRef.current = 0
    startTimeRef.current = Date.now()

    // Timer para actualizar progreso visual
    timerRef.current = setInterval(updateProgress, 1000)

    // Polling del estado FEL
    pollingRef.current = setInterval(async () => {
      try {
        attemptCountRef.current += 1
        const statusResponse = await felService.checkFELStatus(invoiceId)
        
        setState(prev => ({ 
          ...prev, 
          currentStatus: statusResponse.fel_status,
          error: statusResponse.fel_error_message || null
        }))

        // Si está autorizada o falló, detener polling
        if (statusResponse.fel_status === 'authorized') {
          clearTimers()
          setState(prev => ({
            ...prev,
            isProcessing: false,
            progress: 100,
            canRetry: false
          }))
          
          toast.success('¡Factura FEL autorizada correctamente!', {
            description: `UUID: ${felService.formatFELUUID(statusResponse.fel_uuid)}`
          })
        } else if (['rejected', 'error', 'timeout'].includes(statusResponse.fel_status)) {
          clearTimers()
          setState(prev => ({
            ...prev,
            isProcessing: false,
            canRetry: true,
            error: statusResponse.fel_error_message || 'Error desconocido'
          }))
          
          toast.error('Error en proceso FEL', {
            description: statusResponse.fel_error_message || 'Intente nuevamente'
          })
        }

        // Timeout si excede intentos máximos
        if (attemptCountRef.current >= FEL_POLLING_CONFIG.MAX_ATTEMPTS) {
          clearTimers()
          setState(prev => ({
            ...prev,
            isProcessing: false,
            currentStatus: 'timeout',
            canRetry: true,
            error: 'Timeout: El proceso está tomando más tiempo del esperado'
          }))
          
          toast.error('Proceso FEL demorado', {
            description: 'Puede revisar el estado más tarde o reintentar'
          })
        }

      } catch (error) {
        console.error('Error en polling FEL:', error)
        clearTimers()
        setState(prev => ({
          ...prev,
          isProcessing: false,
          currentStatus: 'error',
          canRetry: true,
          error: 'Error de conexión durante el proceso'
        }))
        
        toast.error('Error de conexión', {
          description: 'No se pudo verificar el estado FEL'
        })
      }
    }, FEL_POLLING_CONFIG.INTERVAL_MS)

  }, [clearTimers, updateProgress])

  /**
   * Crea factura FEL con proceso completo
   */
  const createFELInvoice = useCallback(async (request: CreateFELInvoiceRequest): Promise<FELInvoice | null> => {
    try {
      // Reset estado
      setState({
        isProcessing: true,
        currentStatus: 'pending',
        invoice: null,
        error: null,
        progress: 0,
        timeElapsed: 0,
        canRetry: false
      })

      toast.loading('Creando factura FEL...', {
        description: 'Enviando a SAT para autorización',
        id: 'fel-processing'
      })

      // Crear factura FEL
      const response: FELProcessResponse = await felService.createFELInvoice(request)
      
      setState(prev => ({
        ...prev,
        invoice: response.invoice,
        currentStatus: response.fel_status
      }))

      // Si ya está autorizada inmediatamente
      if (response.fel_status === 'authorized' && response.fel_uuid) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          progress: 100,
          canRetry: false
        }))
        
        toast.success('¡Factura FEL autorizada!', {
          id: 'fel-processing',
          description: `UUID: ${felService.formatFELUUID(response.fel_uuid)}`
        })
        
        return response.invoice
      }

      // Si hay error inmediato
      if (['rejected', 'error'].includes(response.fel_status)) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          canRetry: true,
          error: response.fel_error?.message || 'Error en proceso FEL'
        }))
        
        toast.error('Error en factura FEL', {
          id: 'fel-processing',
          description: response.fel_error?.message || 'Revise los datos e intente nuevamente'
        })
        
        return null
      }

      // Si está procesando, iniciar polling
      if (response.fel_status === 'processing') {
        setState(prev => ({ ...prev, currentStatus: 'processing' }))
        
        toast.loading('Procesando con SAT...', {
          id: 'fel-processing',
          description: 'Esto puede tomar hasta 60 segundos'
        })
        
        startPolling(response.invoice.id)
      }

      return response.invoice

    } catch (error) {
      console.error('Error creando factura FEL:', error)
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentStatus: 'error',
        canRetry: true,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }))
      
      toast.error('Error creando factura', {
        id: 'fel-processing',
        description: 'Verifique su conexión e intente nuevamente'
      })
      
      return null
    }
  }, [startPolling])

  /**
   * Genera comprobante simple (sin FEL)
   */
  const createReceipt = useCallback(async (request: CreateReceiptRequest): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }))
      
      toast.loading('Generando comprobante...', {
        id: 'receipt-processing'
      })

      const pdfBlob = await felService.createReceipt(request)
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Comprobante-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        currentStatus: null,
        error: null 
      }))
      
      toast.success('Comprobante generado', {
        id: 'receipt-processing',
        description: 'El archivo PDF se descargó automáticamente'
      })
      
      return true

    } catch (error) {
      console.error('Error generando comprobante:', error)
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Error generando comprobante'
      }))
      
      toast.error('Error generando comprobante', {
        id: 'receipt-processing',
        description: 'Intente nuevamente'
      })
      
      return false
    }
  }, [])

  /**
   * Reintenta proceso FEL fallido
   */
  const retryFEL = useCallback(async (invoiceId: number, force = false): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, canRetry: false }))
      
      toast.loading('Reintentando proceso FEL...', {
        id: 'fel-retry'
      })

      const response = await felService.retryFELProcessing({ 
        invoice_id: invoiceId, 
        force 
      })
      
      setState(prev => ({
        ...prev,
        invoice: response.invoice,
        currentStatus: response.fel_status,
        error: null
      }))

      if (response.fel_status === 'authorized' && response.fel_uuid) {
        setState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          progress: 100 
        }))
        
        toast.success('¡Factura FEL autorizada!', {
          id: 'fel-retry',
          description: `UUID: ${felService.formatFELUUID(response.fel_uuid)}`
        })
        
        return true
      }

      if (response.fel_status === 'processing') {
        startPolling(invoiceId)
        return true
      }

      // Si falló de nuevo
      setState(prev => ({
        ...prev,
        isProcessing: false,
        canRetry: response.retry_available,
        error: response.fel_error?.message || 'Error en reintento'
      }))
      
      toast.error('Reintento falló', {
        id: 'fel-retry',
        description: response.fel_error?.message || 'Revise los datos'
      })
      
      return false

    } catch (error) {
      console.error('Error reintentando FEL:', error)
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        canRetry: true,
        error: error instanceof Error ? error.message : 'Error en reintento'
      }))
      
      toast.error('Error reintentando', {
        id: 'fel-retry',
        description: 'Intente nuevamente más tarde'
      })
      
      return false
    }
  }, [startPolling])

  /**
   * Cancela proceso en curso
   */
  const cancelProcess = useCallback(() => {
    clearTimers()
    setState(prev => ({
      ...prev,
      isProcessing: false,
      currentStatus: null,
      error: null,
      canRetry: prev.invoice ? true : false
    }))
    
    toast.dismiss('fel-processing')
    toast.info('Proceso cancelado', {
      description: 'Puede verificar el estado más tarde'
    })
  }, [clearTimers])

  /**
   * Reset completo del estado
   */
  const reset = useCallback(() => {
    clearTimers()
    setState({
      isProcessing: false,
      currentStatus: null,
      invoice: null,
      error: null,
      progress: 0,
      timeElapsed: 0,
      canRetry: false
    })
  }, [clearTimers])

  return {
    // Estado
    ...state,
    
    // Acciones principales
    createFELInvoice,
    createReceipt,
    retryFEL,
    
    // Controles
    cancelProcess,
    reset,
    
    // Helpers
    formatCurrency: felService.formatCurrency,
    formatFELUUID: felService.formatFELUUID,
    
    // Estado computado
    isTimeout: state.currentStatus === 'timeout',
    isAuthorized: state.currentStatus === 'authorized',
    hasFELUUID: state.invoice?.fel?.fel_uuid ? true : false,
    estimatedTimeLeft: Math.max(0, 60 - state.timeElapsed), // segundos restantes
  }
}
