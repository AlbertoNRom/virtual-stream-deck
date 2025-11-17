import { Sound } from '@/features/sounds/domain/entities/Sound';
import { SupabaseSoundRepository } from '@/features/sounds/infra/supabase/SupabaseSoundRepository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock del cliente de Supabase
const mockSupabaseClient = {
	from: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	eq: vi.fn().mockReturnThis(),
	single: vi.fn(),
	insert: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
};

vi.mock('@/db/supabase/client', () => ({
	createClient: () => mockSupabaseClient,
}));

describe('SupabaseSoundRepository', () => {
	let repository: SupabaseSoundRepository;

	beforeEach(() => {
		repository = new SupabaseSoundRepository();
		vi.clearAllMocks();
	});

	describe('findById', () => {
		it('should return a sound when found', async () => {
			const mockData = {
				id: 'sound-1',
				user_id: 'user-1',
				name: 'Test Sound',
				url: 'https://example.com/sound.mp3',
				duration: 5.5,
				created_at: '2024-01-01T00:00:00Z',
			};

			mockSupabaseClient.single.mockResolvedValue({
				data: mockData,
				error: null,
			});

			const result = await repository.findById('sound-1');

			expect(mockSupabaseClient.from).toHaveBeenCalledWith('sounds');
			expect(mockSupabaseClient.select).toHaveBeenCalledWith(
				'id,user_id,name,url,duration,created_at',
			);
			expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'sound-1');
			expect(result).toBeInstanceOf(Sound);
			expect(result?.id).toBe('sound-1');
			expect(result?.name).toBe('Test Sound');
			expect(result?.userId).toBe('user-1');
		});

		it('should return null when sound not found', async () => {
			mockSupabaseClient.single.mockResolvedValue({
				data: null,
				error: { message: 'Not found' },
			});

			const result = await repository.findById('nonexistent');

			expect(result).toBeNull();
		});

		it('should return null when error occurs', async () => {
			mockSupabaseClient.single.mockResolvedValue({
				data: null,
				error: { message: 'Database error' },
			});

			const result = await repository.findById('sound-1');

			expect(result).toBeNull();
		});
	});

	describe('listByUser', () => {
		it('should return list of sounds for user', async () => {
			const mockData = [
				{
					id: 'sound-1',
					user_id: 'user-1',
					name: 'Sound 1',
					url: 'https://example.com/sound1.mp3',
					duration: 3.2,
					created_at: '2024-01-01T00:00:00Z',
				},
				{
					id: 'sound-2',
					user_id: 'user-1',
					name: 'Sound 2',
					url: 'https://example.com/sound2.mp3',
					duration: 4.1,
					created_at: '2024-01-02T00:00:00Z',
				},
			];

			mockSupabaseClient.eq.mockResolvedValue({
				data: mockData,
				error: null,
			});

			const result = await repository.listByUser('user-1');

			expect(mockSupabaseClient.from).toHaveBeenCalledWith('sounds');
			expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1');
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(Sound);
			expect(result[0].id).toBe('sound-1');
			expect(result[1].id).toBe('sound-2');
		});

		it('should return empty array when no sounds found', async () => {
			mockSupabaseClient.eq.mockResolvedValue({
				data: null,
				error: null,
			});

			const result = await repository.listByUser('user-1');

			expect(result).toEqual([]);
		});
	});

	describe('add', () => {
		it('should add a sound to the database', async () => {
			const sound = Sound.create({
				id: 'sound-1',
				userId: 'user-1',
				name: 'Test Sound',
				url: 'https://example.com/sound.mp3',
				duration: 5.5,
				createdAt: new Date('2024-01-01T00:00:00Z'),
			});

			mockSupabaseClient.insert.mockResolvedValue({
				data: null,
				error: null,
			});

			await repository.add(sound);

			expect(mockSupabaseClient.from).toHaveBeenCalledWith('sounds');
			expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
				id: 'sound-1',
				user_id: 'user-1',
				name: 'Test Sound',
				url: 'https://example.com/sound.mp3',
				duration: 5.5,
				created_at: sound.createdAt.toISOString(),
			});
		});

		it('should throw error when insert fails', async () => {
			const sound = Sound.create({
				id: 'sound-1',
				userId: 'user-1',
				name: 'Test Sound',
				url: 'https://example.com/sound.mp3',
				duration: 5.5,
				createdAt: new Date(),
			});

			mockSupabaseClient.insert.mockRejectedValue(new Error('Insert failed'));

			await expect(repository.add(sound)).rejects.toThrow('Insert failed');
		});
	});

	describe('remove', () => {
		it('should remove a sound from the database', async () => {
			mockSupabaseClient.eq
				.mockImplementationOnce(() => mockSupabaseClient)
				.mockResolvedValueOnce({
					data: null,
					error: null,
				});

			await repository.remove('sound-1', 'user-1');

			expect(mockSupabaseClient.from).toHaveBeenCalledWith('sounds');
			expect(mockSupabaseClient.delete).toHaveBeenCalled();
			expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'sound-1');
			expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1');
		});

		it('should throw error when delete fails', async () => {
			mockSupabaseClient.eq
				.mockImplementationOnce(() => mockSupabaseClient)
				.mockRejectedValueOnce(new Error('Delete failed'));

			await expect(repository.remove('sound-1', 'user-1')).rejects.toThrow(
				'Delete failed',
			);
		});
	});
});
