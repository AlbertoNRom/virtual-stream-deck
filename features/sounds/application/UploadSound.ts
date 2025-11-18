import { capitalizeAndRemoveExtension } from '@/shared/utils';
import { StreamDeckKey } from '../../streamdeck/domain/entities/StreamDeckKey';
import type { StreamDeckKeyRepository } from '../../streamdeck/domain/ports/StreamDeckKeyRepository';
import { Sound } from '../domain/entities/Sound';
import type { UserId } from '../domain/entities/Sound';
import type { SoundRepository } from '../domain/ports/SoundRepository';
import type { SoundStorage } from '../domain/ports/SoundStorage';

const MAX_SOUNDS_PER_USER = 9;
const MAX_SOUND_SIZE_MB = 1;
const MAX_SOUND_SIZE_BYTES = MAX_SOUND_SIZE_MB * 1024 * 1024;

export class UploadSound {
	constructor(
		private readonly sounds: SoundRepository,
		private readonly keys: StreamDeckKeyRepository,
		private readonly storage?: SoundStorage,
	) {}

	async execute(
		params:
			| {
					id: string;
					userId: UserId;
					name: string;
					url: string;
					duration: number;
			  }
			| { userId: UserId; file: File },
	): Promise<{ sound: Sound; key: StreamDeckKey }> {
		// Backward-compatible path: direct persisted sound
		if ('id' in params) {
			const sound = Sound.create({
				id: params.id,
				userId: params.userId,
				name: params.name,
				url: params.url,
				duration: params.duration,
			});

			await this.sounds.add(sound);
			const key = await this.createKeyForSound(
				params.userId,
				params.id,
				params.name,
			);
			return { sound, key };
		}

		// New path: full upload flow using storage
		const { userId, file } = params;

		if (file.size > MAX_SOUND_SIZE_BYTES) {
			throw new Error(
				`El archivo es demasiado grande. Máximo ${MAX_SOUND_SIZE_MB}MB`,
			);
		}

		const existingSounds = await this.sounds.listByUser(userId);
		if (existingSounds.length >= MAX_SOUNDS_PER_USER) {
			throw new Error(
				`Has alcanzado el límite de ${MAX_SOUNDS_PER_USER} sonidos`,
			);
		}

		if (!this.storage) {
			throw new Error('Storage no disponible para subir el archivo');
		}

		const publicUrl = await this.storage.uploadAndGetPublicUrl(userId, file);

		const name = capitalizeAndRemoveExtension(file.name);
		const duration = await this.getDuration(publicUrl);

		const soundId =
			globalThis.crypto?.randomUUID?.() ??
			`s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const sound = Sound.create({
			id: soundId,
			userId,
			name,
			url: publicUrl,
			duration,
		});

		await this.sounds.add(sound);
		const key = await this.createKeyForSound(userId, soundId, name);
		return { sound, key };
	}

	private async createKeyForSound(
		userId: UserId,
		soundId: string,
		label: string | null,
	) {
		const existingKeys = await this.keys.listByUser(userId);
		const highestPosition =
			existingKeys.length > 0
				? Math.max(...existingKeys.map((k) => k.position))
				: -1;
		const newPosition = highestPosition + 1;

		const keyId =
			globalThis.crypto?.randomUUID?.() ??
			`key-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const dynamicHotkey = `ctrl+${newPosition + 1}`.toLowerCase();

		const key = StreamDeckKey.create({
			id: keyId,
			userId,
			soundId,
			position: newPosition,
			label: label ?? null,
			color: '#FF5733',
			icon: null,
			hotkey: dynamicHotkey,
		});

		await this.keys.add(key);
		return key;
	}

	private async getDuration(publicUrl: string): Promise<number> {
		try {
			if (typeof Audio === 'undefined') return 1; // entorno no-browser
			const audio = new Audio(publicUrl);
			await new Promise<void>((resolve) => {
				audio.addEventListener('loadedmetadata', () => resolve(), {
					once: true,
				});
			});
			return Math.max(0.001, audio.duration); // evitar cero según constraint (>0)
		} catch {
			return 1;
		}
	}
}
