import type { SoundId, UserId } from '../../../sounds/domain/entities/Sound';
import type { StreamDeckKey } from '../entities/StreamDeckKey';

export interface StreamDeckKeyRepository {
	listByUser(userId: UserId): Promise<StreamDeckKey[]>;
	add(key: StreamDeckKey): Promise<void>;
	removeBySoundId(userId: UserId, soundId: SoundId): Promise<void>;
}
