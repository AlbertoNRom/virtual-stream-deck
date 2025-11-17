import { Sound } from '@/features/sounds/domain/entities/Sound'
import type { SoundRepository } from '@/features/sounds/domain/ports/SoundRepository'
import { EnsureStreamDeckKeyForSound } from '@/features/streamdeck/application/EnsureStreamDeckKeyForSound'
import { StreamDeckKey } from '@/features/streamdeck/domain/entities/StreamDeckKey'
import type { StreamDeckKeyRepository } from '@/features/streamdeck/domain/ports/StreamDeckKeyRepository'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock global crypto
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-key-uuid-123'),
  },
})

describe('EnsureStreamDeckKeyForSound Service', () => {
  let service: EnsureStreamDeckKeyForSound
  let mockSoundRepository: SoundRepository
  let mockKeyRepository: StreamDeckKeyRepository

  const userId = 'user-1'
  const soundId = 'sound-1'

  beforeEach(() => {
    mockSoundRepository = {
      findById: vi.fn(),
      listByUser: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
    }

    mockKeyRepository = {
      listByUser: vi.fn(),
      add: vi.fn(),
      removeBySoundId: vi.fn(),
    }

    service = new EnsureStreamDeckKeyForSound(mockSoundRepository, mockKeyRepository)
    vi.clearAllMocks()
  })

  it('returns existing key if one already exists for the sound', async () => {
    const existingKey = StreamDeckKey.create({
      id: 'key-existing',
      userId,
      soundId,
      position: 0,
      label: 'Existing',
      color: '#FF5733',
    })

    vi.mocked(mockKeyRepository.listByUser).mockResolvedValue([existingKey])

    const result = await service.execute({ userId, soundId })

    expect(mockKeyRepository.listByUser).toHaveBeenCalledWith(userId)
    expect(mockSoundRepository.findById).not.toHaveBeenCalled()
    expect(mockKeyRepository.add).not.toHaveBeenCalled()
    expect(result).toBe(existingKey)
  })

  it('creates a new key when none exists, using sound name as label', async () => {
    const existingKeys = [
      StreamDeckKey.create({ id: 'key-1', userId, position: 0 }),
      StreamDeckKey.create({ id: 'key-2', userId, position: 2 }),
    ]
    const sound = Sound.create({ id: soundId, userId, name: 'My Sound', url: 'http://x', duration: 2 })

    vi.mocked(mockKeyRepository.listByUser).mockResolvedValue(existingKeys)
    vi.mocked(mockSoundRepository.findById).mockResolvedValue(sound)

    const result = await service.execute({ userId, soundId })

    expect(mockKeyRepository.listByUser).toHaveBeenCalledWith(userId)
    expect(mockSoundRepository.findById).toHaveBeenCalledWith(soundId)
    expect(mockKeyRepository.add).toHaveBeenCalled()

    // Verify created key properties
    expect(result).toBeInstanceOf(StreamDeckKey)
    expect(result.userId).toBe(userId)
    expect(result.soundId).toBe(soundId)
    expect(result.position).toBe(3) // highest (2) + 1
    expect(result.label).toBe('My Sound')
    expect(result.color).toBe('#FF5733')
    expect(result.hotkey).toBeNull()
    expect(result.id).toBe('mock-key-uuid-123')
  })

  it('creates a new key with null label when sound not found', async () => {
    vi.mocked(mockKeyRepository.listByUser).mockResolvedValue([])
    vi.mocked(mockSoundRepository.findById).mockResolvedValue(null)

    const result = await service.execute({ userId, soundId })

    expect(result.label).toBeNull()
    expect(result.position).toBe(0)
  })
})