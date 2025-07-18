"use client";

import { create } from "zustand";
import { Howl } from "howler";
import type { Sound, StreamDeckKey, GridConfig } from "./types";

interface SoundStore {
  sounds: Sound[];
  streamDeckKeys: StreamDeckKey[];
  selectedKey: StreamDeckKey | null;
  gridConfig: GridConfig;
  audioInstances: Map<string, Howl>;
  setSounds: (sounds: Sound[]) => void;
  addSound: (sound: Sound) => void;
  removeSound: (id: string) => void;
  setStreamDeckKeys: (keys: StreamDeckKey[]) => void;
  updateKey: (key: StreamDeckKey) => void;
  setSelectedKey: (key: StreamDeckKey | null) => void;
  setGridConfig: (config: GridConfig) => void;
  playSound: (soundId: string) => void;
  stopSound: (soundId: string) => void;
  stopAllSounds: () => void;
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  sounds: [],
  streamDeckKeys: [],
  selectedKey: null,
  gridConfig: { rows: 1, columns: 3 },
  audioInstances: new Map(),

  setSounds: (sounds) => {
    // First, clean up existing instances
    const { audioInstances: currentInstances } = get();
    currentInstances.forEach((instance) => instance.unload());
    
    // Create new instances for the new sounds
    const newInstances = new Map<string, Howl>();
    sounds.forEach((sound) => {
      newInstances.set(
        sound.id,
        new Howl({
          src: [sound.url],
          html5: true,
          preload: true, // Consider preloading for better performance
          onloaderror: (id, error) => {
            console.error("Failed to load sound:", sound.id, error);
          },
        })
      );
    });

    set({ sounds, audioInstances: newInstances });
  },
  
  addSound: (sound) => {
    const audioInstance = new Howl({
      src: [sound.url],
      html5: true,
      onloaderror: (id, error) => {
        console.error("Failed to load sound:", sound.id, error);
      },
    });
    
    set((state) => ({
      sounds: [...state.sounds, sound],
      audioInstances: new Map(state.audioInstances).set(sound.id, audioInstance),
    }));
  },
  
  removeSound: (id) => {
    const { audioInstances } = get();
    const instance = audioInstances.get(id);
    if (instance) {
      instance.unload();
    }
    
    set((state) => {
      const newInstances = new Map(state.audioInstances);
      newInstances.delete(id);
      
      return {
        sounds: state.sounds.filter((s) => s.id !== id),
        audioInstances: newInstances,
      };
    });
  },
  
  setStreamDeckKeys: (keys) => set({ streamDeckKeys: keys }),
  
  updateKey: (key) => {
    set((state) => ({
      streamDeckKeys: state.streamDeckKeys.map((k) =>
        k.id === key.id ? key : k
      ),
    }));
  },
  
  setSelectedKey: (key) => set({ selectedKey: key }),
  
  setGridConfig: (config) => set({ gridConfig: config }),
  
  playSound: (soundId) => {
    const { audioInstances } = get();
    const instance = audioInstances.get(soundId);

    if (!instance) {
      console.warn("No audio instance found for sound:", soundId);
      return;
    }

    // Stop all other sounds before playing this one
    audioInstances.forEach((inst, id) => {
      if (id !== soundId && inst.playing()) {
        inst.stop();
      }
    });

    instance.play();
  },
  
  stopSound: (soundId) => {
    const { audioInstances } = get();
    const instance = audioInstances.get(soundId);
    if (instance) {
      instance.stop();
    }
  },

  stopAllSounds: () => {
    const { audioInstances } = get();
    audioInstances.forEach((instance) => {
      instance.stop();
    });
  },
}));