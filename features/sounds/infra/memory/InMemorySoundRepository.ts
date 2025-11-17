import type { Sound, SoundId, UserId } from '../../domain/entities/Sound';
import type { SoundRepository } from '../../domain/ports/SoundRepository';

export class InMemorySoundRepository implements SoundRepository {
	private items = new Map<SoundId, Sound>();

	async findById(id: SoundId): Promise<Sound | null> {
		return this.items.get(id) ?? null;
	}

	async listByUser(userId: UserId): Promise<Sound[]> {
		return Array.from(this.items.values()).filter((s) => s.userId === userId);
	}

	async add(sound: Sound): Promise<void> {
		this.items.set(sound.id, sound);
	}

	async remove(id: SoundId, userId: UserId): Promise<void> {
		const s = this.items.get(id);
		if (!s) return;
		if (s.userId !== userId) return; // ignore unauthorized
		this.items.delete(id);
	}
}
