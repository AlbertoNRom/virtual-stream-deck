import { describe, expect, it } from 'vitest'
import { StreamDeckKey } from '@/core/domain/entities/StreamDeckKey'

describe('StreamDeckKey Entity', () => {
  const validKeyParams = {
    id: 'key-1',
    userId: 'user-1',
    position: 0,
  }

  describe('create', () => {
    it('should create a stream deck key with minimal parameters', () => {
      const key = StreamDeckKey.create(validKeyParams)

      expect(key.id).toBe('key-1')
      expect(key.userId).toBe('user-1')
      expect(key.position).toBe(0)
      expect(key.soundId).toBeNull()
      expect(key.label).toBeNull()
      expect(key.color).toBe('#00ffff') // Default color
      expect(key.icon).toBeNull()
      expect(key.hotkey).toBeNull()
      expect(key.createdAt).toBeInstanceOf(Date)
    })

    it('should create a stream deck key with all parameters', () => {
      const customDate = new Date('2024-01-01T00:00:00Z')
      const key = StreamDeckKey.create({
        ...validKeyParams,
        soundId: 'sound-1',
        label: 'Test Key',
        color: '#FF5733',
        icon: 'play',
        hotkey: 'ctrl+1',
        createdAt: customDate,
      })

      expect(key.id).toBe('key-1')
      expect(key.userId).toBe('user-1')
      expect(key.soundId).toBe('sound-1')
      expect(key.position).toBe(0)
      expect(key.label).toBe('Test Key')
      expect(key.color).toBe('#FF5733')
      expect(key.icon).toBe('play')
      expect(key.hotkey).toBe('ctrl+1')
      expect(key.createdAt).toBe(customDate)
    })

    it('should use current date when createdAt is not provided', () => {
      const beforeCreation = new Date()
      const key = StreamDeckKey.create(validKeyParams)
      const afterCreation = new Date()

      expect(key.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(key.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })

  describe('default values', () => {
    it('should use default color when not provided', () => {
      const key = StreamDeckKey.create(validKeyParams)
      expect(key.color).toBe('#00ffff')
    })

    it('should use null for optional fields when not provided', () => {
      const key = StreamDeckKey.create(validKeyParams)
      expect(key.soundId).toBeNull()
      expect(key.label).toBeNull()
      expect(key.icon).toBeNull()
      expect(key.hotkey).toBeNull()
    })

    it('should accept explicit null values', () => {
      const key = StreamDeckKey.create({
        ...validKeyParams,
        soundId: null,
        label: null,
        icon: null,
        hotkey: null,
      })

      expect(key.soundId).toBeNull()
      expect(key.label).toBeNull()
      expect(key.icon).toBeNull()
      expect(key.hotkey).toBeNull()
    })
  })

  describe('validation', () => {
    it('should throw error when position is negative', () => {
      expect(() => {
        StreamDeckKey.create({
          ...validKeyParams,
          position: -1,
        })
      }).toThrow('Position must be >= 0')
    })

    it('should accept zero position', () => {
      const key = StreamDeckKey.create({
        ...validKeyParams,
        position: 0,
      })

      expect(key.position).toBe(0)
    })

    it('should accept positive positions', () => {
      const key1 = StreamDeckKey.create({
        ...validKeyParams,
        position: 1,
      })
      const key2 = StreamDeckKey.create({
        ...validKeyParams,
        position: 15,
      })

      expect(key1.position).toBe(1)
      expect(key2.position).toBe(15)
    })
  })

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const key = StreamDeckKey.create(validKeyParams)

      // TypeScript should prevent these assignments at compile time
      // These tests verify the properties are readonly at runtime
      expect(() => {
        // @ts-expect-error - Testing readonly property
        key.id = 'new-id'
      }).toThrow()

      expect(() => {
        // @ts-expect-error - Testing readonly property
        key.position = 5
      }).toThrow()

      expect(() => {
        // @ts-expect-error - Testing readonly property
        key.color = '#000000'
      }).toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      const key = StreamDeckKey.create({
        id: '',
        userId: '',
        position: 0,
        label: '',
        color: '',
        icon: '',
        hotkey: '',
      })

      expect(key.id).toBe('')
      expect(key.userId).toBe('')
      expect(key.label).toBe('')
      expect(key.color).toBe('')
      expect(key.icon).toBe('')
      expect(key.hotkey).toBe('')
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000)
      const key = StreamDeckKey.create({
        ...validKeyParams,
        label: longString,
        color: longString,
        icon: longString,
        hotkey: longString,
      })

      expect(key.label).toBe(longString)
      expect(key.color).toBe(longString)
      expect(key.icon).toBe(longString)
      expect(key.hotkey).toBe(longString)
    })

    it('should handle maximum safe integer position', () => {
      const key = StreamDeckKey.create({
        ...validKeyParams,
        position: Number.MAX_SAFE_INTEGER,
      })

      expect(key.position).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle different color formats', () => {
      const hexKey = StreamDeckKey.create({
        ...validKeyParams,
        color: '#FF5733',
      })
      const rgbKey = StreamDeckKey.create({
        ...validKeyParams,
        color: 'rgb(255, 87, 51)',
      })
      const namedKey = StreamDeckKey.create({
        ...validKeyParams,
        color: 'red',
      })

      expect(hexKey.color).toBe('#FF5733')
      expect(rgbKey.color).toBe('rgb(255, 87, 51)')
      expect(namedKey.color).toBe('red')
    })
  })

  describe('sound association', () => {
    it('should handle sound association', () => {
      const keyWithSound = StreamDeckKey.create({
        ...validKeyParams,
        soundId: 'sound-123',
      })

      expect(keyWithSound.soundId).toBe('sound-123')
    })

    it('should handle key without sound', () => {
      const keyWithoutSound = StreamDeckKey.create(validKeyParams)

      expect(keyWithoutSound.soundId).toBeNull()
    })
  })
})