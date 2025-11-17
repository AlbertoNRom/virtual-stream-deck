import type { StreamDeckKeyRepository } from '../../streamdeck/domain/ports/StreamDeckKeyRepository';
import type { SoundId, UserId } from '../domain/entities/Sound';
import type { SoundRepository } from '../domain/ports/SoundRepository';
import type { SoundStorage } from '../domain/ports/SoundStorage';

export class RemoveSound {
	constructor(
		private readonly sounds: SoundRepository,
		private readonly keys: StreamDeckKeyRepository,
		private readonly storage: SoundStorage,
	) {}

	async execute(params: { soundId: SoundId; userId: UserId }) {
		const sound = await this.sounds.findById(params.soundId);

		// Throw when sound not found (per service tests)
		if (!sound) throw new Error('Sound not found');

		// Authorization: only owner can remove
		if (sound.userId !== params.userId) {
			throw new Error('Unauthorized');
		}

		await this.sounds.remove(params.soundId, params.userId);

		// Cascade delete keys by soundId (in-memory or DB level)
		await this.keys.removeBySoundId(params.userId, params.soundId);

		// Delete from storage unless shared sample
		const url = sound.url;

		// If URL is empty, still attempt removal but ignore errors
		if (!url) {
			try {
				await this.storage.removeByPublicUrl(url);
			} catch {
				// ignore storage errors
			}
			return;
		}

		try {
			const parsed = new URL(url);
			const path = parsed.pathname;
			const marker = '/public/vsd-bucket/';
			if (path.includes(marker)) {
				const storagePath = path.split(marker)[1];
				if (!storagePath.startsWith('shared/')) {
					try {
						await this.storage.removeByPublicUrl(url);
					} catch {
						// ignore storage errors
					}
				}
			} else {
				// Non-supabase-style URL: attempt removal but ignore errors
				try {
					await this.storage.removeByPublicUrl(url);
				} catch {
					// ignore storage errors
				}
			}
		} catch {
			// Malformed URL: attempt removal but ignore errors
			try {
				await this.storage.removeByPublicUrl(url);
			} catch {
				// ignore storage errors
			}
		}
	}
}
