import { createClient } from "@/utils/supabase/client";
import type { StreamDeckKey } from "../../domain/entities/StreamDeckKey";
import { StreamDeckKey as DomainStreamDeckKey } from "../../domain/entities/StreamDeckKey";
import type { StreamDeckKeyRepository } from "../../domain/ports/StreamDeckKeyRepository";
import type { SoundId, UserId } from "../../domain/entities/Sound";

export class SupabaseStreamDeckKeyRepository implements StreamDeckKeyRepository {
  private supabase = createClient();

  async listByUser(userId: UserId): Promise<StreamDeckKey[]> {
    const { data } = await this.supabase
      .from("stream_deck_keys")
      .select("id,user_id,sound_id,position,label,color,icon,hotkey,created_at")
      .eq("user_id", userId);
    return (data ?? []).map((d) =>
      DomainStreamDeckKey.create({
        id: d.id,
        userId: d.user_id,
        soundId: d.sound_id ?? null,
        position: d.position,
        label: d.label ?? null,
        color: d.color,
        icon: d.icon ?? null,
        hotkey: d.hotkey ?? null,
        createdAt: new Date(d.created_at),
      })
    );
  }

  async add(key: StreamDeckKey): Promise<void> {
    const entity = key as DomainStreamDeckKey;
    const dto = {
      id: entity.id,
      user_id: entity.userId,
      sound_id: entity.soundId ?? null,
      position: entity.position,
      label: entity.label ?? null,
      color: entity.color,
      icon: entity.icon ?? null,
      hotkey: entity.hotkey ?? null,
      created_at: entity.createdAt.toISOString(),
    };
    await this.supabase.from("stream_deck_keys").insert(dto);
  }

  async removeBySoundId(userId: UserId, soundId: SoundId): Promise<void> {
    await this.supabase
      .from("stream_deck_keys")
      .delete()
      .eq("user_id", userId)
      .eq("sound_id", soundId);
  }
}