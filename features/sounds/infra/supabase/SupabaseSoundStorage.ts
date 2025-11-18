import { createClient } from '@/db/supabase/client';
import type { SoundStorage } from '../../domain/ports/SoundStorage';

export class SupabaseSoundStorage implements SoundStorage {
	private supabase = createClient();

	async removeByPublicUrl(publicUrl: string): Promise<void> {
		try {
			const url = new URL(publicUrl);
			const pathParts = url.pathname.split('/public/vsd-bucket/');
			if (pathParts.length <= 1) return;
			const storagePath = pathParts[1];
			await this.supabase.storage.from('vsd-bucket').remove([storagePath]);
		} catch {
			// ignore
		}
	}

	async uploadAndGetPublicUrl(userId: string, file: File): Promise<string> {
		const filename = `${userId}/${file.name}`;
		const { error: uploadError } = await this.supabase.storage
			.from('vsd-bucket')
			.upload(filename, file);
		if (uploadError)
			throw new Error('Failed to upload file to storage', { cause: uploadError });

		const {
			data: { publicUrl },
		} = this.supabase.storage.from('vsd-bucket').getPublicUrl(filename);

		if (!publicUrl)
			throw new Error('Failed to get public URL from storage', {
				cause: new Error('No public URL returned by storage'),
			});
		return publicUrl;
	}
}
