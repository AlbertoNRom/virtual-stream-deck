import { createClient } from "@/utils/supabase/client";
import type { Sound, SoundId, UserId } from "../../domain/entities/Sound";
import { Sound as DomainSound } from "../../domain/entities/Sound";
import type { SoundRepository } from "../../domain/ports/SoundRepository";

export class SupabaseSoundRepository implements SoundRepository {
  private supabase = createClient();

  async findById(id: SoundId): Promise<Sound | null> {
    const { data, error } = await this.supabase
      .from("sounds")
      .select("id,user_id,name,url,duration,created_at")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return DomainSound.create({
      id: data.id,
      userId: data.user_id,
      name: data.name,
      url: data.url,
      duration: data.duration,
      createdAt: data.created_at ? new Date(data.created_at) : new Date()
    });
  }

  async listByUser(userId: UserId): Promise<Sound[]> {
    const { data } = await this.supabase
      .from("sounds")
      .select("id,user_id,name,url,duration,created_at")
      .eq("user_id", userId);
    return (data ?? []).map((d) =>
      DomainSound.create({
        id: d.id,
        userId: d.user_id,
        name: d.name,
        url: d.url,
        duration: d.duration,
        createdAt: d.created_at ? new Date(d.created_at) : new Date()
      }),
    );
  }

  async add(sound: Sound): Promise<void> {
    await this.supabase.from("sounds").insert({
      id: sound.id,
      user_id: sound.userId,
      name: sound.name,
      url: sound.url,
      duration: sound.duration,
      created_at: sound.createdAt.toISOString()
    });
  }

  async remove(id: SoundId, userId: UserId): Promise<void> {
    await this.supabase.from("sounds").delete().eq("id", id).eq("user_id", userId);
  }
}