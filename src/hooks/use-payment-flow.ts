/**
 * Hook para Flujo de Pagos
 * Maneja registro de pagos contra facturas
 */

import { useState, useCallback } from 'react'
import { felService } from '@/services/fel'
import { toast } from 'sonner'
import type {
  FELInvoice,
  RecordPaymentRequest,
  PaymentMethod
} from '@/services/fel/types'

interface PaymentFlowState {
  isProcessing: boolean
  error: string | null
  lastPayment: {
    amount: number
    method: PaymentMethod
    date: string
  } | null
}

export function usePaymentFlow() {
  const [state, setState] = useState<PaymentFlowState>({
    isProcessing: false,
    error: null,
    lastPayment: null
  })

  /**
   * Registra un pago contra una factura
   */
  const recordPayment = useCallback(async (request: RecordPaymentRequest): Promise<FELInvoice | null> => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }))
      
      toast.loading('Registrando pago...', {
        id: 'payment-processing'
      })

      const updatedInvoice = await felService.recordPayment(request)
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastPayment: {
          amount: request.amount,
          method: request.payment_method,
          date: request.payment_date || new Date().toISOString()
        }
      }))

      const remainingBalance = updatedInvoice.balance_due
      const isFullyPaid = remainingBalance <= 0

      toast.success(isFullyPaid ? '¡Factura pagada completamente!' : 'Pago registrado', {
        id: 'payment-processing',
        description: isFullyPaid 
          ? `Factura ${updatedInvoice.invoice_number} marcada como PAGADA`
          : `Saldo restante: ${felService.formatCurrency(remainingBalance)}`
      })

      return updatedInvoice

    } catch (error) {
      console.error('Error registrando pago:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error registrando pago'
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }))

      toast.error('Error en pago', {
        id: 'payment-processing',
        description: errorMessage
      })

      return null
    }
  }, [])

  /**
   * Valida datos de pago antes de enviar
   */
  const validatePayment = useCallback((
    invoice: FELInvoice,
    amount: number,
    method: PaymentMethod,
    date?: string
  ): { isValid: boolean; error?: string } => {
    
    if (amount <= 0) {
      return { isValid: false, error: 'El monto debe ser mayor a 0' }
    }

    if (amount > invoice.balance_due) {
      return { 
        isValid: false, 
        error: `El monto no puede ser mayor al saldo pendiente (${felService.formatCurrency(invoice.balance_due)})` 
      }
    }

    if (date && new Date(date) > new Date()) {
      return { isValid: false, error: 'La fecha no puede ser futura' }
    }

    if (!method) {
      return { isValid: false, error: 'Debe seleccionar un método de pago' }
    }

    return { isValid: true }
  }, [])

  /**
   * Calcula el monto máximo permitido para pago
   */
  const getMaxPaymentAmount = useCallback((invoice: FELInvoice): number => {
    return invoice.balance_due
  }, [])

  /**
   * Sugiere el monto completo del saldo
   */
  const getFullBalanceAmount = useCallback((invoice: FELInvoice): number => {
    return invoice.balance_due
  }, [])

  /**
   * Determina si una factura puede recibir pagos
   */
  const canReceivePayment = useCallback((invoice: FELInvoice): boolean => {
    return (
      invoice.status === 'issued' && 
      invoice.balance_due > 0 &&
      invoice.status !== 'cancelled'
    )
  }, [])

  /**
   * Reset del estado
   */
  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      lastPayment: null
    })
  }, [])

  return {
    // Estado
    ...state,
    
    // Acciones
    recordPayment,
    reset,
    
    // Validaciones y helpers
    validatePayment,
    getMaxPaymentAmount,
    getFullBalanceAmount,
    canReceivePayment,
    
    // Utilidades
    formatCurrency: felService.formatCurrency,
    formatDate: felService.formatDate,
  }
}

