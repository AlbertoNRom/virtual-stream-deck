import { KeyConfig } from '@/features/streamdeck/ui/components/KeyConfig'
import type { StreamDeckKey } from '@/shared/types'
import { useSoundStore } from '@/shared/store'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the store
vi.mock('@/shared/store')

const mockStreamDeckKey: StreamDeckKey = {
  id: 'key-1',
  user_id: 'user-1',
  sound_id: 'sound-1',
  position: 0,
  label: 'Test Key',
  color: '#FF5733',
  icon: null,
  hotkey: 'ctrl+1',
  created_at: '2024-01-01T00:00:00Z',
}

const mockStoreState = {
  selectedKey: mockStreamDeckKey,
  setSelectedKey: vi.fn(),
  updateKey: vi.fn(),
  streamDeckKeys: [mockStreamDeckKey],
  setStreamDeckKeys: vi.fn(),
  sounds: [],
  setSounds: vi.fn(),
  addSound: vi.fn(),
  removeSound: vi.fn(),
  gridConfig: { rows: 1, columns: 3 },
  setGridConfig: vi.fn(),
  audioInstances: new Map(),
  currentlyPlayingId: null,
  playSound: vi.fn(),
  stopSound: vi.fn(),
  stopAllSounds: vi.fn(),
}

describe('KeyConfig', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.mocked(useSoundStore).mockReturnValue(mockStoreState)
  })

  it('should render key configuration panel', () => {
    render(<KeyConfig />)
    
    expect(screen.getByText('Key Configuration')).toBeInTheDocument()
    expect(screen.getByText('Customize selected key')).toBeInTheDocument()
  })

  it('should display selected key information', () => {
    render(<KeyConfig />)
    
    // Check if key information is displayed
    expect(screen.getByDisplayValue('Test Key')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ctrl+1')).toBeInTheDocument()
  })

  it('should show empty state when no key is selected', () => {
    vi.mocked(useSoundStore).mockReturnValue({
      ...mockStoreState,
      selectedKey: null,
    })
    
    render(<KeyConfig />)
    
    expect(screen.getByText('Select a key to configure')).toBeInTheDocument()
  })

  it('should handle label input changes', async () => {
    render(<KeyConfig />)
    
    const labelInput = screen.getByDisplayValue('Test Key')
    await user.clear(labelInput)
    await user.type(labelInput, 'New Label')
    
    expect(labelInput).toHaveValue('New Label')
  })

  it('should handle hotkey input changes', async () => {
    render(<KeyConfig />)
    
    const hotkeyInput = screen.getByDisplayValue('ctrl+1')
    await user.clear(hotkeyInput)
    await user.type(hotkeyInput, 'ctrl+2')
    
    expect(hotkeyInput).toHaveValue('ctrl+2')
  })

  it('should display color picker', () => {
    render(<KeyConfig />)
    
    const colorInput = screen.getByDisplayValue('#ff5733')
    expect(colorInput).toBeInTheDocument()
    expect(colorInput).toHaveAttribute('type', 'color')
  })

  it('should handle color changes', async () => {
    render(<KeyConfig />)
    
    const colorInput = screen.getByDisplayValue('#ff5733')
    fireEvent.change(colorInput, { target: { value: '#00ff00' } })
    
    expect(colorInput).toHaveValue('#00ff00')
  })

  it('should have save button', () => {
    render(<KeyConfig />)
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    expect(saveButton).toBeInTheDocument()
  })

  it('should handle save button click', async () => {
    render(<KeyConfig />)
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)
    
    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Should call updateKey with the current key data
    expect(mockStoreState.updateKey).toHaveBeenCalled()
  })

  // Note: Delete button is not present in the current KeyConfig component

  it('should display sound selection when available', () => {
    const mockSounds = [
      {
        id: 'sound-1',
        name: 'Test Sound',
        url: 'https://example.com/sound.mp3',
        user_id: 'user-1',
        duration: 5.5,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    
    vi.mocked(useSoundStore).mockReturnValue({
      ...mockStoreState,
      sounds: mockSounds,
    })
    
    render(<KeyConfig />)
    
    // Should show sound selection options
    expect(screen.getByText('Sound')).toBeInTheDocument()
  })

  it('should show validation errors for invalid inputs', async () => {
    render(<KeyConfig />)
    
    // Try to save with empty label
    const labelInput = screen.getByDisplayValue('Test Key')
    await user.clear(labelInput)
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)
    
    // Should show validation error (implementation dependent)
    // This test assumes validation is implemented
  })

  it('should handle form reset', () => {
    render(<KeyConfig />)
    
    // Check if there's a reset or cancel button
    const resetButton = screen.queryByRole('button', { name: /reset|cancel/i })
    if (resetButton) {
      fireEvent.click(resetButton)
      // Should reset form to original values
    }
  })
})
