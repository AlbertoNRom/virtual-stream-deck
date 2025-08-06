import { useSoundStore } from '@/lib/store'
import type { Sound, StreamDeckKey } from '@/lib/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock data
const mockSound: Sound = {
  id: 'sound-1',
  name: 'Test Sound',
  url: 'https://example.com/sound.mp3',
  user_id: 'user-1',
  duration: 5.5,
  tags: ['test', 'audio'],
  category: 'effects',
  created_at: '2024-01-01T00:00:00Z',
}

const mockStreamDeckKey: StreamDeckKey = {
  id: 'key-1',
  user_id: 'user-1',
  sound_id: 'sound-1',
  position: 0,
  label: 'Test Key',
  color: '#FF5733',
  icon: null,
  hotkey: null,
  created_at: '2024-01-01T00:00:00Z',
}

describe('Sound Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSoundStore.setState({
      sounds: [],
      streamDeckKeys: [],
      selectedKey: null,
      gridConfig: { rows: 1, columns: 3 },
      audioInstances: new Map(),
      currentlyPlayingId: null,
    })
  })

  describe('Sound Management', () => {
    it('should add a sound to the store', () => {
      const { addSound } = useSoundStore.getState()
      
      addSound(mockSound)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.sounds).toHaveLength(1)
      expect(updatedState.sounds[0]).toEqual(mockSound)
      expect(updatedState.audioInstances.has(mockSound.id)).toBe(true)
    })

    it('should remove a sound from the store', () => {
      const { addSound, removeSound } = useSoundStore.getState()
      
      // Add sound first
      addSound(mockSound)
      expect(useSoundStore.getState().sounds).toHaveLength(1)
      
      // Remove sound
      removeSound(mockSound.id)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.sounds).toHaveLength(0)
      expect(updatedState.audioInstances.has(mockSound.id)).toBe(false)
    })

    it('should set multiple sounds', () => {
      const sounds = [mockSound, { ...mockSound, id: 'sound-2', name: 'Sound 2' }]
      const { setSounds } = useSoundStore.getState()
      
      setSounds(sounds)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.sounds).toHaveLength(2)
      expect(updatedState.audioInstances.size).toBe(2)
    })
  })

  describe('Stream Deck Key Management', () => {
    it('should set stream deck keys', () => {
      const keys = [mockStreamDeckKey]
      const { setStreamDeckKeys } = useSoundStore.getState()
      
      setStreamDeckKeys(keys)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.streamDeckKeys).toHaveLength(1)
      expect(updatedState.streamDeckKeys[0]).toEqual(mockStreamDeckKey)
    })

    it('should update a stream deck key', () => {
      const { setStreamDeckKeys, updateKey } = useSoundStore.getState()
      
      // Set initial key
      setStreamDeckKeys([mockStreamDeckKey])
      
      // Update key
      const updatedKey = { ...mockStreamDeckKey, label: 'Updated Label' }
      updateKey(updatedKey)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.streamDeckKeys[0].label).toBe('Updated Label')
    })

    it('should set selected key', () => {
      const { setSelectedKey } = useSoundStore.getState()
      
      setSelectedKey(mockStreamDeckKey)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.selectedKey).toEqual(mockStreamDeckKey)
    })

    it('should clear selected key', () => {
      const { setSelectedKey } = useSoundStore.getState()
      
      // Set key first
      setSelectedKey(mockStreamDeckKey)
      expect(useSoundStore.getState().selectedKey).toEqual(mockStreamDeckKey)
      
      // Clear key
      setSelectedKey(null)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.selectedKey).toBeNull()
    })
  })

  describe('Grid Configuration', () => {
    it('should set grid configuration', () => {
      const config = { rows: 2, columns: 4 }
      const { setGridConfig } = useSoundStore.getState()
      
      setGridConfig(config)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.gridConfig).toEqual(config)
    })
  })

  describe('Audio Playback', () => {
    beforeEach(() => {
      // Add a sound to test playback
      const { addSound } = useSoundStore.getState()
      addSound(mockSound)
    })

    it('should play a sound', () => {
      const { playSound } = useSoundStore.getState()
      
      playSound(mockSound.id)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.currentlyPlayingId).toBe(mockSound.id)
      
      // Verify the audio instance play method was called
      const audioInstance = updatedState.audioInstances.get(mockSound.id)
      expect(audioInstance?.play).toHaveBeenCalled()
    })

    it('should stop a sound', () => {
      const { playSound, stopSound } = useSoundStore.getState()
      
      // Play sound first
      playSound(mockSound.id)
      expect(useSoundStore.getState().currentlyPlayingId).toBe(mockSound.id)
      
      // Stop sound
      stopSound(mockSound.id)
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.currentlyPlayingId).toBeNull()
      
      // Verify the audio instance stop method was called
      const audioInstance = updatedState.audioInstances.get(mockSound.id)
      expect(audioInstance?.stop).toHaveBeenCalled()
    })

    it('should stop all sounds', () => {
      const { addSound, playSound, stopAllSounds } = useSoundStore.getState()
      
      // Add another sound
      const sound2 = { ...mockSound, id: 'sound-2' }
      addSound(sound2)
      
      // Play both sounds
      playSound(mockSound.id)
      playSound(sound2.id)
      
      // Stop all sounds
      stopAllSounds()
      
      const updatedState = useSoundStore.getState()
      expect(updatedState.currentlyPlayingId).toBeNull()
      
      // Verify all audio instances stop method was called
      updatedState.audioInstances.forEach((instance) => {
        expect(instance.stop).toHaveBeenCalled()
      })
    })
  })
})