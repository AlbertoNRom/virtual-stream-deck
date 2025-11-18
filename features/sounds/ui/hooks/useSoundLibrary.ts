import { createClient } from '@/db/supabase/client';
import type { StreamDeckKeyRow } from '@/db/supabase/schema';
import { soundToDb, streamDeckKeyToDb } from '@/shared/adapters';
import { createSoundService } from '@/shared/services/soundService';
import { useSoundStore } from '@/shared/store';
import { useCallback, useMemo, useState } from 'react';

export type SoundLibraryState = {
	isUploading: boolean;
	isRemoving: boolean;
};

export const useSoundLibrary = () => {
	const supabase = useMemo(() => createClient(), []);
	const soundService = useMemo(() => createSoundService(), []);

	const [isUploading, setIsUploading] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);

	const refreshKeys = useCallback(
		async (userId?: string) => {
			try {
				const uid = userId ?? '';
				const { setStreamDeckKeys } = useSoundStore.getState();
				const { data: keysData, error: keysError } = await supabase
					.from('stream_deck_keys')
					.select('*')
					.eq('user_id', uid)
					.order('position', { ascending: true });
				if (keysError)
					throw new Error('Failed to fetch stream deck keys', {
						cause: keysError,
					});
				setStreamDeckKeys(keysData ?? []);
			} catch (error) {
				throw new Error('Failed to refresh stream deck keys', {
					cause: error as Error,
				});
			}
		},
		[supabase],
	);

	const refreshSounds = useCallback(
		async (userId?: string) => {
			try {
				const uid = userId ?? '';
				const { setSounds } = useSoundStore.getState();
				const { data, error } = await supabase
					.from('sounds')
					.select('*')
					.eq('user_id', uid)
					.order('created_at', { ascending: false });
				if (error) throw new Error('Failed to fetch sounds', { cause: error });
				setSounds(data ?? []);
			} catch (error) {
				throw new Error('Failed to refresh sounds', { cause: error as Error });
			}
		},
		[supabase],
	);

	const loadInitialKeys = useCallback(async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		await refreshKeys(user?.id);
	}, [supabase, refreshKeys]);

	const upload = useCallback(
		async (file: File) => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user?.id) throw new Error('No authenticated user');
			const userId = user.id;

			setIsUploading(true);
			try {
				const result = await soundService.uploadSound.execute({ userId, file });

				const store = useSoundStore.getState();
				const uiSound = soundToDb(result.sound);
				store.addSound(uiSound);

				const uiKey = streamDeckKeyToDb(result.key);
				store.setStreamDeckKeys([...store.streamDeckKeys, uiKey]);

				await refreshSounds(userId);
				await refreshKeys(userId);
			} finally {
				setIsUploading(false);
			}
		},
		[supabase, soundService, refreshSounds, refreshKeys],
	);

	const remove = useCallback(
		async (soundId: string) => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user?.id) throw new Error('No authenticated user');

			setIsRemoving(true);
			try {
				await soundService.removeSound.execute({ soundId, userId: user.id });
				await refreshSounds(user.id);
				await refreshKeys(user.id);
			} finally {
				setIsRemoving(false);
			}
		},
		[supabase, soundService, refreshKeys, refreshSounds],
	);

	const reorderKeys = useCallback(
		async (updatedKeys: StreamDeckKeyRow[]) => {
			const { error } = await supabase
				.from('stream_deck_keys')
				.upsert(updatedKeys);
			if (error)
				throw new Error('Failed to save key positions', { cause: error });
			const { setStreamDeckKeys } = useSoundStore.getState();
			setStreamDeckKeys(updatedKeys);
		},
		[supabase],
	);

	const updateKey = useCallback(
		async (updatedKey: StreamDeckKeyRow) => {
			const { error } = await supabase
				.from('stream_deck_keys')
				.update(updatedKey)
				.eq('id', updatedKey.id);
			if (error) throw new Error('Failed to update key', { cause: error });

			const store = (useSoundStore.getState?.() ?? useSoundStore()) as {
				updateKey?: (k: StreamDeckKeyRow) => void;
			};
			store.updateKey?.(updatedKey);
		},
		[supabase],
	);

	const ensureKeyForSound = useCallback(
		async (soundId: string): Promise<StreamDeckKeyRow | null> => {
			const { sounds } = useSoundStore.getState();
			const sound = sounds.find((s) => s.id === soundId);
			let userId = sound?.user_id ?? null;

			if (!userId) {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				userId = user?.id ?? null;
			}
			if (!userId) return null;

			try {
				await soundService.ensureKeyForSound.execute({ soundId, userId });
			} catch (error) {
				throw new Error('Failed to ensure key for sound', {
					cause: error as Error,
				});
			}
			await refreshKeys(userId);

			const { streamDeckKeys } = useSoundStore.getState();
			const found = streamDeckKeys.find((k) => k.sound_id === soundId);
			return found ?? null;
		},
		[supabase, soundService, refreshKeys],
	);

	return {
		isUploading,
		isRemoving,
		loadInitialKeys,
		upload,
		remove,
		reorderKeys,
		updateKey,
		ensureKeyForSound,
	};
};
