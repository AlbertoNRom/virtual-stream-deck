import { RemoveSound } from "@/core/application/RemoveSound";
import { Sound } from "@/core/domain/entities/Sound";
import { StreamDeckKey } from "@/core/domain/entities/StreamDeckKey";
import { InMemorySoundRepository } from "@/core/infrastructure/memory/InMemorySoundRepository";
import { InMemorySoundStorage } from "@/core/infrastructure/memory/InMemorySoundStorage";
import { InMemoryStreamDeckKeyRepository } from "@/core/infrastructure/memory/InMemoryStreamDeckKeyRepository";
import { describe, expect, it } from "vitest";

describe("RemoveSound", () => {
  it("Elimina sonido y claves asociadas, y borra en storage si no es compartido", async () => {
    const sounds = new InMemorySoundRepository();
    const keys = new InMemoryStreamDeckKeyRepository();
    const storage = new InMemorySoundStorage();
    const useCase = new RemoveSound(sounds, keys, storage);

    const userId = "user-1";
    const sound = Sound.create({
      id: "s-1",
      userId,
      name: "test",
      url: "https://example.com/storage/v1/object/public/vsd-bucket/user-1/test.mp3",
      duration: 1,
    });
    await sounds.add(sound);

    const key = StreamDeckKey.create({
      id: "k-1",
      userId,
      soundId: sound.id,
      position: 0,
      label: "test",
      color: "#fff",
      icon: null,
      hotkey: "ctrl+1",
    });
    await keys.add(key);

    await useCase.execute({ soundId: sound.id, userId });

    expect(await sounds.findById(sound.id)).toBeNull();
    expect(await keys.listByUser(userId)).toHaveLength(0);
    expect(storage.removed[0]).toContain("test.mp3");
  });

  it("No borra en storage si es sample compartido", async () => {
    const sounds = new InMemorySoundRepository();
    const keys = new InMemoryStreamDeckKeyRepository();
    const storage = new InMemorySoundStorage();
    const useCase = new RemoveSound(sounds, keys, storage);

    const userId = "user-1";
    const sound = Sound.create({
      id: "s-2",
      userId,
      name: "shared",
      url: "https://example.com/storage/v1/object/public/vsd-bucket/shared/sample.mp3",
      duration: 1,
    });
    await sounds.add(sound);

    await useCase.execute({ soundId: sound.id, userId });

    expect(storage.removed).toHaveLength(0);
  });
});