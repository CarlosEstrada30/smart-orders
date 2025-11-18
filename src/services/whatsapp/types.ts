/**
 * Tipos para el servicio de WhatsApp
 */

export interface WhatsAppDeviceStatus {
  status: 'connected' | 'disconnected' | 'connecting'
  instance_name: string
  qr_code: string | null
  qr_url: string | null
  message: string
}


