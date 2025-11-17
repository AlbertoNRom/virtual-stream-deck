import type { SoundStorage } from "../../domain/ports/SoundStorage";

export class InMemorySoundStorage implements SoundStorage {
  removed: string[] = [];
  async removeByPublicUrl(publicUrl: string): Promise<void> {
    this.removed.push(publicUrl);
  }
  async uploadAndGetPublicUrl(userId: string, file: File): Promise<string> {
    return Promise.resolve(`https://example.com/${userId}/${file.name}`);
  }
}