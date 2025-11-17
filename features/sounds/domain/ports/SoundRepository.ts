import type { Sound, SoundId, UserId } from '../entities/Sound';

export interface SoundRepository {
	findById(id: SoundId): Promise<Sound | null>;
	listByUser(userId: UserId): Promise<Sound[]>;
	add(sound: Sound): Promise<void>;
	remove(id: SoundId, userId: UserId): Promise<void>;
}
