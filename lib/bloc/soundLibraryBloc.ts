import { EnsureStreamDeckKeyForSound } from "@/core/application/EnsureStreamDeckKeyForSound";
import { RemoveSound } from "@/core/application/RemoveSound";
import { UploadSound } from "@/core/application/UploadSound";
import { SupabaseSoundRepository } from "@/core/infrastructure/supabase/SupabaseSoundRepository";
import { SupabaseSoundStorage } from "@/core/infrastructure/supabase/SupabaseSoundStorage";
import { SupabaseStreamDeckKeyRepository } from "@/core/infrastructure/supabase/SupabaseStreamDeckKeyRepository";
import { useSoundStore } from "@/lib/store";
import type { StreamDeckKey } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useMemo, useState } from "react";

export type SoundLibraryState = {
  isUploading: boolean;
  isRemoving: boolean;
};

export class SoundLibraryBloc {
  private supabase = createClient();
  private soundService = (() => {
    const soundRepo = new SupabaseSoundRepository();
    const keyRepo = new SupabaseStreamDeckKeyRepository();
    const storage = new SupabaseSoundStorage();
    return {
      uploadSound: new UploadSound(soundRepo, keyRepo, storage),
      removeSound: new RemoveSound(soundRepo, keyRepo, storage),
      ensureKeyForSound: new EnsureStreamDeckKeyForSound(soundRepo, keyRepo),
    };
  })();
  private listeners: ((state: SoundLibraryState) => void)[] = [];
  private isUploading = false;
  private isRemoving = false;

  subscribe(listener: (state: SoundLibraryState) => void) {
    this.listeners.push(listener);
    listener({ isUploading: this.isUploading, isRemoving: this.isRemoving });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit() {
    const state = { isUploading: this.isUploading, isRemoving: this.isRemoving };
    for (const l of this.listeners) l(state);
  }

  // Centralized refresh for Stream Deck keys
  private async refreshKeys(userId: string | undefined) {
    const uid = userId ?? "";
    const { setStreamDeckKeys } = useSoundStore.getState();
    const { data: keysData, error: keysError } = await this.supabase
      .from("stream_deck_keys")
      .select("*")
      .eq("user_id", uid)
      .order("position", { ascending: true });
    if (keysError) throw keysError;
    setStreamDeckKeys(keysData ?? []);
  }

  // Refresh sounds list for the current user
  private async refreshSounds(userId: string | undefined) {
    const uid = userId ?? "";
    const { setSounds } = useSoundStore.getState();
    const { data, error } = await this.supabase
      .from("sounds")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) throw error;
    setSounds(data ?? []);
  }

  // Public: initial keys load for UI components
  async loadInitialKeys() {
    const { data: { user } } = await this.supabase.auth.getUser();
    const uid = user?.id;
    await this.refreshKeys(uid);
  }

  async upload(file: File) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user?.id) throw new Error("No authenticated user");
    const userId = user.id;

    try {
      this.isUploading = true;
      this.emit();

      const result = await this.soundService.uploadSound.execute({ userId, file });

      // Actualiza el store inmediatamente para feedback rápido
      const store = useSoundStore.getState();
      const uiSound = {
        id: result.sound.id,
        user_id: result.sound.userId,
        name: result.sound.name,
        url: result.sound.url,
        duration: result.sound.duration,
        created_at: result.sound.createdAt.toISOString(),
      };
      store.addSound(uiSound);

      const uiKey = {
        id: result.key.id,
        user_id: result.key.userId,
        sound_id: result.key.soundId,
        position: result.key.position,
        label: result.key.label,
        color: result.key.color,
        icon: result.key.icon,
        hotkey: result.key.hotkey,
        created_at: result.key.createdAt.toISOString(),
      };
      store.setStreamDeckKeys([...store.streamDeckKeys, uiKey]);

      // Refresca desde BD para asegurar estado persistido
      await this.refreshSounds(userId);
      await this.refreshKeys(userId);
    } finally {
      this.isUploading = false;
      this.emit();
    }
  }

  async remove(soundId: string) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user?.id) throw new Error("No authenticated user");
    const userId = user.id;

    try {
      this.isRemoving = true;
      this.emit();

      await this.soundService.removeSound.execute({ soundId, userId });

      // Refresh lists after removal
      await this.refreshSounds(userId);
      await this.refreshKeys(userId);
    } finally {
      this.isRemoving = false;
      this.emit();
    }
  }

  // New: reorder keys and persist positions
  async reorderKeys(updatedKeys: StreamDeckKey[]) {
    const { error } = await this.supabase
      .from("stream_deck_keys")
      .upsert(updatedKeys);
    if (error) throw error;

    const { setStreamDeckKeys } = useSoundStore.getState();
    setStreamDeckKeys(updatedKeys);
  }

  // New: update a single key (label/color/hotkey/sound_id)
  async updateKey(updatedKey: StreamDeckKey) {
    const { error } = await this.supabase
      .from("stream_deck_keys")
      .update(updatedKey)
      .eq("id", updatedKey.id);
    if (error) throw error;

    const store = (useSoundStore.getState?.() ?? useSoundStore()) as {
      updateKey?: (k: StreamDeckKey) => void;
    };
    store.updateKey?.(updatedKey);
  }

  async ensureKeyForSound(soundId: string): Promise<StreamDeckKey | null> {
    // Try to infer userId from the sound list to avoid relying solely on auth
    const { sounds } = useSoundStore.getState();
    const sound = sounds.find((s) => s.id === soundId);
    let userId = sound?.user_id ?? null;

    if (!userId) {
      const { data: { user } } = await this.supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    if (!userId) return null;

    await this.soundService.ensureKeyForSound.execute({
      soundId,
      userId,
    });

    // After ensuring/creating, refresh keys list in the store
    await this.refreshKeys(userId);

    // Map back to UI type from DB list (the refresh updates store)
    const { streamDeckKeys } = useSoundStore.getState();
    const found = streamDeckKeys.find((k) => k.sound_id === soundId);
    return found ?? null;
  }
}

