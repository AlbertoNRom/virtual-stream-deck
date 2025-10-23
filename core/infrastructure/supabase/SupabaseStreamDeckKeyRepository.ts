import type { StreamDeckKeyRepository } from "../../domain/ports/StreamDeckKeyRepository";
import { StreamDeckKey } from "../../domain/entities/StreamDeckKey";
import type { SoundId, UserId } from "../../domain/entities/Sound";
import { createClient } from "@/utils/supabase/client";

export class SupabaseStreamDeckKeyRepository implements StreamDeckKeyRepository {
  private supabase = createClient();

  async listByUser(userId: UserId): Promise<StreamDeckKey[]> {
    const { data } = await this.supabase
      .from("stream_deck_keys")
      .select("id,user_id,sound_id,position,label,color,icon,hotkey,created_at")
      .eq("user_id", userId);
    return (data ?? []).map((d) =>
      StreamDeckKey.create({
        id: d.id,
        userId: d.user_id,
        soundId: d.sound_id,
        position: d.position,
        label: d.label,
        color: d.color,
        icon: d.icon,
        hotkey: d.hotkey,
        createdAt: d.created_at ? new Date(d.created_at) : new Date(),
      }),
    );
  }

  async add(key: StreamDeckKey): Promise<void> {
    await this.supabase
      .from("stream_deck_keys")
      .insert({
        id: key.id,
        user_id: key.userId,
        sound_id: key.soundId,
        position: key.position,
        label: key.label,
        color: key.color,
        icon: key.icon,
        hotkey: key.hotkey,
        created_at: key.createdAt.toISOString(),
      });
  }

  async removeBySoundId(userId: UserId, soundId: SoundId): Promise<void> {
    await this.supabase
      .from("stream_deck_keys")
      .delete()
      .eq("user_id", userId)
      .eq("sound_id", soundId);
  }
}