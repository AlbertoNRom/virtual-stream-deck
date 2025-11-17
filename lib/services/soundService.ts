import { RemoveSound } from "@/core/application/RemoveSound";
import { UploadSound } from "@/core/application/UploadSound";
import { EnsureStreamDeckKeyForSound } from "@/core/application/EnsureStreamDeckKeyForSound";
import { SupabaseSoundRepository } from "@/core/infrastructure/supabase/SupabaseSoundRepository";
import { SupabaseSoundStorage } from "@/core/infrastructure/supabase/SupabaseSoundStorage";
import { SupabaseStreamDeckKeyRepository } from "@/core/infrastructure/supabase/SupabaseStreamDeckKeyRepository";

export function createSoundService() {
  const repo = new SupabaseSoundRepository();
  const keys = new SupabaseStreamDeckKeyRepository();
  const storage = new SupabaseSoundStorage();

  return {
    uploadSound: new UploadSound(repo, keys),
    removeSound: new RemoveSound(repo, keys, storage),
    ensureKeyForSound: new EnsureStreamDeckKeyForSound(repo, keys),
  };
}