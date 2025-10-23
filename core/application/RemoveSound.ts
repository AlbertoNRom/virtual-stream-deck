import type { SoundId, UserId } from "../domain/entities/Sound";
import type { SoundRepository } from "../domain/ports/SoundRepository";
import type { SoundStorage } from "../domain/ports/SoundStorage";
import type { StreamDeckKeyRepository } from "../domain/ports/StreamDeckKeyRepository";

export class RemoveSound {
  constructor(
    private readonly sounds: SoundRepository,
    private readonly keys: StreamDeckKeyRepository,
    private readonly storage: SoundStorage,
  ) {}

  async execute(params: { soundId: SoundId; userId: UserId }) {
    const sound = await this.sounds.findById(params.soundId);
    if (!sound) return; // idempotent

    await this.sounds.remove(params.soundId, params.userId);

    // Cascade delete keys by soundId (in-memory or DB level)
    await this.keys.removeBySoundId(params.userId, params.soundId);

    // Delete from storage unless shared sample
    const url = sound.url;
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split("/public/vsd-bucket/");
      if (pathParts.length > 1) {
        const storagePath = pathParts[1];
        if (!storagePath.includes("/shared/")) {
          await this.storage.removeByPublicUrl(url);
        }
      }
    } catch {
      // ignore malformed URL
    }
  }
}
