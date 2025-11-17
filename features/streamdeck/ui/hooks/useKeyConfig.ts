import { useSoundLibrary } from "@/features/sounds/ui/hooks/useSoundLibrary";
import type { Sound, StreamDeckKey } from "@/shared/types";
import { useCallback, useEffect, useState } from "react";

export interface KeyConfigState {
  config: StreamDeckKey | null;
  sounds: Sound[];
}

export interface KeyConfigEvents {
  setSoundId: (id: string) => void;
  setLabel: (label: string) => void;
  setColor: (color: string) => void;
  setHotkey: (hotkey: string) => void;
  save: () => Promise<{ ok: boolean; error?: string }>; 
}

export const useKeyConfig = (
  selectedKey: StreamDeckKey | null,
  sounds: Sound[],
  deps: { updateKey: (k: StreamDeckKey) => void }
): [KeyConfigState, KeyConfigEvents] => {
  const [config, setConfig] = useState<StreamDeckKey | null>(selectedKey);

  useEffect(() => {
    setConfig(selectedKey);
  }, [selectedKey]);

  const setSoundId = useCallback((id: string) => {
    setConfig((c) => (c ? { ...c, sound_id: id } : c));
  }, []);

  const setLabel = useCallback((label: string) => {
    setConfig((c) => (c ? { ...c, label } : c));
  }, []);

  const setColor = useCallback((color: string) => {
    setConfig((c) => (c ? { ...c, color } : c));
  }, []);

  const setHotkey = useCallback((hotkey: string) => {
    const normalized = hotkey.toLowerCase();
    setConfig((c) => (c ? { ...c, hotkey: normalized } : c));
  }, []);

  const { updateKey: persistKey } = useSoundLibrary();

  const save = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!config) return { ok: false, error: "No config" };
    try {
      // Actualiza el store de forma optimista para mantener la UI reactiva
      deps.updateKey(config);
      await persistKey(config);
      return { ok: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return { ok: false, error: message };
    }
  }, [config, deps, persistKey]);

  return [
    { config, sounds },
    { setSoundId, setLabel, setColor, setHotkey, save },
  ];
}
