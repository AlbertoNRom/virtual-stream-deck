import { UploadSound } from '@/features/sounds/application/UploadSound';
import { Sound } from '@/features/sounds/domain/entities/Sound';
import type { SoundRepository } from '@/features/sounds/domain/ports/SoundRepository';
import type { SoundStorage } from '@/features/sounds/domain/ports/SoundStorage';
import { StreamDeckKey } from '@/features/streamdeck/domain/entities/StreamDeckKey';
import type { StreamDeckKeyRepository } from '@/features/streamdeck/domain/ports/StreamDeckKeyRepository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock global crypto
Object.defineProperty(globalThis, 'crypto', {
	value: {
		randomUUID: vi.fn(() => 'mock-uuid-123'),
	},
});

// Mock Audio constructor
Object.defineProperty(globalThis, 'Audio', {
	value: vi.fn().mockImplementation(() => ({
		duration: 120,
		addEventListener: vi.fn((event, callback) => {
			if (event === 'loadedmetadata') {
				setTimeout(callback, 0);
			}
		}),
	})),
});

describe('UploadSound Service', () => {
	let uploadSound: UploadSound;
	let mockSoundRepository: SoundRepository;
	let mockKeyRepository: StreamDeckKeyRepository;
	let mockStorage: SoundStorage;

	beforeEach(() => {
		mockSoundRepository = {
			findById: vi.fn(),
			listByUser: vi.fn(),
			add: vi.fn(),
			remove: vi.fn(),
		};

		mockKeyRepository = {
			listByUser: vi.fn(),
			add: vi.fn(),
			removeBySoundId: vi.fn(),
		};

		mockStorage = {
			uploadAndGetPublicUrl: vi.fn(),
			removeByPublicUrl: vi.fn(),
		};

		uploadSound = new UploadSound(
			mockSoundRepository,
			mockKeyRepository,
			mockStorage,
		);
		vi.clearAllMocks();
	});

	describe('execute - direct sound path', () => {
		it('should create sound and key from direct parameters', async () => {
			const params = {
				id: 'sound-1',
				userId: 'user-1',
				name: 'Test Sound',
				url: 'https://example.com/sound.mp3',
				duration: 120,
			};

			vi.mocked(mockKeyRepository.listByUser).mockResolvedValue([]);

			const result = await uploadSound.execute(params);

			expect(mockSoundRepository.add).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'sound-1',
					userId: 'user-1',
					name: 'Test Sound',
					url: 'https://example.com/sound.mp3',
					duration: 120,
				}),
			);

			expect(mockKeyRepository.add).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'user-1',
					soundId: 'sound-1',
					position: 0,
					label: 'Test Sound',
					color: '#FF5733',
					hotkey: 'ctrl+1',
				}),
			);

			expect(result.sound).toBeInstanceOf(Sound);
			expect(result.key).toBeInstanceOf(StreamDeckKey);
		});

		it('should create key with correct position when other keys exist', async () => {
			const existingKeys = [
				StreamDeckKey.create({ id: 'key-1', userId: 'user-1', position: 0 }),
				StreamDeckKey.create({ id: 'key-2', userId: 'user-1', position: 2 }),
			];

			vi.mocked(mockKeyRepository.listByUser).mockResolvedValue(existingKeys);

			const params = {
				id: 'sound-1',
				userId: 'user-1',
				name: 'Test Sound',
				url: 'https://example.com/sound.mp3',
				duration: 120,
			};

			await uploadSound.execute(params);

			expect(mockKeyRepository.add).toHaveBeenCalledWith(
				expect.objectContaining({
					position: 3, // highest position (2) + 1
					hotkey: 'ctrl+4', // position + 1
				}),
			);
		});
	});

	describe('execute - file upload path', () => {
		it('should upload file and create sound and key', async () => {
			const mockFile = {
				name: 'test-sound.mp3',
				size: 1024 * 1024, // 1MB
				type: 'audio/mpeg',
			} as File;

			vi.mocked(mockSoundRepository.listByUser).mockResolvedValue([]);
			vi.mocked(mockKeyRepository.listByUser).mockResolvedValue([]);
			vi.mocked(mockStorage.uploadAndGetPublicUrl).mockResolvedValue(
				'https://example.com/uploaded-sound.mp3',
			);

			const result = await uploadSound.execute({
				userId: 'user-1',
				file: mockFile,
			});

			expect(mockStorage.uploadAndGetPublicUrl).toHaveBeenCalledWith(
				'user-1',
				mockFile,
			);
			expect(mockSoundRepository.add).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'mock-uuid-123',
					userId: 'user-1',
					name: 'Test-sound', // capitalized from filename, preserving hyphen
					url: 'https://example.com/uploaded-sound.mp3',
					duration: 120,
				}),
			);

			expect(result.sound).toBeInstanceOf(Sound);
			expect(result.key).toBeInstanceOf(StreamDeckKey);
		});

		it('should throw error when file is too large', async () => {
			const mockFile = {
				name: 'large-sound.mp3',
				size: 3 * 1024 * 1024, // 3MB (exceeds 2MB limit)
				type: 'audio/mpeg',
			} as File;

			await expect(
				uploadSound.execute({
					userId: 'user-1',
					file: mockFile,
				}),
			).rejects.toThrow('El archivo es demasiado grande. Máximo 2MB');
		});

		it('should throw error when user has reached sound limit', async () => {
			const existingSounds = Array.from({ length: 9 }, (_, i) =>
				Sound.create({
					id: `sound-${i}`,
					userId: 'user-1',
					name: `Sound ${i}`,
					url: `https://example.com/sound-${i}.mp3`,
					duration: 60,
				}),
			);

			vi.mocked(mockSoundRepository.listByUser).mockResolvedValue(
				existingSounds,
			);

			const mockFile = {
				name: 'new-sound.mp3',
				size: 1024 * 1024,
				type: 'audio/mpeg',
			} as File;

			await expect(
				uploadSound.execute({
					userId: 'user-1',
					file: mockFile,
				}),
			).rejects.toThrow('Has alcanzado el límite de 9 sonidos');
		});

		it('should throw error when storage is not available', async () => {
			const uploadSoundWithoutStorage = new UploadSound(
				mockSoundRepository,
				mockKeyRepository,
				// no storage provided
			);

			const mockFile = {
				name: 'test-sound.mp3',
				size: 1024 * 1024,
				type: 'audio/mpeg',
			} as File;

			vi.mocked(mockSoundRepository.listByUser).mockResolvedValue([]);

			await expect(
				uploadSoundWithoutStorage.execute({
					userId: 'user-1',
					file: mockFile,
				}),
			).rejects.toThrow('Storage no disponible para subir el archivo');
		});
	});

	describe('audio duration handling', () => {
		it('should handle file upload when Audio is not available', async () => {
			// Temporarily set Audio to undefined
			const originalAudio = (globalThis as Record<string, unknown>)
				.Audio as unknown;
			vi.stubGlobal('Audio', undefined as unknown as typeof Audio);

			const mockFile = {
				name: 'test-sound.mp3',
				size: 1024 * 1024,
				type: 'audio/mpeg',
			} as File;

			vi.mocked(mockSoundRepository.listByUser).mockResolvedValue([]);
			vi.mocked(mockKeyRepository.listByUser).mockResolvedValue([]);
			vi.mocked(mockStorage.uploadAndGetPublicUrl).mockResolvedValue(
				'https://example.com/uploaded-sound.mp3',
			);

			const result = await uploadSound.execute({
				userId: 'user-1',
				file: mockFile,
			});

			expect(result.sound.duration).toBe(1);

			// Restore Audio
			vi.stubGlobal('Audio', originalAudio as typeof Audio);
		});

		it('should handle file upload when audio loading fails', async () => {
			// Mock Audio to throw error
			const mockAudioError = vi.fn().mockImplementation(() => {
				throw new Error('Audio loading failed');
			});
			const originalAudio = (globalThis as Record<string, unknown>)
				.Audio as unknown;
			vi.stubGlobal('Audio', mockAudioError as unknown as typeof Audio);

			const mockFile = {
				name: 'test-sound.mp3',
				size: 1024 * 1024,
				type: 'audio/mpeg',
			} as File;

			vi.mocked(mockSoundRepository.listByUser).mockResolvedValue([]);
			vi.mocked(mockKeyRepository.listByUser).mockResolvedValue([]);
			vi.mocked(mockStorage.uploadAndGetPublicUrl).mockResolvedValue(
				'https://example.com/uploaded-sound.mp3',
			);

			const result = await uploadSound.execute({
				userId: 'user-1',
				file: mockFile,
			});

			expect(result.sound.duration).toBe(1); // fallback duration

			// Restore Audio
			vi.stubGlobal('Audio', originalAudio as typeof Audio);
		});
	});
});
