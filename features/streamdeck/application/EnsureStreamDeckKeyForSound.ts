import type { UserId } from '../../sounds/domain/entities/Sound';
import type { SoundRepository } from '../../sounds/domain/ports/SoundRepository';
import { StreamDeckKey } from '../domain/entities/StreamDeckKey';
import type { StreamDeckKeyRepository } from '../domain/ports/StreamDeckKeyRepository';

export class EnsureStreamDeckKeyForSound {
	constructor(
		private readonly sounds: SoundRepository,
		private readonly keys: StreamDeckKeyRepository,
	) {}

	async execute(params: { userId: UserId; soundId: string }) {
		const existingKeys = await this.keys.listByUser(params.userId);
		const existingForSound = existingKeys.find(
			(k) => k.soundId === params.soundId,
		);
		if (existingForSound) return existingForSound;

		// Try to get sound details only to set a friendly label; if not found, proceed anyway
		const sound = await this.sounds.findById(params.soundId);

		const highestPosition =
			existingKeys.length > 0
				? Math.max(...existingKeys.map((k) => k.position))
				: -1;
		const newPosition = highestPosition + 1;

		const keyId =
			crypto?.randomUUID?.() ??
			`key-${Date.now()}-${Math.random().toString(36).slice(2)}`;

		const key = StreamDeckKey.create({
			id: keyId,
			userId: params.userId,
			soundId: params.soundId,
			position: newPosition,
			label: sound?.name ?? null,
			color: '#FF5733',
			icon: null,
			hotkey: null,
		});

		await this.keys.add(key);
		return key;
	}
}
