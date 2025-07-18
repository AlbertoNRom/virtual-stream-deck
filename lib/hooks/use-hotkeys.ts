"use client";

import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSoundStore } from "@/lib/store";
import type { StreamDeckKey } from "@/lib/types";

export function useStreamDeckHotkeys() {
  const { streamDeckKeys, playSound } = useSoundStore();
  
  // Create a stable reference to all hotkey handlers
  useHotkeys(
    streamDeckKeys
      .filter((key): key is StreamDeckKey & { hotkey: string; sound_id: string } => 
        Boolean(key.hotkey && key.sound_id))
      .map(key => [key.hotkey, () => playSound(key.sound_id)]),
    // The deps array should only include the stringified version of the keys
    // to prevent unnecessary re-renders
    { enabled: true },
    [JSON.stringify(streamDeckKeys.map(key => ({ hotkey: key.hotkey, sound_id: key.sound_id })))]
  );
}