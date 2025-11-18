/**
 * WhatsApp Service
 * Servicio para consultar el estado del dispositivo de WhatsApp con EvolutionAPI
 */

import { apiClient } from '../api/client'
import type { WhatsAppDeviceStatus } from './types'

// URL base del endpoint de WhatsApp (puede ser diferente a la API principal)
// TODO: Mover a variables de entorno si es necesario
const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL || 'https://501b52983f60.ngrok-free.app/api/v1'

class WhatsAppService {
  /**
   * Obtiene el estado del dispositivo de WhatsApp
   */
  async getDeviceStatus(): Promise<WhatsAppDeviceStatus> {
    try {
      // Usar los headers del apiClient que incluyen el JWT
      const headers = apiClient.getPublicHeaders()
      
      const response = await fetch(`${WHATSAPP_API_URL}/ai/device/status`, {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error al obtener estado: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Normalizar el estado
      const normalizedStatus: WhatsAppDeviceStatus = {
        status: data.status === 'connected' ? 'connected' : 
               data.status === 'disconnected' ? 'disconnected' : 'connecting',
        instance_name: data.instance_name || 'default',
        qr_code: data.qr_code || null,
        qr_url: data.qr_url || null,
        message: data.message || 'Estado desconocido',
      }

      return normalizedStatus
    } catch (error) {
      // Retornar estado de error
      return {
        status: 'disconnected',
        instance_name: 'default',
        qr_code: null,
        qr_url: null,
        message: error instanceof Error ? error.message : 'Error al conectar con el servicio',
      }
    }
  }
}

export const whatsappService = new WhatsAppService()

