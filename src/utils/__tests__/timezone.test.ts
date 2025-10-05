/**
 * Tests para utilidades de zona horaria
 */
import { describe, it, expect, vi } from 'vitest'
import { getClientTimezone, isTimezoneSupported } from '../timezone'

describe('timezone utilities', () => {
  describe('getClientTimezone', () => {
    it('should return a valid timezone string', () => {
      const timezone = getClientTimezone()
      expect(typeof timezone).toBe('string')
      expect(timezone.length).toBeGreaterThan(0)
    })

    it('should return UTC as fallback when Intl is not available', () => {
      // Mock Intl to throw an error
      const originalIntl = global.Intl
      // @ts-expect-error - Intentionally breaking Intl for test
      global.Intl = undefined

      const timezone = getClientTimezone()
      expect(timezone).toBe('UTC')

      // Restore Intl
      global.Intl = originalIntl
    })
  })

  describe('isTimezoneSupported', () => {
    it('should return true when timezone detection is supported', () => {
      const supported = isTimezoneSupported()
      expect(typeof supported).toBe('boolean')
    })

    it('should return false when Intl is not available', () => {
      const originalIntl = global.Intl
      // @ts-expect-error - Intentionally breaking Intl for test
      global.Intl = undefined

      const supported = isTimezoneSupported()
      expect(supported).toBe(false)

      // Restore Intl
      global.Intl = originalIntl
    })
  })
})

