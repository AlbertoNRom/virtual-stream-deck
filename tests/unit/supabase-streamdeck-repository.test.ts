import { StreamDeckKey } from '@/features/streamdeck/domain/entities/StreamDeckKey';
import { SupabaseStreamDeckKeyRepository } from '@/features/streamdeck/infra/supabase/SupabaseStreamDeckKeyRepository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock del cliente de Supabase
const mockSupabaseClient = {
	from: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	eq: vi.fn().mockReturnThis(),
	insert: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
};

vi.mock('@/db/supabase/client', () => ({
	createClient: () => mockSupabaseClient,
}));

describe('SupabaseStreamDeckKeyRepository', () => {
	let repository: SupabaseStreamDeckKeyRepository;

	beforeEach(() => {
		repository = new SupabaseStreamDeckKeyRepository();
		vi.clearAllMocks();
	});

	describe('listByUser', () => {
		it('should return list of stream deck keys for user', async () => {
			const mockData = [
				{
					id: 'key-1',
					user_id: 'user-1',
					sound_id: 'sound-1',
					position: 0,
					label: 'Key 1',
					color: '#FF5733',
					icon: null,
					hotkey: 'ctrl+1',
					created_at: '2024-01-01T00:00:00Z',
				},
				{
					id: 'key-2',
					user_id: 'user-1',
					sound_id: null,
					position: 1,
					label: null,
					color: '#333333',
					icon: null,
					hotkey: null,
					created_at: '2024-01-02T00:00:00Z',
				},
			];

			mockSupabaseClient.eq.mockResolvedValue({
				data: mockData,
				error: null,
			});

			const result = await repository.listByUser('user-1');

			expect(mockSupabaseClient.from).toHaveBeenCalledWith('stream_deck_keys');
			expect(mockSupabaseClient.select).toHaveBeenCalledWith(
				'id,user_id,sound_id,position,label,color,icon,hotkey,created_at',
			);
			expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1');
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(StreamDeckKey);
			expect(result[0].id).toBe('key-1');
			expect(result[0].soundId).toBe('sound-1');
			expect(result[1].id).toBe('key-2');
			expect(result[1].soundId).toBeNull();
		});

		it('should return empty array when no keys found', async () => {
			mockSupabaseClient.eq.mockResolvedValue({
				data: null,
				error: null,
			});

			const result = await repository.listByUser('user-1');

			expect(result).toEqual([]);
		});
	});

	describe('add', () => {
		it('should add a stream deck key to the database', async () => {
			const key = StreamDeckKey.create({
				id: 'key-1',
				userId: 'user-1',
				soundId: 'sound-1',
				position: 0,
				label: 'Test Key',
				color: '#FF5733',
				icon: null,
				hotkey: 'ctrl+1',
				createdAt: new Date('2024-01-01T00:00:00Z'),
			});

			mockSupabaseClient.insert.mockResolvedValue({
				data: null,
				error: null,
			});

			await repository.add(key);

			expect(mockSupabaseClient.from).toHaveBeenCalledWith('stream_deck_keys');
			expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
				id: 'key-1',
				user_id: 'user-1',
				sound_id: 'sound-1',
				position: 0,
				label: 'Test Key',
				color: '#FF5733',
				icon: null,
				hotkey: 'ctrl+1',
				created_at: key.createdAt.toISOString(),
			});
		});

		it('should handle null values correctly', async () => {
			const key = StreamDeckKey.create({
				id: 'key-2',
				userId: 'user-1',
				soundId: null,
				position: 1,
				label: null,
				color: '#333333',
				icon: null,
				hotkey: null,
				createdAt: new Date('2024-01-01T00:00:00Z'),
			});

			mockSupabaseClient.insert.mockResolvedValue({
				data: null,
				error: null,
			});

			await repository.add(key);

			expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
				id: 'key-2',
				user_id: 'user-1',
				sound_id: null,
				position: 1,
				label: null,
				color: '#333333',
				icon: null,
				hotkey: null,
				created_at: key.createdAt.toISOString(),
			});
		});
	});

	describe('removeBySoundId', () => {
		it('should remove stream deck keys by sound id', async () => {
			mockSupabaseClient.eq
				.mockImplementationOnce(() => mockSupabaseClient)
				.mockResolvedValueOnce({
					data: null,
					error: null,
				});

			await repository.removeBySoundId('user-1', 'sound-1');

			expect(mockSupabaseClient.from).toHaveBeenCalledWith('stream_deck_keys');
			expect(mockSupabaseClient.delete).toHaveBeenCalled();
			expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1');
			expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sound_id', 'sound-1');
		});
	});
});
