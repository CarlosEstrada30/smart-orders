import { apiClient } from '../api/client'
import type { CompanySettings, CompanySettingsCreate, CompanySettingsUpdate } from './types'

const ENDPOINTS = {
  SETTINGS: '/settings/',
} as const

export class SettingsService {
  /**
   * Get company settings
   */
  static async getCompanySettings(): Promise<CompanySettings | null> {
    try {
      console.log('Fetching settings from:', ENDPOINTS.SETTINGS)
      const response = await apiClient.get<CompanySettings | null>(ENDPOINTS.SETTINGS)
      console.log('Settings response:', response)
      return response
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  }

  /**
   * Create or update company settings
   */
  static async saveCompanySettings(
    data: CompanySettingsCreate | CompanySettingsUpdate
  ): Promise<CompanySettings> {
    const formData = new FormData()

    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'logo') {
        if (value instanceof File) {
          formData.append('logo', value)
        }
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value))
      }
    })

    // Always include required fields even if empty
    const requiredFields = ['company_name', 'business_name', 'nit']
    requiredFields.forEach(field => {
      if (!formData.has(field) && data[field as keyof typeof data] !== undefined) {
        formData.append(field, String(data[field as keyof typeof data] || ''))
      }
    })

    // Log the FormData for debugging
    console.log('Sending FormData with the following entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    const response = await apiClient.post<CompanySettings>(ENDPOINTS.SETTINGS, formData)

    return response.data
  }

  /**
   * Delete company settings
   */
  static async deleteCompanySettings(): Promise<void> {
    await apiClient.delete(ENDPOINTS.SETTINGS)
  }
}