// Hook React dependiente (sin patrón observer)
export function useSoundLibraryBloc() {
  const supabase = useMemo(() => createClient(), []);
  const soundService = useMemo(() => {
    const soundRepo = new SupabaseSoundRepository();
    const keyRepo = new SupabaseStreamDeckKeyRepository();
    const storage = new SupabaseSoundStorage();
    return {
      uploadSound: new UploadSound(soundRepo, keyRepo, storage),
      removeSound: new RemoveSound(soundRepo, keyRepo, storage),
      ensureKeyForSound: new EnsureStreamDeckKeyForSound(soundRepo, keyRepo),
    };
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const refreshKeys = useCallback(async (userId?: string) => {
    const uid = userId ?? "";
    const { setStreamDeckKeys } = useSoundStore.getState();
    const { data: keysData, error: keysError } = await supabase
      .from("stream_deck_keys")
      .select("*")
      .eq("user_id", uid)
      .order("position", { ascending: true });
    if (keysError) throw keysError;
    setStreamDeckKeys(keysData ?? []);
  }, [supabase]);

  const refreshSounds = useCallback(async (userId?: string) => {
    const uid = userId ?? "";
    const { setSounds } = useSoundStore.getState();
    const { data, error } = await supabase
      .from("sounds")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) throw error;
    setSounds(data ?? []);
  }, [supabase]);

  const loadInitialKeys = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await refreshKeys(user?.id);
  }, [supabase, refreshKeys]);

  const upload = useCallback(async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error("No authenticated user");
    const userId = user.id;

    setIsUploading(true);
    try {
      const result = await soundService.uploadSound.execute({ userId, file });

      const store = useSoundStore.getState();
      const uiSound = {
        id: result.sound.id,
        user_id: result.sound.userId,
        name: result.sound.name,
        url: result.sound.url,
        duration: result.sound.duration,
        created_at: result.sound.createdAt.toISOString(),
      };
      store.addSound(uiSound);

      const uiKey = {
        id: result.key.id,
        user_id: result.key.userId,
        sound_id: result.key.soundId,
        position: result.key.position,
        label: result.key.label,
        color: result.key.color,
        icon: result.key.icon,
        hotkey: result.key.hotkey,
        created_at: result.key.createdAt.toISOString(),
      };
      store.setStreamDeckKeys([...store.streamDeckKeys, uiKey]);

      await refreshSounds(userId);
      await refreshKeys(userId);
    } finally {
      setIsUploading(false);
    }
  }, [supabase, soundService, refreshSounds, refreshKeys]);

  const remove = useCallback(async (soundId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error("No authenticated user");

    setIsRemoving(true);
    try {
      await soundService.removeSound.execute({ soundId, userId: user.id });
      await refreshSounds(user.id);
      await refreshKeys(user.id);
    } finally {
      setIsRemoving(false);
    }
  }, [supabase, soundService, refreshKeys, refreshSounds]);

  const reorderKeys = useCallback(async (updatedKeys: StreamDeckKey[]) => {
    const { error } = await supabase
      .from("stream_deck_keys")
      .upsert(updatedKeys);
    if (error) throw error;
    const { setStreamDeckKeys } = useSoundStore.getState();
    setStreamDeckKeys(updatedKeys);
  }, [supabase]);

  const updateKey = useCallback(async (updatedKey: StreamDeckKey) => {
    const { error } = await supabase
      .from("stream_deck_keys")
      .update(updatedKey)
      .eq("id", updatedKey.id);
    if (error) throw error;

    const store = (useSoundStore.getState?.() ?? useSoundStore()) as {
      updateKey?: (k: StreamDeckKey) => void;
    };
    store.updateKey?.(updatedKey);
  }, [supabase]);

  const ensureKeyForSound = useCallback(async (soundId: string): Promise<StreamDeckKey | null> => {
    const { sounds } = useSoundStore.getState();
    const sound = sounds.find((s) => s.id === soundId);
    let userId = sound?.user_id ?? null;

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }
    if (!userId) return null;

    await soundService.ensureKeyForSound.execute({ soundId, userId });
    await refreshKeys(userId);

    const { streamDeckKeys } = useSoundStore.getState();
    const found = streamDeckKeys.find((k) => k.sound_id === soundId);
    return found ?? null;
  }, [supabase, soundService, refreshKeys]);

  return {
    isUploading,
    isRemoving,
    loadInitialKeys,
    upload,
    remove,
    reorderKeys,
    updateKey,
    ensureKeyForSound,
  };
}
