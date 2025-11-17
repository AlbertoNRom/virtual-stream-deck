import { useKeyConfig } from '@/features/streamdeck/ui/hooks/useKeyConfig'
import type { KeyConfigEvents, KeyConfigState } from '@/features/streamdeck/ui/hooks/useKeyConfig'
import { act, render } from '@testing-library/react'
import React, { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

// Mock useSoundLibraryBloc to control persist behavior (evitar TDZ con mocks hoisted)
const { persistKeyMock } = vi.hoisted(() => ({
  persistKeyMock: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/features/sounds/ui/hooks/useSoundLibrary', () => ({
  useSoundLibrary: () => ({
    updateKey: persistKeyMock,
  }),
}))

describe('useKeyConfig', () => {
  const selectedKey = {
    id: 'key-1',
    user_id: 'user-1',
    sound_id: 'sound-1',
    position: 0,
    label: 'Initial Label',
    color: '#00ffff',
    icon: null,
    hotkey: null,
    created_at: new Date().toISOString(),
  }

  const sounds = [
    { id: 'sound-1', user_id: 'user-1', name: 'Sound 1', url: 'http://x', duration: 2, created_at: new Date().toISOString() },
  ]

  it('updates label and hotkey in config and persists on save', async () => {
    const updateKeyMock = vi.fn()

    let capturedState: KeyConfigState = { config: selectedKey, sounds }
    let capturedEvents: KeyConfigEvents | null = null

    function Harness() {
      const [state, events] = useKeyConfig(selectedKey, sounds, { updateKey: updateKeyMock })
      useEffect(() => {
        capturedState = state
        capturedEvents = events
      }, [state, events])
      return null
    }

    render(<Harness />)

    expect(capturedState?.config?.label).toBe('Initial Label')

    await act(async () => {
      capturedEvents?.setLabel('New Label')
      capturedEvents?.setHotkey('CTRL+2')
    })

    expect(capturedState?.config?.label).toBe('New Label')
    expect(capturedState?.config?.hotkey).toBe('ctrl+2')

    await act(async () => {
      const result = await capturedEvents?.save()
      expect(result).toEqual({ ok: true })
    })

    expect(updateKeyMock).toHaveBeenCalled()
    expect(persistKeyMock).toHaveBeenCalled()
  })

  it('returns error on save when persist fails', async () => {
    const updateKeyMock = vi.fn()
    persistKeyMock.mockRejectedValueOnce(new Error('persist failed'))

    let capturedState: KeyConfigState = { config: selectedKey, sounds }
    let capturedEvents: KeyConfigEvents | null = null

    function Harness() {
      const [state, events] = useKeyConfig(selectedKey, sounds, { updateKey: updateKeyMock })
      useEffect(() => {
        capturedState = state
        capturedEvents = events
      }, [state, events])
      return null
    }

    render(<Harness />)

    let result: { ok: boolean; error?: string } | undefined
    await act(async () => {
      result = await capturedEvents?.save()
    })

    expect(result?.ok).toBe(false)
    expect(result?.error).toBe('persist failed')
  })
})