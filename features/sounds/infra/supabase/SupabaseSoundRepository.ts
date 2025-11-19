import { createClient } from '@/db/supabase/client';
import type { SoundId, UserId } from '../../domain/entities/Sound';
import { Sound } from '../../domain/entities/Sound';
import type { SoundRepository } from '../../domain/ports/SoundRepository';

export class SupabaseSoundRepository implements SoundRepository {
	private supabase = createClient();

	async findById(id: SoundId): Promise<Sound | null> {
		const { data, error } = await this.supabase
			.from('sounds')
			.select('id,user_id,name,url,duration,created_at')
			.eq('id', id)
			.single();
		if (error || !data) return null;
		return Sound.create({
			id: data.id,
			userId: data.user_id,
			name: data.name,
			url: data.url,
			duration: data.duration,
			createdAt: new Date(data.created_at),
		});
	}

	async listByUser(userId: UserId): Promise<Sound[]> {
		const { data } = await this.supabase
			.from('sounds')
			.select('id,user_id,name,url,duration,created_at')
			.eq('user_id', userId);
		return (data ?? []).map((d) =>
			Sound.create({
				id: d.id,
				userId: d.user_id,
				name: d.name,
				url: d.url,
				duration: d.duration,
				createdAt: new Date(d.created_at),
			}),
		);
	}

	async add(sound: Sound): Promise<void> {
		const entity = sound as Sound;
		const dto = {
			id: entity.id,
			user_id: entity.userId,
			name: entity.name,
			url: entity.url,
			duration: entity.duration,
			created_at: entity.createdAt.toISOString(),
		};
		await this.supabase.from('sounds').insert(dto);
	}

	async remove(id: SoundId, userId: UserId): Promise<void> {
		await this.supabase
			.from('sounds')
			.delete()
			.eq('id', id)
			.eq('user_id', userId);
	}
}
