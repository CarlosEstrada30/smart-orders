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
      const response = await apiClient.get<CompanySettings | null>(ENDPOINTS.SETTINGS)
      return response
    } catch (error) {
      console.error('Error fetching company settings:', error)
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
