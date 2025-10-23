import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { SoundLibraryBloc } from '@/lib/bloc/soundLibraryBloc'
import { useSoundStore } from '@/lib/store'

type SoundStoreState = {
  sounds: Array<{ id: string; user_id: string | null }>
  streamDeckKeys: unknown[]
  setStreamDeckKeys: (keys: unknown[]) => void
  setSounds: (sounds: Array<{ id: string; user_id: string | null }>) => void
}

vi.mock('@/lib/store', async (importOriginal) => {
  const actual = await importOriginal<unknown>()
  let streamDeckKeys: unknown[] = []
  const state: SoundStoreState = {
    sounds: [],
    streamDeckKeys,
    setStreamDeckKeys: vi.fn((keys: unknown[]) => { streamDeckKeys = keys; state.streamDeckKeys = keys }),
    setSounds: vi.fn(),
  }
  const mockedUseSoundStore = vi.fn(() => state) as unknown as { (): SoundStoreState; getState: () => SoundStoreState }
  mockedUseSoundStore.getState = vi.fn(() => state)
  return { ...(actual as Record<string, unknown>), useSoundStore: mockedUseSoundStore }
})

// Mock supabase client
vi.mock('@/utils/supabase/client', () => {
  const mockAuth = { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) }
  const keysData = [
    { id: 'key-1', user_id: 'user-1', sound_id: 'sound-1', position: 0, label: 'Key 1', color: '#FF5733', icon: null, hotkey: null, created_at: new Date().toISOString() },
  ]
  const from = vi.fn((table: string) => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => ({ data: table === 'stream_deck_keys' ? keysData : [], error: null })),
      update: vi.fn(),
      upsert: vi.fn(),
    }
    return chain
  })
  return {
    createClient: () => ({ auth: mockAuth, from })
  }
})

// Mock EnsureStreamDeckKeyForSound (evitar TDZ con mocks hoisted)
const { ensureExecuteMock } = vi.hoisted(() => ({
  ensureExecuteMock: vi.fn(async () => undefined),
}))
vi.mock('@/core/application/EnsureStreamDeckKeyForSound', () => ({
  EnsureStreamDeckKeyForSound: class {
    execute = ensureExecuteMock
  }
}))

describe('SoundLibraryBloc.ensureKeyForSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ensures key for sound and returns the refreshed UI key', async () => {
    const bloc = new SoundLibraryBloc()
    const key = await bloc.ensureKeyForSound('sound-1')

    expect(ensureExecuteMock).toHaveBeenCalledWith({ soundId: 'sound-1', userId: 'user-1' })
    expect(key).toEqual({ id: 'key-1', user_id: 'user-1', sound_id: 'sound-1', position: 0, label: 'Key 1', color: '#FF5733', icon: null, hotkey: null, created_at: expect.any(String) })
  })

  it('returns null when no user can be resolved', async () => {
    const store = (useSoundStore as unknown as { getState: () => SoundStoreState }).getState()
    store.sounds = [{ id: 'sound-2', user_id: null }]

    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient() as unknown as { auth: { getUser: Mock<(arg?: unknown) => Promise<{ data: { user: unknown } }>> } }
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } } as unknown as { data: { user: unknown } })

    const bloc = new SoundLibraryBloc()
    const key = await bloc.ensureKeyForSound('sound-2')
    expect(key).toBeNull()
    expect(ensureExecuteMock).not.toHaveBeenCalled()
  })
})