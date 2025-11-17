import type { SoundRow, StreamDeckKeyRow } from '@/db/supabase/schema'
import { useSoundStore } from '@/shared/store'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock components for integration testing
const MockSoundLibrary = () => {
  const { sounds, addSound, removeSound, playSound } = useSoundStore()
  
  return (
    <div data-testid="sound-library">
      <h2>Sound Library</h2>
      <div data-testid="sound-count">{sounds.length} sounds</div>
      {sounds.map((sound) => (
        <div key={sound.id} data-testid={`sound-${sound.id}`}>
          <span>{sound.name}</span>
          <button type="button" onClick={() => playSound(sound.id)}>Play</button>
          <button type="button" onClick={() => removeSound(sound.id)}>Remove</button>
        </div>
      ))}
      <button 
        type="button"
        onClick={() => addSound({
          id: `sound-${Date.now()}`,
          name: 'New Sound',
          url: 'https://example.com/sound.mp3',
          user_id: 'user-1',
          duration: 3.0,
          created_at: new Date(),
        })}
      >
        Add Sound
      </button>
    </div>
  )
}

const MockStreamDeckGrid = () => {
  const { streamDeckKeys, setSelectedKey, gridConfig } = useSoundStore()
  
  return (
    <div data-testid="stream-deck-grid">
      <h2>Stream Deck Grid</h2>
      <div data-testid="grid-config">{gridConfig.rows}x{gridConfig.columns}</div>
      <div className="grid">
        {Array.from({ length: gridConfig.rows * gridConfig.columns }, (_, index) => {
          const key = streamDeckKeys.find(k => k.position === index)
          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: We're using the index as a key here, which is fine for this simple example
              key={`key-position-${index}`}
              type="button"
              data-testid={`key-${index}`}
              onClick={() => key && setSelectedKey(key)}
              style={{ backgroundColor: key?.color || '#gray' }}
            >
              {key?.label || `Key ${index + 1}`}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const MockKeyConfig = () => {
  const { selectedKey, updateKey, setSelectedKey } = useSoundStore()
  
  if (!selectedKey) {
    return (
      <div data-testid="key-config">
        <p>No key selected</p>
      </div>
    )
  }
  
  return (
    <div data-testid="key-config">
      <h2>Key Configuration</h2>
      <input
        data-testid="label-input"
        value={selectedKey.label || ''}
        onChange={(e) => updateKey({ ...selectedKey, label: e.target.value })}
        placeholder="Key label"
      />
      <input
        data-testid="color-input"
        type="color"
        value={selectedKey.color || '#000000'}
        onChange={(e) => updateKey({ ...selectedKey, color: e.target.value })}
      />
      <button type="button" onClick={() => setSelectedKey(null)}>Close</button>
    </div>
  )
}

const MockDashboard = () => {
  return (
    <div data-testid="dashboard">
      <h1>Virtual Stream Deck Dashboard</h1>
      <div className="dashboard-layout">
        <MockSoundLibrary />
        <MockStreamDeckGrid />
        <MockKeyConfig />
      </div>
    </div>
  )
}

// Mock the store
vi.mock('@/shared/store')

const mockSounds: SoundRow[] = [
  {
    id: 'sound-1',
    name: 'Test Sound 1',
    url: 'https://example.com/sound1.mp3',
    user_id: 'user-1',
    duration: 5.5,
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'sound-2',
    name: 'Test Sound 2',
    url: 'https://example.com/sound2.mp3',
    user_id: 'user-1',
    duration: 3.2,
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
]

const mockStreamDeckKeys: StreamDeckKeyRow[] = [
  {
    id: 'key-1',
    user_id: 'user-1',
    sound_id: 'sound-1',
    position: 0,
    label: 'Sound 1',
    color: '#FF5733',
    icon: null,
    hotkey: 'ctrl+1',
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'key-2',
    user_id: 'user-1',
    sound_id: null,
    position: 1,
    label: 'Empty Key',
    color: '#333333',
    icon: null,
    hotkey: null,
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
]

describe('Dashboard Integration Tests', () => {
  const user = userEvent.setup()
  
  let mockStoreState: {
    sounds: SoundRow[];
    streamDeckKeys: StreamDeckKeyRow[];
    selectedKey: StreamDeckKeyRow | null;
    gridConfig: { rows: number; columns: number };
    audioInstances: Map<string, unknown>;
    currentlyPlayingId: string | null;
    setSounds: (sounds: SoundRow[]) => void;
    addSound: (sound: SoundRow) => void;
    removeSound: (id: string) => void;
    setStreamDeckKeys: (keys: StreamDeckKeyRow[]) => void;
    updateKey: (key: StreamDeckKeyRow) => void;
    setSelectedKey: (key: StreamDeckKeyRow | null) => void;
    setGridConfig: (config: { rows: number; columns: number }) => void;
    playSound: (id: string) => void;
    stopSound: (id: string) => void;
    stopAllSounds: () => void;
  }
  
  beforeEach(() => {
    mockStoreState = {
      sounds: mockSounds,
      streamDeckKeys: mockStreamDeckKeys,
      selectedKey: null,
      gridConfig: { rows: 2, columns: 3 },
      audioInstances: new Map(),
      currentlyPlayingId: null,
      setSounds: vi.fn(),
      addSound: vi.fn((sound) => {
        mockStoreState.sounds = [...mockStoreState.sounds, sound]
      }),
      removeSound: vi.fn((id) => {
        mockStoreState.sounds = mockStoreState.sounds.filter((s: SoundRow) => s.id !== id)
      }),
      setStreamDeckKeys: vi.fn(),
      updateKey: vi.fn((key: StreamDeckKeyRow) => {
        const keyIndex = mockStoreState.streamDeckKeys.findIndex((k: StreamDeckKeyRow) => k.id === key.id)
        if (keyIndex !== -1) {
          mockStoreState.streamDeckKeys[keyIndex] = {
            ...mockStoreState.streamDeckKeys[keyIndex],
            ...key,
          } as StreamDeckKeyRow
        }
        if (mockStoreState.selectedKey?.id === key.id) {
          mockStoreState.selectedKey = {
            ...mockStoreState.selectedKey,
            ...key,
          } as StreamDeckKeyRow
        }
      }),
      setSelectedKey: vi.fn((key: StreamDeckKeyRow | null) => {
        mockStoreState.selectedKey = key
      }),
      setGridConfig: vi.fn(),
      playSound: vi.fn(),
      stopSound: vi.fn(),
      stopAllSounds: vi.fn(),
    }
    
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
  })
  
  it('should render all dashboard components', () => {
    render(<MockDashboard />)
    
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('sound-library')).toBeInTheDocument()
    expect(screen.getByTestId('stream-deck-grid')).toBeInTheDocument()
    expect(screen.getByTestId('key-config')).toBeInTheDocument()
  })
  
  it('should display correct number of sounds and keys', () => {
    render(<MockDashboard />)
    
    expect(screen.getByTestId('sound-count')).toHaveTextContent('2 sounds')
    expect(screen.getByTestId('grid-config')).toHaveTextContent('2x3')
  })
  
  it('should show "No key selected" initially', () => {
    render(<MockDashboard />)
    
    expect(screen.getByText('No key selected')).toBeInTheDocument()
  })
  
  it('should select a key when clicked', async () => {
    render(<MockDashboard />)
    
    const keyButton = screen.getByTestId('key-0')
    await user.click(keyButton)
    
    expect(mockStoreState.setSelectedKey).toHaveBeenCalledWith(mockStreamDeckKeys[0])
  })
  
  it('should not select a key when clicking an empty cell', async () => {
    render(<MockDashboard />)
    vi.clearAllMocks()
    const emptyCell = screen.getByTestId('key-5')
    await user.click(emptyCell)
    expect(mockStoreState.setSelectedKey).not.toHaveBeenCalled()
  })
  
  it('should show key configuration when key is selected', () => {
    mockStoreState.selectedKey = mockStreamDeckKeys[0]
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
    
    render(<MockDashboard />)
    
    expect(screen.getByText('Key Configuration')).toBeInTheDocument()
    expect(screen.getByTestId('label-input')).toHaveValue('Sound 1')
    expect(screen.getByTestId('color-input')).toHaveValue('#ff5733')
  })
  
  it('should update grid label after editing key label', async () => {
    const { rerender } = render(<MockDashboard />)
    // select first key
    const keyButton = screen.getByTestId('key-0')
    await user.click(keyButton)
    expect(mockStoreState.setSelectedKey).toHaveBeenCalledWith(mockStreamDeckKeys[0])
    
    // reflect selection in mock and re-render
    mockStoreState.selectedKey = mockStreamDeckKeys[0]
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
    rerender(<MockDashboard />)
    
    const labelInput = screen.getByTestId('label-input')
    await user.clear(labelInput)
    await user.type(labelInput, 'Updated Label')
    expect(mockStoreState.updateKey).toHaveBeenCalled()
    
    // simulate the key being updated in the store
    const updatedKeys = [...mockStreamDeckKeys]
    updatedKeys[0] = { ...updatedKeys[0], label: 'Updated Label' }
    mockStoreState.streamDeckKeys = updatedKeys
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
    rerender(<MockDashboard />)
    
    expect(screen.getByTestId('key-0')).toHaveTextContent('Updated Label')
  })
  
  it('should update key color when color input changes', async () => {
    mockStoreState.selectedKey = mockStreamDeckKeys[0]
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
    const { rerender } = render(<MockDashboard />)
    
    const colorInput = screen.getByTestId('color-input')
    fireEvent.change(colorInput, { target: { value: '#00FF00' } })
    expect(mockStoreState.updateKey).toHaveBeenCalled()
    
    // simulate the key being updated in the store
    const updatedKeys = [...mockStreamDeckKeys]
    updatedKeys[0] = { ...updatedKeys[0], color: '#00FF00' }
    mockStoreState.streamDeckKeys = updatedKeys
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
    rerender(<MockDashboard />)
    
    const keyEl = screen.getByTestId('key-0')
    expect(keyEl).toBeInTheDocument()
    // check for RGB format since browsers convert hex to rgb
    expect(keyEl.getAttribute('style') ?? '').toMatch(/rgb\(0,\s*255,\s*0\)/)
  })
  
  it('should increase sound count after adding a sound', async () => {
    const { rerender } = render(<MockDashboard />)
    expect(screen.getByTestId('sound-count')).toHaveTextContent('2 sounds')
    
    const addButton = screen.getByText('Add Sound')
    await user.click(addButton)
    expect(mockStoreState.addSound).toHaveBeenCalled()
    
    // simulate a new sound being added to the store
    const newSound: SoundRow = {
      id: 'sound-3',
      name: 'New Sound',
      url: 'https://example.com/sound3.mp3',
      user_id: 'user-1',
      duration: 2.1,
      created_at: new Date('2024-01-01T00:00:00Z'),
    }
    mockStoreState.sounds = [...mockSounds, newSound]
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
    rerender(<MockDashboard />)
    
    expect(screen.getByTestId('sound-count')).toHaveTextContent('3 sounds')
  })
  
  it('should remove sound from library', async () => {
    render(<MockDashboard />)
    
    const removeButton = screen.getAllByText('Remove')[0]
    await user.click(removeButton)
    
    expect(mockStoreState.removeSound).toHaveBeenCalledWith('sound-1')
  })
  
  it('should play sound when play button is clicked', async () => {
    render(<MockDashboard />)
    
    const playButton = screen.getAllByText('Play')[0]
    await user.click(playButton)
    
    expect(mockStoreState.playSound).toHaveBeenCalledWith('sound-1')
  })
  
  it('should close key configuration when close button is clicked', async () => {
    mockStoreState.selectedKey = mockStreamDeckKeys[0]
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
    
    render(<MockDashboard />)
    
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    
    expect(mockStoreState.setSelectedKey).toHaveBeenCalledWith(null)
  })
  
  it('should handle multiple sound operations', async () => {
    render(<MockDashboard />)
    
    // Play first sound
    const playButtons = screen.getAllByText('Play')
    await user.click(playButtons[0])
    expect(mockStoreState.playSound).toHaveBeenCalledWith('sound-1')
    
    // Play second sound
    await user.click(playButtons[1])
    expect(mockStoreState.playSound).toHaveBeenCalledWith('sound-2')
    
    // Add new sound
    const addButton = screen.getByText('Add Sound')
    await user.click(addButton)
    expect(mockStoreState.addSound).toHaveBeenCalled()
    
    // Remove first sound
    const removeButtons = screen.getAllByText('Remove')
    await user.click(removeButtons[0])
    expect(mockStoreState.removeSound).toHaveBeenCalledWith('sound-1')
  })
})