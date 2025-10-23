"use client";

import { useSoundStore } from "@/lib/store";
import type { StreamDeckKey } from "@/lib/types";
import { useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

// Function to normalize a hotkey
const  normalizeHotkey = (hotkey: string): string => {
  if (!hotkey) return '';
  return hotkey.toLowerCase().trim();
}

export const useStreamDeckHotkeys = () => {
  const { streamDeckKeys, playSound } = useSoundStore();
  const [registeredHotkeys, setRegisteredHotkeys] = useState<Array<{hotkey: string, soundId: string}>>([]);
  
  // Function to handle hotkey activation
  const handleHotkeyActivation = useCallback((soundId: string, hotkey: string) => {
    playSound(soundId);
  }, [playSound]);
  
  // Process hotkeys only once
  const validHotkeys = useMemo(() => {
    // Filter valid hotkeys (those with hotkey and sound_id)
    const validKeys = streamDeckKeys.filter(
      (key): key is StreamDeckKey & { hotkey: string; sound_id: string } => 
        Boolean(key.hotkey && key.sound_id)
    );
    
    // Normalize and map hotkeys
    const processed = validKeys.map(key => ({
      original: key.hotkey,
      normalized: normalizeHotkey(key.hotkey),
      soundId: key.sound_id,
      label: key.label || `Key ${key.position}`
    }));
    
    // Update the state of registered hotkeys for reference
    setRegisteredHotkeys(processed.map(p => ({ hotkey: p.normalized, soundId: p.soundId })));
    
    return processed;
  }, [streamDeckKeys]);
  
  // Create a string with all hotkeys to register them at once
  const allHotkeysString = useMemo(() => {
    const hotkeyString = validHotkeys.map(item => item.normalized).join(", ");
    return hotkeyString;
  }, [validHotkeys]);
  
  // Register a single handler for all hotkeys
  useHotkeys(
    allHotkeysString,
    (event, handler) => {
      // Build the pressed hotkey including modifiers
      const modifiers: string[] = [];
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.altKey) modifiers.push('alt');
      if (event.shiftKey) modifiers.push('shift');
      
      // Get the main key (last key pressed)
      const mainKey = handler.keys ? handler.keys[handler.keys.length - 1].toLowerCase() : '';
      
      // Build the complete hotkey
      const pressedHotkey = [...modifiers, mainKey].join('+');
      
      // Keep only essential functionality without debug logs
      
      // Find match
      const match = validHotkeys.find(item => item.normalized === pressedHotkey);
      
      if (match) {
        handleHotkeyActivation(match.soundId, match.normalized);
      } else {
        // No match found for the pressed hotkey
      }
    },
    {
      enabled: true,
      preventDefault: true,
      enableOnFormTags: true, // Allow hotkeys even in form fields
    },
    [validHotkeys, handleHotkeyActivation]
  );
  
  // No initialization verification effect needed
  
  // Return registered hotkeys for possible external use
  return registeredHotkeys;
}