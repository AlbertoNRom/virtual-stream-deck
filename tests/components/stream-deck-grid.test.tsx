import type { StreamDeckKeyRow } from '@/db/supabase/schema';
import { StreamDeckGrid } from '@/features/streamdeck/ui/components/StreamDeckGrid';
import { useSoundStore } from '@/shared/store';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the store
vi.mock('@/shared/store');
vi.mock('@/shared/hooks/useHotkeys', () => ({
	useStreamDeckHotkeys: vi.fn(),
}));

const mockStreamDeckKey: StreamDeckKeyRow = {
	id: 'key-1',
	user_id: 'user-1',
	sound_id: 'sound-1',
	position: 0,
	label: 'Test Key',
	color: '#FF5733',
	icon: null,
	hotkey: null,
	created_at: new Date('2024-01-01T00:00:00Z'),
};

const mockStoreState = {
	streamDeckKeys: [mockStreamDeckKey],
	setStreamDeckKeys: vi.fn(),
	setSelectedKey: vi.fn(),
	playSound: vi.fn(),
	sounds: [],
	selectedKey: null,
	gridConfig: { rows: 1, columns: 3 },
	audioInstances: new Map(),
	currentlyPlayingId: null,
	setSounds: vi.fn(),
	addSound: vi.fn(),
	removeSound: vi.fn(),
	updateKey: vi.fn(),
	setGridConfig: vi.fn(),
	stopSound: vi.fn(),
	stopAllSounds: vi.fn(),
};

describe('StreamDeckGrid', () => {
	beforeEach(() => {
		vi.mocked(useSoundStore).mockReturnValue(mockStoreState);
	});

	it('should render the grid with configured columns', () => {
		const config = { rows: 2, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		const gridContainer = screen.getByTestId('stream-deck-grid');
		expect(gridContainer).toHaveStyle({
			gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
		});
	});

	it('should render stream deck keys', () => {
		const config = { rows: 1, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		expect(screen.getByText('Test Key')).toBeInTheDocument();
	});

	it('should display empty state when no keys are configured', () => {
		vi.mocked(useSoundStore).mockReturnValue({
			...mockStoreState,
			streamDeckKeys: [],
		});

		const config = { rows: 1, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		expect(
			screen.getByText('No keys configured. Click to add new keys.'),
		).toBeInTheDocument();
	});

	it('should handle key click and play sound', () => {
		const config = { rows: 1, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		const keyElement = screen.getByText('Test Key');
		fireEvent.click(keyElement);

		expect(mockStoreState.setSelectedKey).toHaveBeenCalledWith(
			mockStreamDeckKey,
		);
		expect(mockStoreState.playSound).toHaveBeenCalledWith('sound-1');
	});

	it('should handle key click without sound_id', () => {
		const keyWithoutSound = { ...mockStreamDeckKey, sound_id: null };
		const mockStoreWithoutSound = {
			...mockStoreState,
			streamDeckKeys: [keyWithoutSound],
			setSelectedKey: vi.fn(),
			playSound: vi.fn(),
		};

		vi.mocked(useSoundStore).mockReturnValue(mockStoreWithoutSound);

		const config = { rows: 1, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		const keyElement = screen.getByText('Test Key');
		fireEvent.click(keyElement);

		expect(mockStoreWithoutSound.setSelectedKey).toHaveBeenCalledWith(
			keyWithoutSound,
		);
		expect(mockStoreWithoutSound.playSound).not.toHaveBeenCalled();
	});

	it('should apply custom background color from key data', () => {
		const config = { rows: 1, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		const keyElement = screen.getByText('Test Key').closest('button');
		expect(keyElement).toHaveStyle({
			backgroundImage: 'linear-gradient(135deg, #FF5733, transparent)',
		});
	});

	it('should show default key label when no label is provided', () => {
		const keyWithoutLabel = { ...mockStreamDeckKey, label: null };
		vi.mocked(useSoundStore).mockReturnValue({
			...mockStoreState,
			streamDeckKeys: [keyWithoutLabel],
		});

		const config = { rows: 1, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		expect(screen.getByText('Key 1')).toBeInTheDocument();
	});

	it('should render multiple keys in correct positions', () => {
		const multipleKeys = [
			mockStreamDeckKey,
			{ ...mockStreamDeckKey, id: 'key-2', position: 1, label: 'Key 2' },
			{ ...mockStreamDeckKey, id: 'key-3', position: 2, label: 'Key 3' },
		];

		vi.mocked(useSoundStore).mockReturnValue({
			...mockStoreState,
			streamDeckKeys: multipleKeys,
		});

		const config = { rows: 1, columns: 3 };

		render(<StreamDeckGrid config={config} />);

		expect(screen.getByText('Test Key')).toBeInTheDocument();
		expect(screen.getByText('Key 2')).toBeInTheDocument();
		expect(screen.getByText('Key 3')).toBeInTheDocument();
	});
});
