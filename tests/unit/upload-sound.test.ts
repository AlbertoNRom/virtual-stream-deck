import { describe, it, expect } from "vitest";
import { UploadSound } from "@/core/application/UploadSound";
import { InMemorySoundRepository } from "@/core/infrastructure/memory/InMemorySoundRepository";
import { InMemoryStreamDeckKeyRepository } from "@/core/infrastructure/memory/InMemoryStreamDeckKeyRepository";

describe("UploadSound", () => {
  it("persiste un sonido válido en el repositorio", async () => {
    const repo = new InMemorySoundRepository();
    const keys = new InMemoryStreamDeckKeyRepository();
    const useCase = new UploadSound(repo, keys);

    const params = {
      id: "s-100",
      userId: "user-100",
      name: "nombre",
      url: "https://example.com/public/vsd-bucket/user-100/nombre.mp3",
      duration: 2.5,
    };

    await useCase.execute(params);

    const found = await repo.findById(params.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(params.id);
    expect(found?.userId).toBe(params.userId);
    expect(found?.name).toBe(params.name);
    expect(found?.url).toBe(params.url);
    expect(found?.duration).toBe(params.duration);
  });

  it("valida duración no negativa", async () => {
    const repo = new InMemorySoundRepository();
    const keys = new InMemoryStreamDeckKeyRepository();
    const useCase = new UploadSound(repo, keys);
    await expect(
      useCase.execute({
        id: "s-err",
        userId: "user-err",
        name: "err",
        url: "https://example.com/public/vsd-bucket/user-err/err.mp3",
        duration: -1,
      }),
    ).rejects.toThrow();
  });
});