import { describe, expect, it } from 'vitest'
import { Sound } from '@/core/domain/entities/Sound'

describe('Sound Entity', () => {
  const validSoundParams = {
    id: 'sound-1',
    userId: 'user-1',
    name: 'Test Sound',
    url: 'https://example.com/sound.mp3',
    duration: 120,
  }

  describe('create', () => {
    it('should create a sound with valid parameters', () => {
      const sound = Sound.create(validSoundParams)

      expect(sound.id).toBe('sound-1')
      expect(sound.userId).toBe('user-1')
      expect(sound.name).toBe('Test Sound')
      expect(sound.url).toBe('https://example.com/sound.mp3')
      expect(sound.duration).toBe(120)
      expect(sound.createdAt).toBeInstanceOf(Date)
    })

    it('should create a sound with custom createdAt date', () => {
      const customDate = new Date('2024-01-01T00:00:00Z')
      const sound = Sound.create({
        ...validSoundParams,
        createdAt: customDate,
      })

      expect(sound.createdAt).toBe(customDate)
    })

    it('should use current date when createdAt is not provided', () => {
      const beforeCreation = new Date()
      const sound = Sound.create(validSoundParams)
      const afterCreation = new Date()

      expect(sound.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(sound.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })

  describe('validation', () => {
    it('should throw error when duration is zero', () => {
      expect(() => {
        Sound.create({
          ...validSoundParams,
          duration: 0,
        })
      }).toThrow('Duration must be > 0')
    })

    it('should throw error when duration is negative', () => {
      expect(() => {
        Sound.create({
          ...validSoundParams,
          duration: -10,
        })
      }).toThrow('Duration must be > 0')
    })

    it('should accept positive duration values', () => {
      const sound1 = Sound.create({
        ...validSoundParams,
        duration: 0.1,
      })
      const sound2 = Sound.create({
        ...validSoundParams,
        duration: 1000,
      })

      expect(sound1.duration).toBe(0.1)
      expect(sound2.duration).toBe(1000)
    })
  })

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const sound = Sound.create(validSoundParams)

      // TypeScript should prevent these assignments at compile time
      // These tests verify the properties are readonly at runtime
      expect(() => {
        // @ts-expect-error - Testing readonly property
        sound.id = 'new-id'
      }).toThrow()

      expect(() => {
        // @ts-expect-error - Testing readonly property
        sound.name = 'New Name'
      }).toThrow()

      expect(() => {
        // @ts-expect-error - Testing readonly property
        sound.duration = 200
      }).toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      const sound = Sound.create({
        id: '',
        userId: '',
        name: '',
        url: '',
        duration: 1,
      })

      expect(sound.id).toBe('')
      expect(sound.userId).toBe('')
      expect(sound.name).toBe('')
      expect(sound.url).toBe('')
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000)
      const sound = Sound.create({
        ...validSoundParams,
        name: longString,
        url: longString,
      })

      expect(sound.name).toBe(longString)
      expect(sound.url).toBe(longString)
    })

    it('should handle very small positive duration', () => {
      const sound = Sound.create({
        ...validSoundParams,
        duration: Number.MIN_VALUE,
      })

      expect(sound.duration).toBe(Number.MIN_VALUE)
    })

    it('should handle very large duration', () => {
      const sound = Sound.create({
        ...validSoundParams,
        duration: Number.MAX_SAFE_INTEGER,
      })

      expect(sound.duration).toBe(Number.MAX_SAFE_INTEGER)
    })
  })
})