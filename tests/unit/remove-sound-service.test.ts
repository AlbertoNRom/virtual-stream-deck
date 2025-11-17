import type { SoundStorage } from '@/features/sounds/domain/ports/SoundStorage'
import type { StreamDeckKeyRepository } from '@/features/streamdeck/domain/ports/StreamDeckKeyRepository'
import { RemoveSound } from '@/features/sounds/application/RemoveSound'
import { Sound } from '@/features/sounds/domain/entities/Sound'
import type { SoundRepository } from '@/features/sounds/domain/ports/SoundRepository'
import { StreamDeckKey } from '@/features/streamdeck/domain/entities/StreamDeckKey'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('RemoveSound Service', () => {
  let removeSound: RemoveSound
  let mockSoundRepository: SoundRepository
  let mockKeyRepository: StreamDeckKeyRepository
  let mockStorage: SoundStorage

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

    mockStorage = {
      uploadAndGetPublicUrl: vi.fn(),
      removeByPublicUrl: vi.fn(),
    }

    removeSound = new RemoveSound(mockSoundRepository, mockKeyRepository, mockStorage)
    vi.clearAllMocks()
  })

  describe('execute', () => {
    it('should remove sound and associated keys successfully', async () => {
      const sound = Sound.create({
        id: 'sound-1',
        userId: 'user-1',
        name: 'Test Sound',
        url: 'https://example.com/sound.mp3',
        duration: 120,
      })

      vi.mocked(mockSoundRepository.findById).mockResolvedValue(sound)

      await removeSound.execute({
        soundId: 'sound-1',
        userId: 'user-1',
      })

      expect(mockSoundRepository.findById).toHaveBeenCalledWith('sound-1')
      expect(mockKeyRepository.removeBySoundId).toHaveBeenCalledWith('user-1', 'sound-1')
      expect(mockSoundRepository.remove).toHaveBeenCalledWith('sound-1', 'user-1')
      expect(mockStorage.removeByPublicUrl).toHaveBeenCalledWith('https://example.com/sound.mp3')
    })

    it('should throw error when sound is not found', async () => {
      vi.mocked(mockSoundRepository.findById).mockResolvedValue(null)

      await expect(
        removeSound.execute({
          soundId: 'non-existent',
          userId: 'user-1',
        })
      ).rejects.toThrow('Sound not found')

      expect(mockKeyRepository.removeBySoundId).not.toHaveBeenCalled()
      expect(mockSoundRepository.remove).not.toHaveBeenCalled()
      expect(mockStorage.removeByPublicUrl).not.toHaveBeenCalled()
    })

    it('should throw error when user does not own the sound', async () => {
      const sound = Sound.create({
        id: 'sound-1',
        userId: 'other-user',
        name: 'Test Sound',
        url: 'https://example.com/sound.mp3',
        duration: 120,
      })

      vi.mocked(mockSoundRepository.findById).mockResolvedValue(sound)

      await expect(
        removeSound.execute({
          soundId: 'sound-1',
          userId: 'user-1',
        })
      ).rejects.toThrow('Unauthorized')

      expect(mockKeyRepository.removeBySoundId).not.toHaveBeenCalled()
      expect(mockSoundRepository.remove).not.toHaveBeenCalled()
      expect(mockStorage.removeByPublicUrl).not.toHaveBeenCalled()
    })

    it('should handle storage removal failure gracefully', async () => {
      const sound = Sound.create({
        id: 'sound-1',
        userId: 'user-1',
        name: 'Test Sound',
        url: 'https://example.com/sound.mp3',
        duration: 120,
      })

      vi.mocked(mockSoundRepository.findById).mockResolvedValue(sound)
      vi.mocked(mockStorage.removeByPublicUrl).mockRejectedValue(new Error('Storage error'))

      // Should not throw error even if storage removal fails
      await expect(
        removeSound.execute({
          soundId: 'sound-1',
          userId: 'user-1',
        })
      ).resolves.toBeUndefined()

      expect(mockKeyRepository.removeBySoundId).toHaveBeenCalledWith('user-1', 'sound-1')
      expect(mockSoundRepository.remove).toHaveBeenCalledWith('sound-1', 'user-1')
      expect(mockStorage.removeByPublicUrl).toHaveBeenCalledWith('https://example.com/sound.mp3')
    })

    it('should not remove shared sounds from storage', async () => {
      const sound = Sound.create({
        id: 'sound-1',
        userId: 'user-1',
        name: 'Test Sound',
        url: 'https://example.com/public/vsd-bucket/shared/sample.mp3',
        duration: 120,
      })

      vi.mocked(mockSoundRepository.findById).mockResolvedValue(sound)

      await removeSound.execute({
        soundId: 'sound-1',
        userId: 'user-1',
      })

      expect(mockKeyRepository.removeBySoundId).toHaveBeenCalledWith('user-1', 'sound-1')
      expect(mockSoundRepository.remove).toHaveBeenCalledWith('sound-1', 'user-1')
      // Storage removal should not be called for shared sounds
      expect(mockStorage.removeByPublicUrl).not.toHaveBeenCalled()
    })

    it('should handle empty sound URL', async () => {
      const sound = Sound.create({
        id: 'sound-1',
        userId: 'user-1',
        name: 'Test Sound',
        url: '',
        duration: 120,
      })

      vi.mocked(mockSoundRepository.findById).mockResolvedValue(sound)

      await removeSound.execute({
        soundId: 'sound-1',
        userId: 'user-1',
      })

      expect(mockKeyRepository.removeBySoundId).toHaveBeenCalledWith('user-1', 'sound-1')
      expect(mockSoundRepository.remove).toHaveBeenCalledWith('sound-1', 'user-1')
      expect(mockStorage.removeByPublicUrl).toHaveBeenCalledWith('')
    })
  })
})