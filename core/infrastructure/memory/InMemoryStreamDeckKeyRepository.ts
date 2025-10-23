import type { StreamDeckKeyRepository } from "../../domain/ports/StreamDeckKeyRepository";
import type { StreamDeckKey } from "../../domain/entities/StreamDeckKey";
import type { SoundId, UserId } from "../../domain/entities/Sound";

export class InMemoryStreamDeckKeyRepository implements StreamDeckKeyRepository {
  private items: StreamDeckKey[] = [];

  async add(item: StreamDeckKey): Promise<void> {
    this.items.push(item);
  }

  async listByUser(userId: UserId): Promise<StreamDeckKey[]> {
    return this.items.filter((k) => k.userId === userId);
  }

  async removeBySoundId(userId: UserId, soundId: SoundId): Promise<void> {
    this.items = this.items.filter((k) => !(k.userId === userId && k.soundId === soundId));
  }
}