import type { SoundRow, StreamDeckKeyRow } from '@/db/supabase/schema';
import type { Sound } from '@/features/sounds/domain/entities/Sound';
import type { StreamDeckKey } from '@/features/streamdeck/domain/entities/StreamDeckKey';

export const soundToDb = (sound: Sound): SoundRow => {
	return {
		id: sound.id,
		user_id: sound.userId,
		name: sound.name,
		url: sound.url,
		duration: sound.duration,
		created_at: sound.createdAt,
	};
};

export const streamDeckKeyToDb = (key: StreamDeckKey): StreamDeckKeyRow => {
	return {
		id: key.id,
		user_id: key.userId,
		sound_id: key.soundId ?? null,
		position: key.position,
		label: key.label ?? null,
		color: key.color,
		icon: key.icon ?? null,
		hotkey: key.hotkey ?? null,
		created_at: key.createdAt,
	};
};
