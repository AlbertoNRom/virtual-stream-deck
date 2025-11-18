import { RemoveSound } from '@/features/sounds/application/RemoveSound';
import { UploadSound } from '@/features/sounds/application/UploadSound';
import { SupabaseSoundRepository } from '@/features/sounds/infra/supabase/SupabaseSoundRepository';
import { SupabaseSoundStorage } from '@/features/sounds/infra/supabase/SupabaseSoundStorage';
import { EnsureStreamDeckKeyForSound } from '@/features/streamdeck/application/EnsureStreamDeckKeyForSound';
import { SupabaseStreamDeckKeyRepository } from '@/features/streamdeck/infra/supabase/SupabaseStreamDeckKeyRepository';

export const createSoundService = () => {
	const repo = new SupabaseSoundRepository();
	const keys = new SupabaseStreamDeckKeyRepository();
	const storage = new SupabaseSoundStorage();

	return {
		uploadSound: new UploadSound(repo, keys, storage),
		removeSound: new RemoveSound(repo, keys, storage),
		ensureKeyForSound: new EnsureStreamDeckKeyForSound(repo, keys),
	};
};
