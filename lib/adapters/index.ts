import type { Sound as UISound, StreamDeckKey as UIStreamDeckKey } from "@/lib/types";
import type { Sound as DomainSound } from "@/core/domain/entities/Sound";
import type { StreamDeckKey as DomainStreamDeckKey } from "@/core/domain/entities/StreamDeckKey";

export function domainSoundToUi(sound: DomainSound): UISound {
  return {
    id: sound.id,
    user_id: sound.userId,
    name: sound.name,
    url: sound.url,
    duration: sound.duration,
    created_at: sound.createdAt.toISOString(),
  };
}

export function domainStreamDeckKeyToUi(key: DomainStreamDeckKey): UIStreamDeckKey {
  return {
    id: key.id,
    user_id: key.userId,
    sound_id: key.soundId ?? null,
    position: key.position,
    label: key.label ?? null,
    color: key.color,
    icon: key.icon ?? null,
    hotkey: key.hotkey ?? null,
    created_at: key.createdAt.toISOString(),
  };
}